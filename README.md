# 🤖 AI Chatbot with 3D Interface

A modern, feature-rich AI chatbot application with image processing capabilities, 3D animations, and dynamic design elements. Built with React frontend and Flask backend, powered by Google's Gemini AI.

## ✨ Features

### 🎨 **3D Dynamic Interface**
- Stunning 3D animations and visual effects
- Interactive floating elements and particle systems
- Smooth transitions and hover effects
- Responsive design with modern glassmorphism

### 🤖 **AI-Powered Chat**
- Intelligent conversations using Google Gemini AI
- Context-aware responses
- Real-time message processing
- Typing indicators and status updates

### 📁 **File Processing**
- **Image Analysis**: Upload and analyze images (PNG, JPG, JPEG, GIF)
- **PDF Processing**: Extract and summarize PDF documents
- **Drag & Drop**: Intuitive file upload interface
- **Multi-file Support**: Process multiple files simultaneously

### 👤 **User Management**
- Secure user authentication with JWT
- User registration and login
- Persistent chat history
- Session management

### 📊 **Chat History**
- View and search past conversations
- Filter by message type (text, files)
- Organized conversation cards
- Export and clear history options

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **CSS3** - Advanced styling with 3D transforms
- **Axios** - HTTP client for API communication
- **Responsive Design** - Mobile-first approach

### Backend
- **Flask** - Python web framework
- **Google Gemini AI** - Advanced language model
- **MySQL** - Reliable database storage
- **JWT** - Secure authentication
- **File Processing** - Image and PDF handling

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MySQL** (v8.0 or higher)
- **Google Gemini API Key**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-chatbot-3d
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python setup_database.py
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📂 Project Structure

```
ai-chatbot-3d/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── uploads/              # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx          # Main App component
│   │   ├── App.css          # 3D styling
│   │   └── index.js         # Entry point
│   ├── public/
│   │   └── index.html       # HTML template
│   └── package.json         # Dependencies
├── database/
│   ├── schema.sql           # Database schema
│   └── setup_database.py    # Database setup script
└── docs/
    ├── README.md            # This file
    ├── INSTALLATION.md      # Detailed installation guide
    ├── API_DOCUMENTATION.md # API reference
    └── DEPLOYMENT.md        # Deployment instructions
```

## 🎯 Key Features Explained

### 3D Visual Effects
- **Floating Elements**: Animated 3D spheres and cubes
- **Particle System**: Dynamic background particles
- **Glass Morphism**: Modern translucent interface elements
- **Smooth Animations**: CSS3 transforms and transitions

### File Upload & Processing
- **Drag & Drop**: Intuitive file selection
- **Image Analysis**: Gemini Vision API for image understanding
- **PDF Processing**: Text extraction and summarization
- **Progress Indicators**: Real-time upload feedback

### Chat Interface
- **Real-time Messaging**: Instant AI responses
- **File Attachments**: Visual file previews
- **Message History**: Persistent conversation storage
- **Smart Search**: Find past conversations quickly

## 🔧 Configuration

### Environment Variables
```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chatbot_db

# Security
JWT_SECRET_KEY=your_secret_key
```

### Supported File Types
- **Images**: PNG, JPEG, JPG, GIF (max 50MB)
- **Documents**: PDF, TXT (max 50MB)
- **Processing**: Real-time analysis with Gemini AI

## 🚀 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions including:
- Production setup
- Docker configuration
- Cloud deployment options
- SSL/HTTPS setup

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive data validation
- **File Type Checking**: Secure file upload restrictions
- **CORS Protection**: Controlled cross-origin requests
- **SQL Injection Prevention**: Parameterized queries

## 🎨 Customization

### Themes
The app uses CSS custom properties for easy theming:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --glass-bg: rgba(255, 255, 255, 0.1);
}
```

### 3D Effects
Modify the 3D animations in `App.css`:
- Floating element timing
- Particle density
- Animation speeds
- Color schemes

## 📱 Mobile Support

- **Responsive Design**: Adapts to all screen sizes
- **Touch Gestures**: Mobile-friendly interactions
- **Optimized Performance**: Reduced animations on mobile
- **Progressive Enhancement**: Works without JavaScript

## 🐛 Troubleshooting

### Common Issues
1. **API Key Issues**: Verify Gemini API key in .env
2. **Database Connection**: Check MySQL credentials
3. **File Upload Errors**: Verify file size and type
4. **CORS Issues**: Check backend CORS configuration

### Debug Mode
Enable debug mode for detailed error logging:
```python
app.run(debug=True)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - Powerful language model
- **React Team** - Amazing frontend framework
- **Flask** - Lightweight Python web framework
- **Open Source Community** - Inspiration and support

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the troubleshooting guide

---

**Made with ❤️ and AI** - Enjoy your 3D chatbot experience!
