import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { getCurrentAgent } from '../../utils/helpers';

function Header() {
  const agent = getCurrentAgent();
  
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">
          🎧 HELP-SOLVE
        </h1>
        <nav className="nav">
          <Link to="/" className="nav-link">
            📋 Tickets
          </Link>
          <Link to="/dashboard" className="nav-link">
            📊 Dashboard
          </Link>
        </nav>
      </div>
      
      <div className="header-right">
        <div className="notifications">
          <span className="notification-icon">🔔</span>
          <span className="notification-badge">3</span>
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">
            {agent.name.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-name">{agent.name}</div>
            <div className="user-role">{agent.team}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;