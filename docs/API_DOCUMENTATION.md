# 🔌 API Documentation

This document provides comprehensive information about the AI Chatbot backend API endpoints.

## 🌐 Base URL

**Development**: `http://localhost:5000`
**Production**: `https://your-domain.com/api`

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints Overview

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/` | GET | No | Health check |
| `/register` | POST | No | User registration |
| `/login` | POST | No | User login |
| `/chat` | POST | Yes | Send chat message |
| `/history` | GET | Yes | Get chat history |
| `/clear-history` | DELETE | Yes | Clear chat history |

## 🔍 Detailed Endpoints

### 1. Health Check
Check if the API is running.

**Endpoint**: `GET /`

**Response**:
```json
{
  "message": "AI Chatbot Backend with File Processing",
  "status": "running"
}
```

### 2. User Registration
Register a new user account.

**Endpoint**: `POST /register`

**Request Body**:
```json
{
  "username": "string (required, 3-50 chars)",
  "password": "string (required, min 6 chars)",
  "email": "string (optional, valid email)"
}
```

**Response Success (201)**:
```json
{
  "msg": "User created successfully"
}
```

**Response Error (400)**:
```json
{
  "msg": "Username and password required"
}
```

**Response Error (409)**:
```json
{
  "msg": "Username already exists"
}
```

### 3. User Login
Authenticate user and receive JWT token.

**Endpoint**: `POST /login`

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response Success (200)**:
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response Error (401)**:
```json
{
  "msg": "Invalid credentials"
}
```

### 4. Send Chat Message
Send a message to the AI assistant with optional file attachments.

**Endpoint**: `POST /chat`

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request Body**:
- `message`: Text message (optional if files provided)
- `files`: Array of files (optional, max 50MB each)

**Supported File Types**:
- Images: PNG, JPEG, JPG, GIF
- Documents: PDF, TXT

**Response Success (200)**:
```json
{
  "reply": "AI response text here",
  "files_processed": 2
}
```

**Response Error (401)**:
```json
{
  "error": "Authorization header missing"
}
```

**Response Error (400)**:
```json
{
  "error": "Message or files required"
}
```

### 5. Get Chat History
Retrieve user's chat history.

**Endpoint**: `GET /history`

**Authentication**: Required

**Response Success (200)**:
```json
{
  "messages": [
    {
      "id": 1,
      "user_message": "Hello AI",
      "bot_response": "Hello! How can I help you?",
      "files_info": [],
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### 6. Clear Chat History
Delete all chat messages for the authenticated user.

**Endpoint**: `DELETE /clear-history`

**Authentication**: Required

**Response Success (200)**:
```json
{
  "msg": "History cleared successfully"
}
```

## 📁 File Upload Details

### Supported Formats
- **Images**: PNG, JPEG, JPG, GIF
- **Documents**: PDF, TXT

### Size Limits
- Maximum file size: 50MB per file
- Maximum files per request: 10 files

### Processing
- **Images**: Analyzed using Gemini Vision API
- **PDFs**: Processed using Gemini document understanding
- **Text files**: Content analyzed for context

### Example File Upload

**JavaScript (using FormData)**:
```javascript
const formData = new FormData();
formData.append('message', 'Analyze this image');
formData.append('files', imageFile);

const response = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Python (using requests)**:
```python
import requests

files = {'files': open('image.jpg', 'rb')}
data = {'message': 'Describe this image'}
headers = {'Authorization': f'Bearer {token}'}

response = requests.post(
    'http://localhost:5000/chat',
    files=files,
    data=data,
    headers=headers
)
```

## 🔒 Security Features

### JWT Token
- **Algorithm**: HS256
- **Expiration**: 24 hours (configurable)
- **Claims**: User ID, username, issued timestamp

### Input Validation
- All inputs are validated and sanitized
- File types are checked before processing
- SQL injection prevention with parameterized queries

### Rate Limiting
- API calls are rate-limited to prevent abuse
- Configurable limits per user/IP

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **500**: Internal Server Error

### Common Error Codes
| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_TOKEN` | JWT token is invalid | Re-authenticate |
| `TOKEN_EXPIRED` | JWT token has expired | Login again |
| `FILE_TOO_LARGE` | File exceeds size limit | Use smaller files |
| `UNSUPPORTED_FILE` | File type not supported | Check file formats |
| `API_KEY_ERROR` | Gemini API key issue | Check configuration |

## 🧪 Testing the API

### Using cURL

**Register User**:
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

**Send Message**:
```bash
curl -X POST http://localhost:5000/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "message=Hello AI" \
  -F "files=@image.jpg"
```

### Using Python

```python
import requests

# Base URL
BASE_URL = 'http://localhost:5000'

# Register
response = requests.post(f'{BASE_URL}/register', json={
    'username': 'testuser',
    'password': 'password123'
})

# Login
response = requests.post(f'{BASE_URL}/login', json={
    'username': 'testuser',
    'password': 'password123'
})
token = response.json()['access_token']

# Send chat message
headers = {'Authorization': f'Bearer {token}'}
files = {'files': open('image.jpg', 'rb')}
data = {'message': 'Analyze this image'}

response = requests.post(f'{BASE_URL}/chat', 
                        headers=headers,
                        files=files, 
                        data=data)
```

## 📊 Response Examples

### Chat Response with Image Analysis
```json
{
  "reply": "This image shows a beautiful sunset over a mountain landscape. The sky displays vibrant orange and pink hues, with scattered clouds creating a dramatic silhouette against the mountains. The composition suggests this was taken during golden hour, creating a peaceful and serene atmosphere.",
  "files_processed": 1
}
```

### Chat Response with PDF Analysis
```json
{
  "reply": "This PDF document appears to be a research paper about artificial intelligence. The main topics covered include:\n\n1. Machine Learning Fundamentals\n2. Neural Network Architectures\n3. Natural Language Processing\n4. Computer Vision Applications\n\nThe paper concludes with recommendations for future AI research directions.",
  "files_processed": 1
}
```

### Chat History Response
```json
{
  "messages": [
    {
      "id": 15,
      "user_message": "What do you see in this image?",
      "bot_response": "I can see a beautiful landscape with mountains...",
      "files_info": [
        {
          "filename": "20241215_143022_landscape.jpg",
          "type": "jpg",
          "processed": true
        }
      ],
      "created_at": "2024-01-15T14:30:22"
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables
```env
# Gemini AI
GEMINI_API_KEY=your_api_key

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=chatbot_db

# Security
JWT_SECRET_KEY=your_secret_key

# File Upload
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_FOLDER=uploads/
```

### CORS Configuration
The API supports CORS for web applications. Default allowed origins:
- `http://localhost:3000` (React dev server)
- `http://localhost:5173` (Vite dev server)

## 📈 Performance

### Response Times
- Simple text chat: ~500ms
- Image analysis: ~2-5 seconds
- PDF processing: ~3-10 seconds (depending on size)

### Concurrency
- Supports multiple concurrent users
- Database connection pooling enabled
- Async file processing for better performance

## 🔄 Versioning

Current API version: **v1.0**

Version information is included in response headers:
```
X-API-Version: 1.0
```

## 📞 Support

For API issues or questions:
- Check error messages and status codes
- Review this documentation
- Open an issue on GitHub
- Check server logs for detailed error information

---

**API Documentation Version**: 1.0  
**Last Updated**: December 2024
