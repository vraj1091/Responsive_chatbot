import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setMessages([{
      sender: 'bot',
      text: 'Hello! I\'m your AI assistant. I can chat with you, analyze images, and process PDF documents. How can I help you today? 🤖',
      timestamp: new Date().toISOString(),
      type: 'welcome'
    }]);
  }, []);

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (!validTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload images (PNG, JPG, GIF), PDFs, Word documents (DOC, DOCX), or text files.`);
        return false;
      }

      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }

      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;

    const userMessage = {
      sender: 'user',
      text: input,
      files: selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (input.trim()) {
        formData.append('message', input);
      }

      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        'http://127.0.0.1:5000/chat',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const botMessage = {
        sender: 'bot',
        text: response.data.reply,
        timestamp: new Date().toISOString(),
        filesProcessed: response.data.files_processed || 0
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error chatting with backend:", error);
      const errorMessage = {
        sender: 'bot',
        text: 'Sorry, I encountered an error processing your request. Please try again. 😔',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
      setSelectedFiles([]);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.startsWith('text/')) return '📝';
    return '📎';
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-info">
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span className="status-text">AI Assistant Online</span>
          </div>
          <div className="chat-actions">
            <button 
              className="action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Files"
            >
              <span className="btn-icon">📎</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className={`chat-messages ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        ref={chatContainerRef}
      >
        {dragOver && (
          <div className="drop-overlay">
            <div className="drop-content">
              <div className="drop-icon">📁</div>
              <p>Drop your files here</p>
              <small>Supports images, PDFs, and text files</small>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className={`message ${msg.sender} ${msg.type || ''} ${msg.isError ? 'error' : ''}`}>
              <div className="message-content">
                <div className="message-text">
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>

                {msg.files && msg.files.length > 0 && (
                  <div className="message-files">
                    {msg.files.map((file, i) => (
                      <div key={i} className="file-preview">
                        <span className="file-icon">{getFileIcon(file.type)}</span>
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{(file.size / 1024).toFixed(1)}KB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.filesProcessed > 0 && (
                  <div className="files-processed">
                    ✅ Processed {msg.filesProcessed} file{msg.filesProcessed > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="message-time">
                {formatTime(msg.timestamp)}
              </div>

              {msg.sender === 'bot' && (
                <div className="message-avatar bot-avatar">
                  <div className="avatar-inner">🤖</div>
                  <div className="avatar-glow"></div>
                </div>
              )}

              {msg.sender === 'user' && (
                <div className="message-avatar user-avatar">
                  <div className="avatar-inner">👤</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message bot typing">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <div className="message-text">AI is thinking...</div>
              <div className="message-avatar bot-avatar">
                <div className="avatar-inner">🤖</div>
                <div className="avatar-glow processing"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <div className="files-header">
            <span className="files-count">📎 {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected</span>
            <button onClick={() => setSelectedFiles([])} className="clear-files">Clear All</button>
          </div>
          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="selected-file">
                <div className="file-preview-card">
                  <div className="file-icon-large">{getFileIcon(file.type)}</div>
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      {file.type} • {(file.size / 1024).toFixed(1)}KB
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(index)}
                    className="remove-file"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-form">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything, or upload files to analyze..."
              disabled={isLoading}
              className="chat-input"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            <div className="input-actions">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.gif,.pdf,.txt,.doc,.docx"
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="file-btn"
                title="Upload files"
                disabled={isLoading}
              >
                <span className="btn-icon">📎</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
                className="send-btn"
                title="Send message"
              >
                <span className="btn-icon">{isLoading ? '⏳' : '🚀'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Floating Help Button */}
      <div className="floating-help">
        <button className="help-btn" title="Help">
          <span className="help-icon">❓</span>
          <div className="help-tooltip">
            <h4>How to use:</h4>
            <ul>
              <li>💬 Type messages to chat</li>
              <li>🖼️ Upload images for analysis</li>
              <li>📄 Upload PDFs to summarize</li>
              <li>🎯 Drag & drop files anywhere</li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Chat;
