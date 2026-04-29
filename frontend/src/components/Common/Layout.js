import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiInbox, 
  FiBarChart2, 
  FiUsers, 
  FiSettings,
  FiBell,
  FiSearch,
  FiMenu
} from 'react-icons/fi';
import './Layout.css';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { icon: FiHome, label: 'Accueil', path: '/' },
    { icon: FiInbox, label: 'Tickets', path: '/tickets' },
    { icon: FiBarChart2, label: 'Dashboard', path: '/dashboard' },
    { icon: FiUsers, label: 'Agents', path: '/agents' },
    { icon: FiSettings, label: 'Paramètres', path: '/settings' }
  ];
  
  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">HS</div>
            <span className="logo-text">HELP-SOLVE</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <div
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">TM</div>
            <div className="user-details">
              <div className="user-name">Thomas Martin</div>
              <div className="user-role">Agent Support</div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* MAIN CONTENT */}
      <div className="main-wrapper">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn-menu">
              <FiMenu />
            </button>
            
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Rechercher des tickets, clients..." 
                className="search-input"
              />
            </div>
          </div>
          
          <div className="topbar-right">
            <button className="topbar-btn">
              <FiBell />
              <span className="badge">3</span>
            </button>
          </div>
        </header>
        
        {/* PAGE CONTENT */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;