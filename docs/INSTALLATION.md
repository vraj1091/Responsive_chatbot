# 📦 Installation Guide

This guide provides detailed step-by-step instructions for setting up the AI Chatbot with 3D Interface.

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, or Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Stable connection for AI API calls

### Required Software
- **Node.js**: v16.0.0 or higher
- **Python**: v3.8.0 or higher
- **MySQL**: v8.0.0 or higher
- **Git**: Latest version

## 🔑 API Keys Setup

### 1. Get Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new project or select existing
4. Navigate to API Keys section
5. Generate a new API key
6. Copy and save the key securely

### 2. Save API Key
Keep your API key secure - you'll need it during configuration.

## 🗃️ Database Setup

### 1. Install MySQL
#### Windows:
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run installer and select "Developer Default"
3. Follow installation wizard
4. Set root password during setup

#### macOS:
```bash
# Using Homebrew
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE chatbot_db;
CREATE USER 'chatbot_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON chatbot_db.* TO 'chatbot_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 📥 Project Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd ai-chatbot-3d
```

### 2. Backend Setup

#### Navigate to Backend
```bash
cd backend
```

#### Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file with your settings:
```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DB_HOST=localhost
DB_USER=chatbot_user
DB_PASSWORD=your_password
DB_NAME=chatbot_db

# Security
JWT_SECRET_KEY=your_jwt_secret_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

#### Initialize Database
```bash
python setup_database.py
```

#### Test Backend
```bash
python app.py
```
Backend should start at http://localhost:5000

### 3. Frontend Setup

#### Navigate to Frontend
```bash
cd ../frontend
```

#### Install Dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm start
```
Frontend should start at http://localhost:3000

## 🔧 Configuration Options

### Backend Configuration

#### File Upload Settings
In `app.py`, modify upload settings:
```python
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt'}
```

#### Database Settings
In `.env`, configure database:
```env
DB_HOST=localhost          # Database host
DB_USER=chatbot_user      # Database username
DB_PASSWORD=your_password # Database password
DB_NAME=chatbot_db        # Database name
```

#### CORS Settings
In `app.py`, modify CORS origins:
```python
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"]}})
```

### Frontend Configuration

#### API Endpoint
In React components, update API base URL if needed:
```javascript
const API_BASE_URL = 'http://127.0.0.1:5000';
```

#### Build Configuration
In `package.json`, proxy is set for development:
```json
"proxy": "http://localhost:5000"
```

## 🧪 Testing Installation

### 1. Backend Tests
```bash
cd backend
python -c "import google.generativeai as genai; print('Gemini AI: OK')"
python -c "import mysql.connector; print('MySQL: OK')"
python -c "import flask; print('Flask: OK')"
```

### 2. Frontend Tests
```bash
cd frontend
npm test
```

### 3. Full System Test
1. Start backend: `python app.py`
2. Start frontend: `npm start`
3. Open http://localhost:3000
4. Register a new account
5. Upload a test image
6. Send a chat message

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: Can't connect to MySQL server
```
**Solution**:
- Verify MySQL is running: `sudo service mysql status`
- Check credentials in `.env`
- Ensure database exists

#### 2. Gemini API Key Error
```
Error: API key not valid
```
**Solution**:
- Verify API key in `.env`
- Check API key permissions in Google AI Studio
- Ensure no extra spaces in the key

#### 3. Node.js Version Error
```
Error: Node.js version not supported
```
**Solution**:
- Update Node.js: `node --version`
- Use Node Version Manager (nvm)
- Install Node.js v16+

#### 4. Python Module Not Found
```
ModuleNotFoundError: No module named 'flask'
```
**Solution**:
- Activate virtual environment
- Reinstall requirements: `pip install -r requirements.txt`
- Check Python version: `python --version`

#### 5. Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**:
- Kill process: `sudo lsof -ti:5000 | xargs kill -9`
- Use different port in `app.py`
- Check for other Flask apps

#### 6. CORS Error in Browser
```
CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution**:
- Check CORS configuration in `app.py`
- Verify frontend URL in CORS origins
- Clear browser cache

### Debug Commands

#### Check Logs
```bash
# Backend logs
python app.py > backend.log 2>&1

# Frontend logs
npm start > frontend.log 2>&1
```

#### Database Debug
```bash
mysql -u chatbot_user -p chatbot_db
SHOW TABLES;
DESCRIBE users;
DESCRIBE chat_messages;
```

#### Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:5000/

# Test with auth (replace TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/history
```

## 📚 Next Steps

After successful installation:

1. **Read API Documentation**: `/docs/API_DOCUMENTATION.md`
2. **Review Deployment Guide**: `/docs/DEPLOYMENT.md`
3. **Customize Interface**: Modify CSS and React components
4. **Add Features**: Extend functionality as needed

## 🔒 Security Considerations

### Production Setup
- Change default passwords
- Use environment variables for secrets
- Enable HTTPS
- Configure firewall rules
- Regular security updates

### API Key Security
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor usage in Google Cloud Console

## 💡 Tips for Success

1. **Use Virtual Environments**: Isolate Python dependencies
2. **Version Control**: Commit changes regularly
3. **Backup Database**: Regular MySQL backups
4. **Monitor Logs**: Check for errors regularly
5. **Test Thoroughly**: Verify all features work

---

**Need Help?** Open an issue on GitHub or check the troubleshooting section above.
