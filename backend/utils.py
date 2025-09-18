"""
Utility functions for the AI Chatbot Backend
"""
import os
import base64
import mimetypes
from werkzeug.utils import secure_filename
from datetime import datetime

def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def generate_unique_filename(filename):
    """Generate unique filename with timestamp."""
    name, ext = os.path.splitext(secure_filename(filename))
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{name}{ext}"

def encode_image_to_base64(image_path):
    """Convert image to base64 string."""
    try:
        with open(image_path, 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode()
        return encoded_string
    except Exception as e:
        print(f"Error encoding image: {e}")
        return None

def get_file_mime_type(file_path):
    """Get MIME type of file."""
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type or 'application/octet-stream'

def format_file_size(size_bytes):
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0B"
    size_names = ["B", "KB", "MB", "GB"]
    import math
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return f"{s} {size_names[i]}"

def validate_image_file(file_path, max_size=50*1024*1024):
    """Validate image file size and format."""
    if not os.path.exists(file_path):
        return False, "File does not exist"

    file_size = os.path.getsize(file_path)
    if file_size > max_size:
        return False, f"File too large: {format_file_size(file_size)}"

    mime_type = get_file_mime_type(file_path)
    if not mime_type.startswith('image/'):
        return False, "Not a valid image file"

    return True, "Valid"

def sanitize_filename(filename):
    """Sanitize filename for safe storage."""
    # Remove any path components
    filename = os.path.basename(filename)
    # Replace dangerous characters
    dangerous_chars = ['/', '\\', '..', '<', '>', ':', '"', '|', '?', '*']
    for char in dangerous_chars:
        filename = filename.replace(char, '_')
    # Limit length
    name, ext = os.path.splitext(filename)
    if len(name) > 100:
        name = name[:100]
    return name + ext
