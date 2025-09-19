import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const History = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Use environment variable for API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(response.data.messages || []);
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error fetching history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/clear-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages([]);
    } catch (err) {
      setError('Failed to clear history');
      console.error('Error clearing history:', err);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      message.user_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.bot_response?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'files') return matchesSearch && message.files_info?.length > 0;
    if (filterType === 'text') return matchesSearch && (!message.files_info || message.files_info.length === 0);

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType?.startsWith('text/')) return '📝';
    return '📎';
  };

  if (isLoading) {
    return (
      <div className="history-container">
        <div className="loading-history">
          <div className="history-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p>Loading your chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="header-title">
          <h2>💬 Chat History</h2>
          <p className="header-subtitle">
            {messages.length} conversation{messages.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <div className="header-actions">
          <button
            onClick={clearHistory}
            className="clear-history-btn"
            disabled={messages.length === 0}
          >
            <span className="btn-icon">🗑️</span>
            Clear All
          </button>
        </div>
      </div>

      <div className="history-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                ❌
              </button>
            )}
          </div>
        </div>

        <div className="filter-container">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Messages</option>
            <option value="files">With Files</option>
            <option value="text">Text Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="history-content">
        {filteredMessages.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">📭</div>
            <h3>No conversations found</h3>
            <p>
              {searchTerm
                ? 'Try adjusting your search terms or filters'
                : 'Start chatting to see your conversation history here'
              }
            </p>
          </div>
        ) : (
          <div className="history-list">
            {filteredMessages.map((message, index) => (
              <div key={message.id || index} className="history-item">
                <div className="conversation-card">
                  <div className="conversation-header">
                    <div className="conversation-time">
                      <span className="time-icon">🕒</span>
                      {formatDate(message.created_at)}
                    </div>
                    {message.files_info && message.files_info.length > 0 && (
                      <div className="files-indicator">
                        <span className="files-icon">📎</span>
                        {message.files_info.length} file{message.files_info.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="conversation-content">
                    {message.user_message && (
                      <div className="user-message-history">
                        <div className="message-label">
                          <span className="label-icon">👤</span>
                          You asked:
                        </div>
                        <div className="message-text">
                          {message.user_message}
                        </div>
                      </div>
                    )}

                    {message.files_info && message.files_info.length > 0 && (
                      <div className="files-section">
                        <div className="files-label">
                          <span className="label-icon">📎</span>
                          Uploaded files:
                        </div>
                        <div className="files-grid">
                          {message.files_info.map((file, fileIndex) => (
                            <div key={fileIndex} className="file-item">
                              <span className="file-icon">{getFileIcon(file.type)}</span>
                              <span className="file-name">{file.filename}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bot-response-history">
                      <div className="message-label">
                        <span className="label-icon">🤖</span>
                        AI responded:
                      </div>
                      <div className="message-text">
                        {message.bot_response.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < message.bot_response.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
