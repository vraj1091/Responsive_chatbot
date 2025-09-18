import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const endpoint = isRegister ? '/register' : '/login';
    const payload = isRegister 
      ? { username, password, email }
      : { username, password };

    try {
      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, payload);

      if (isRegister) {
        setMessage('Registration successful! Please log in.');
        setIsRegister(false);
        setUsername('');
        setPassword('');
        setEmail('');
      } else {
        const { access_token, user } = response.data;
        onLoginSuccess(access_token, user);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-icon-3d">
          <div className="icon-sphere">
            <div className="icon-inner">
              {isRegister ? '👤' : '🔐'}
            </div>
          </div>
        </div>
        <h2 className="auth-title">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="auth-subtitle">
          {isRegister 
            ? 'Join our AI-powered chat experience' 
            : 'Sign in to continue your conversation'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <div className="input-container">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="auth-input"
            />
            <div className="input-highlight"></div>
            <label className="input-label">👤 Username</label>
          </div>
        </div>

        {isRegister && (
          <div className="form-group">
            <div className="input-container">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="auth-input"
              />
              <div className="input-highlight"></div>
              <label className="input-label">📧 Email</label>
            </div>
          </div>
        )}

        <div className="form-group">
          <div className="input-container">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength="6"
              className="auth-input"
            />
            <div className="input-highlight"></div>
            <label className="input-label">🔑 Password</label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`auth-button ${isLoading ? 'loading' : ''}`}
        >
          <div className="button-content">
            <span className="button-text">
              {isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            </span>
            <div className="button-glow"></div>
          </div>
          {isLoading && <div className="button-loader"></div>}
        </button>

        {error && (
          <div className="message error">
            <div className="message-icon">⚠️</div>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="message success">
            <div className="message-icon">✅</div>
            <span>{message}</span>
          </div>
        )}

        <div className="auth-toggle">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setMessage('');
              }}
              className="toggle-link"
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </form>

      {/* Decorative elements */}
      <div className="auth-decorations">
        <div className="decoration-orb orb-1"></div>
        <div className="decoration-orb orb-2"></div>
        <div className="decoration-orb orb-3"></div>
      </div>
    </div>
  );
};

export default Auth;
