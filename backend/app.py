# app.py - Enhanced AI Chatbot Backend with File Processing
from ast import Import
import os
import base64
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, json, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, JWTManager, decode_token
import mysql.connector
from passlib.hash import pbkdf2_sha256 as sha256
from werkzeug.utils import secure_filename
from datetime import datetime
import mimetypes
import PyPDF2
from PIL import Image
import io
import json
import docx

load_dotenv()

# --- CONFIGURATIONS ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}})
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError("JWT_SECRET_KEY env variable is not set!")
app.config["UPLOAD_FOLDER"] = os.path.join(os.getcwd(), "uploads")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

jwt = JWTManager(app)

# --- Gemini AI Configuration ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- Database Configuration ---
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'your_password'),
    'database': os.getenv('DB_NAME', 'chatbot_db')
}

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt', 'docx', 'doc'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    return mysql.connector.connect(**db_config)

def validate_token(token):
    """Manually validate JWT token"""
    try:
        decoded_token = decode_token(token)
        return decoded_token['sub']
    except Exception as e:
        print(f"Token validation error: {e}")
        return None

def process_pdf_file(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text[:10000]  # Limit text length
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return None
    

import docx  # add this import at the top with others

def process_docx_file(file_path):
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)[:10000]  # Limit text length if needed
    except Exception as e:
        print(f"Error processing DOCX: {e}")
        return None


def process_txt_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()[:10000]  # Limit if needed
    except Exception as e:
        print(f"Error processing TXT: {e}")
        return None

def process_image_with_gemini(image_path, user_message):
    """Process image using Gemini Vision API"""
    try:
        # Read and encode image
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()

        # Get mime type
        mime_type, _ = mimetypes.guess_type(image_path)

        # Use Gemini to analyze image
        model = genai.GenerativeModel('gemini-1.5-flash')

        image_part = {
            "mime_type": mime_type,
            "data": base64.b64encode(image_data).decode()
        }

        prompt = f"User message: {user_message}\n\nPlease analyze this image and provide a detailed response."

        response = model.generate_content([
            prompt,
            {"inline_data": image_part}
        ])

        return response.text
    except Exception as e:
        print(f"Error processing image with Gemini: {e}")
        return "I couldn't process the image. Please try again."

def process_pdf_with_gemini(pdf_path, user_message):
    """Process PDF using Gemini"""
    try:
        # Upload PDF to Gemini Files API
        uploaded_file = genai.upload_file(pdf_path)

        # Wait for file to be processed
        import time
        while uploaded_file.state.name == "PROCESSING":
            print("Processing PDF...")
            time.sleep(2)
            uploaded_file = genai.get_file(uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
            return "Failed to process PDF file."

        # Generate content using the uploaded file
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"User message: {user_message}\n\nPlease analyze this PDF document and provide a detailed response."

        response = model.generate_content([uploaded_file, prompt])

        # Clean up uploaded file
        genai.delete_file(uploaded_file.name)

        return response.text
    except Exception as e:
        print(f"Error processing PDF with Gemini: {e}")
        return "I couldn't process the PDF. Please try again."

# --- ROUTES ---
@app.route('/')
def index():
    return jsonify({"message": "AI Chatbot Backend with File Processing", "status": "running"})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters"}), 400

    password_hash = sha256.hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, email, created_at) VALUES (%s, %s, %s, %s)",
            (username, password_hash, email, datetime.now())
        )
        conn.commit()
    except mysql.connector.IntegrityError:
        return jsonify({"msg": "Username already exists"}), 409
    finally:
        cursor.close()
        conn.close()

    return jsonify({"msg": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and sha256.verify(password, user['password_hash']):
        access_token = create_access_token(identity=str(user['id']))
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user.get('email', '')
            }
        })

    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/chat', methods=['POST'])
def chat():
    # Token validation
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header missing"}), 401

    token = auth_header.split(' ')[1]
    current_user_id = validate_token(token)
    if not current_user_id:
        return jsonify({"error": "Invalid token"}), 401

    # Get form data
    user_message = request.form.get('message', '')
    files = request.files.getlist('files')

    if not user_message and not files:
        return jsonify({"error": "Message or files required"}), 400

    try:
        bot_response = ""
        file_info = []

        # Process uploaded files
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)

                file_extension = filename.rsplit('.', 1)[1].lower()

                if file_extension == 'pdf':
                    # existing PDF processing
                    pass  # TODO: Implement PDF processing or call process_pdf_with_gemini

                elif file_extension in ['png', 'jpg', 'jpeg', 'gif']:
                    # existing image processing
                    pass  # TODO: Implement image processing or call process_image_with_gemini

                elif file_extension == 'docx':
                    extracted_text = process_docx_file(file_path)
                    if extracted_text:
                        if user_message:
                            # Optionally send extracted text + user message to Gemini AI
                            response = process_pdf_with_gemini(file_path, user_message)
                        else:
                            response = extracted_text
                        bot_response += f"DOCX Content:\n{response}\n\n"
                    else:
                        bot_response += "Failed to extract text from DOCX file.\n\n"

                elif file_extension == 'txt':
                    extracted_text = process_txt_file(file_path)
                    if extracted_text:
                        # For txt, you can directly respond with extracted text or pass to AI
                        bot_response += f"TXT Content:\n{extracted_text}\n\n"
                    else:
                        bot_response += "Failed to extract text from TXT file.\n\n"

                file_info.append({
                    "filename": filename,
                    "type": file_extension,
                    "processed": True
                })

                try:
                    os.remove(file_path)
                except:
                    pass

        # If no files, just process text message
        if not files and user_message:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(user_message)
            bot_response = response.text

        if not bot_response:
            bot_response = "I couldn't process your request. Please try again."

        # Store chat in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO chat_messages (user_id, user_message, bot_response, files_info, created_at) 
            VALUES (%s, %s, %s, %s, %s)
        """, (current_user_id, user_message, bot_response, json.dumps(file_info), datetime.now()))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "reply": bot_response,
            "files_processed": len(file_info)
        })

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": "Failed to process request"}), 500

@app.route('/history', methods=['GET'])
def get_history():
    # Token validation
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header missing"}), 401

    token = auth_header.split(' ')[1]
    current_user_id = validate_token(token)
    if not current_user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, user_message, bot_response, files_info, created_at 
            FROM chat_messages 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 50
        """, (current_user_id,))

        messages = cursor.fetchall()
        cursor.close()
        conn.close()

        # Parse JSON fields and format dates
        for message in messages:
            message['files_info'] = json.loads(message['files_info'] or '[]')
            message['created_at'] = message['created_at'].isoformat()

        return jsonify({"messages": messages})

    except Exception as e:
        print(f"Error getting history: {e}")
        return jsonify({"error": "Failed to get history"}), 500

@app.route('/clear-history', methods=['DELETE'])
def clear_history():
    # Token validation
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization header missing"}), 401

    token = auth_header.split(' ')[1]
    current_user_id = validate_token(token)
    if not current_user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM chat_messages WHERE user_id = %s", (current_user_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"msg": "History cleared successfully"})

    except Exception as e:
        print(f"Error clearing history: {e}")
        return jsonify({"error": "Failed to clear history"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
