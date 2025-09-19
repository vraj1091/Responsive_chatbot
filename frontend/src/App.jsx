import React, { useState, useEffect } from 'react';
import './App.css';

// Components
import Auth from './components/Auth';
import Chat from './components/Chat';
import History from './components/History';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(false); // loading state used dynamically

  const handleLoginSuccess = (receivedToken, userData) => {
    localStorage.setItem('authToken', receivedToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser({});
  };

  // 3D floating elements animation setup
  useEffect(() => {
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
      element.style.animationDelay = `${index * 0.5}s`;
    });
  }, []);

  return (
    <div className="App">
      {/* 3D Background Elements */}
      <div className="background-3d">
        <div className="floating-element sphere-1"></div>
        <div className="floating-element sphere-2"></div>
        <div className="floating-element sphere-3"></div>
        <div className="floating-element cube-1"></div>
        <div className="floating-element cube-2"></div>
      </div>

      {/* Particle System */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {!token ? (
        <div className="auth-wrapper">
          <div className="auth-container-3d">
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      ) : (
        <div className="main-app">
          {/* Header */}
          <header className="app-header">
            <div className="header-content">
              <div className="logo-section">
                <div className="logo-3d">
                  <span className="logo-text">AI Assistant</span>
                  <div className="logo-glow"></div>
                </div>
              </div>

              <nav className="nav-tabs">
                <button
                  className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  <span className="tab-icon">💬</span>
                  Chat
                </button>
                <button
                  className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <span className="tab-icon">📜</span>
                  History
                </button>
              </nav>

              <div className="user-section">
                <div className="user-info">
                  <div className="user-avatar">{user.username?.charAt(0).toUpperCase() || 'U'}</div>
                  <span className="username">{user.username}</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <span className="btn-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="app-main">
            <div className="content-container">
              {activeTab === 'chat' && (
                <div className="tab-content-3d">
                  {/* Pass setIsLoading so Chat can manage loading overlay */}
                  <Chat token={token} setIsLoading={setIsLoading} />
                </div>
              )}
              {activeTab === 'history' && (
                <div className="tab-content-3d">
                  <History token={token} />
                </div>
              )}
            </div>
          </main>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-3d">
                <div className="spinner-3d">
                  <div className="cube-spinner">
                    <div className="cube-face front"></div>
                    <div className="cube-face back"></div>
                    <div className="cube-face right"></div>
                    <div className="cube-face left"></div>
                    <div className="cube-face top"></div>
                    <div className="cube-face bottom"></div>
                  </div>
                </div>
                <p className="loading-text">Processing...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
