#!/usr/bin/env python3
"""
Database Setup Script for AI Chatbot
Initializes MySQL database with required tables and sample data.
"""

import mysql.connector
import os
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

def create_database_connection():
    """Create connection to MySQL server (without specific database)."""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD')
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL server: {err}")
        return None

def create_database():
    """Create the chatbot database if it doesn't exist."""
    connection = create_database_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        db_name = os.getenv('DB_NAME', 'chatbot_db')

        # Create database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"✅ Database '{db_name}' created successfully")

        cursor.close()
        connection.close()
        return True
    except mysql.connector.Error as err:
        print(f"Error creating database: {err}")
        return False

def create_tables():
    """Create all required tables."""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME', 'chatbot_db')
        )

        cursor = connection.cursor()

        # Users table
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            is_active BOOLEAN DEFAULT TRUE
        )
        """
        cursor.execute(users_table)
        print("✅ Users table created")

        # Chat messages table
        chat_messages_table = """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            user_message TEXT,
            bot_response LONGTEXT,
            files_info JSON,
            message_type ENUM('text', 'image', 'pdf', 'mixed') DEFAULT 'text',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
        cursor.execute(chat_messages_table)
        print("✅ Chat messages table created")

        # User sessions table
        user_sessions_table = """
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            session_token VARCHAR(255),
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
        cursor.execute(user_sessions_table)
        print("✅ User sessions table created")

        # File uploads table
        file_uploads_table = """
        CREATE TABLE IF NOT EXISTS file_uploads (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            filename VARCHAR(255),
            original_filename VARCHAR(255),
            file_type VARCHAR(50),
            file_size INT,
            upload_path VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
        cursor.execute(file_uploads_table)
        print("✅ File uploads table created")

        # Create indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id)"
        ]

        for index in indexes:
            cursor.execute(index)

        print("✅ Database indexes created")

        connection.commit()
        cursor.close()
        connection.close()
        return True

    except mysql.connector.Error as err:
        print(f"Error creating tables: {err}")
        return False

def verify_setup():
    """Verify that all tables were created successfully."""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME', 'chatbot_db')
        )

        cursor = connection.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()

        expected_tables = ['users', 'chat_messages', 'user_sessions', 'file_uploads']
        existing_tables = [table[0] for table in tables]

        print("\n📊 Database Tables:")
        for table in expected_tables:
            if table in existing_tables:
                print(f"  ✅ {table}")
            else:
                print(f"  ❌ {table}")

        cursor.close()
        connection.close()

        return len(existing_tables) == len(expected_tables)

    except mysql.connector.Error as err:
        print(f"Error verifying setup: {err}")
        return False

def main():
    """Main setup function."""
    print("🚀 Starting AI Chatbot Database Setup")
    print("=" * 40)

    # Check environment variables
    required_vars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file")
        return False

    # Create database
    if not create_database():
        print("❌ Failed to create database")
        return False

    # Create tables
    if not create_tables():
        print("❌ Failed to create tables")
        return False

    # Verify setup
    if not verify_setup():
        print("❌ Database setup verification failed")
        return False

    print("\n🎉 Database setup completed successfully!")
    print("Your AI Chatbot database is ready to use.")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
