import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{
      margin: '16px 16px 0 16px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '16px',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate(user ? '/dashboard' : '/')}>
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8L16 26L26 8" stroke="url(#voyaGradientNav)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="12" r="5" stroke="var(--coral)" strokeWidth="3" />
          <path d="M16 2L16 6" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="voyaGradientNav" x1="6" y1="8" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--cyan)" />
              <stop offset="1" stopColor="var(--violet)" />
            </linearGradient>
          </defs>
        </svg>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--cyan) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          voya
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {user ? (
          <>
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Explore
            </Link>
            <Link 
              to="/profile" 
              className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-user-gear"></i> Profile Setup
            </Link>
            <button 
              onClick={handleLogoutClick} 
              className="btn btn-glass"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn btn-coral" 
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Join voya
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
