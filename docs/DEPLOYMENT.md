# 🚀 Deployment Guide

This guide covers deploying the AI Chatbot application to various production environments.

## 🏗️ Deployment Options

### 1. Traditional Server (VPS/Dedicated)
- **Best for**: Full control, custom configurations
- **Providers**: DigitalOcean, Linode, AWS EC2, Google Cloud VM

### 2. Platform as a Service (PaaS)
- **Best for**: Easy deployment, managed infrastructure
- **Providers**: Heroku, Railway, Render, Vercel

### 3. Containerized (Docker)
- **Best for**: Consistent environments, microservices
- **Platforms**: Docker Swarm, Kubernetes, AWS ECS

### 4. Serverless
- **Best for**: Auto-scaling, pay-per-use
- **Platforms**: Vercel, Netlify, AWS Lambda

## 🐳 Docker Deployment

### Create Docker Files

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Run application
CMD ["python", "app.py"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: chatbot_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build: ./backend
    container_name: chatbot_backend
    restart: unless-stopped
    environment:
      - DB_HOST=mysql
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    volumes:
      - ./backend/uploads:/app/uploads
    ports:
      - "5000:5000"
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    build: ./frontend
    container_name: chatbot_frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

**Environment File** (`.env`):
```env
# Database
DB_USER=chatbot_user
DB_PASSWORD=secure_password_here
DB_NAME=chatbot_db

# API Keys
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET_KEY=your_jwt_secret_key
```

### Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Platform Deployment

### 1. Railway Deployment

**Backend Setup**:
1. Create Railway account
2. Connect GitHub repository
3. Deploy backend service
4. Add environment variables
5. Configure custom domain

**Environment Variables**:
```
GEMINI_API_KEY=your_key
JWT_SECRET_KEY=your_secret
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=chatbot_db
```

**Railway Configuration** (`railway.toml`):
```toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "always"

[[services]]
name = "backend"
source = "backend/"

[[services]]
name = "frontend" 
source = "frontend/"
```

### 2. Render Deployment

**Backend** (`render.yaml`):
```yaml
services:
  - type: web
    name: chatbot-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: DB_HOST
        fromDatabase:
          name: chatbot-db
          property: host
```

### 3. Heroku Deployment

**Procfile** (backend):
```
web: python app.py
```

**Runtime** (`runtime.txt`):
```
python-3.11.0
```

**Deploy Commands**:
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-chatbot-backend

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set JWT_SECRET_KEY=your_secret

# Deploy
git push heroku main
```

## 🔧 Production Configuration

### Backend Production Settings

**app.py** modifications:
```python
import os

# Production settings
if os.environ.get('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    app.config['TESTING'] = False

    # Security headers
    @app.after_request
    def security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
```

### Frontend Production Build

**Build for Production**:
```bash
npm run build
```

**Nginx Configuration** (`nginx.conf`):
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:5000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## 🔒 SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx HTTPS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        root /var/www/chatbot;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Database Production Setup

### MySQL Production Configuration

**Security Settings**:
```sql
-- Create dedicated user
CREATE USER 'chatbot_prod'@'%' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON chatbot_db.* TO 'chatbot_prod'@'%';

-- Remove test databases
DROP DATABASE IF EXISTS test;

-- Update root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'very_strong_password';
```

**Backup Strategy**:
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="chatbot_db"
DB_USER="chatbot_prod"

mysqldump -u $DB_USER -p $DB_NAME > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Database Connection Pool
```python
import mysql.connector.pooling

# Production connection pool
config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'pool_name': 'chatbot_pool',
    'pool_size': 10,
    'pool_reset_session': True
}

pool = mysql.connector.pooling.MySQLConnectionPool(**config)

def get_db_connection():
    return pool.get_connection()
```

## 📈 Performance Optimization

### Backend Optimizations
```python
# Enable gzip compression
from flask_compress import Compress
Compress(app)

# Caching
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@cache.memoize(timeout=300)
def expensive_function():
    # Cached result
    pass
```

### Frontend Optimizations
```json
{
  "scripts": {
    "build": "react-scripts build && npm run optimize",
    "optimize": "npx webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

## 🔍 Monitoring & Logging

### Application Monitoring
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/chatbot.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### Health Check Endpoint
```python
@app.route('/health')
def health_check():
    try:
        # Test database connection
        conn = get_db_connection()
        conn.close()

        # Test Gemini API
        model = genai.GenerativeModel('gemini-1.5-flash')

        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'ai_service': 'available',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
```

## 🚦 Load Balancing

### Nginx Load Balancer
```nginx
upstream backend_servers {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] SSL certificates obtained
- [ ] Backup strategy implemented
- [ ] Monitoring tools setup

### Security
- [ ] API keys secured
- [ ] Database access restricted
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Input validation implemented

### Performance
- [ ] Database indexed
- [ ] Caching enabled
- [ ] File compression active
- [ ] CDN configured (if needed)
- [ ] Load testing completed

### Monitoring
- [ ] Health checks working
- [ ] Logging configured
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] Backup verification

## 🆘 Troubleshooting Production Issues

### Common Issues
1. **Database Connection Timeouts**
   - Increase connection pool size
   - Check network connectivity
   - Verify credentials

2. **High Memory Usage**
   - Implement connection pooling
   - Add memory limits
   - Monitor for leaks

3. **Slow API Responses**
   - Add caching layers
   - Optimize database queries
   - Scale horizontally

### Debug Commands
```bash
# Check service status
systemctl status nginx
systemctl status mysql

# View logs
tail -f /var/log/nginx/error.log
docker logs chatbot_backend

# Test connections
curl -I https://yourdomain.com/health
mysql -u user -p -h host -e "SELECT 1"
```

---

**Deployment Complete!** 🎉 Your AI Chatbot is now running in production.
