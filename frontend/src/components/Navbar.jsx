import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profilePics, setProfilePics] = useState(null);

  useEffect(() => {
    if (!user) {
      setProfilePics(null);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchPic = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.pictures && data.pictures.length > 0) {
            setProfilePics(data.pictures);
          }
        }
      } catch (err) {
        console.error('Error fetching navbar profile picture:', err);
      }
    };
    fetchPic();
  }, [user]);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

    .voya-nav {
      --sand: #FBEFE3;
      --clay: #A83805;
      --terracotta: #C8460A;
      --ink: #2C2520;
      --mist: #F4EAE1;
      --sage: #C8460A;
      --dusk: #40352E;
      --gold: #D4A843;

      margin: 14px 20px 0 20px;
      padding: 0 28px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 18px;
      position: relative;
      z-index: 100;
      background: var(--ink);
      border: 1px solid rgba(245,239,224,0.07);
      font-family: 'DM Sans', sans-serif;
      overflow: hidden;
    }

    .voya-nav::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 120px; height: 120px;
      border-radius: 50%;
      background: var(--terracotta);
      opacity: 0.08;
      pointer-events: none;
    }

    /* ── LOGO ── */
    .voya-nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
      position: relative;
      z-index: 2;
    }

    .voya-nav-logo-mark {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--bg-ink);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .voya-nav-logo:hover .voya-nav-logo-mark {
      transform: rotate(-6deg) scale(1.05);
    }

    .voya-nav-logo-mark svg {
      width: 18px;
      height: 18px;
    }

    .voya-nav-logo-text {
      font-family: 'Monaco', 'Courier New', 'Courier', monospace !important;
      font-size: 1.55rem;
      font-weight: 700;
      color: var(--sage);
      letter-spacing: -0.05em;
      line-height: 1;
      text-transform: lowercase;
    }

    .voya-nav-logo-text span {
      color: var(--sand);
    }

    /* ── LINKS ── */
    .voya-nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 2;
    }

    .voya-nav-link {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 400;
      color: rgba(245,239,224,0.55);
      text-decoration: none;
      transition: color 0.2s, background 0.2s;
      font-family: 'DM Sans', sans-serif;
      letter-spacing: 0.01em;
    }

    .voya-nav-link:hover {
      color: var(--sand);
      background: rgba(245,239,224,0.06);
    }

    .voya-nav-link.active {
      color: var(--sand);
      background: rgba(245,239,224,0.1);
      font-weight: 500;
    }

    .voya-nav-link i {
      font-size: 0.8rem;
      opacity: 0.8;
    }

    /* ── DIVIDER ── */
    .voya-nav-divider {
      width: 1px;
      height: 20px;
      background: rgba(245,239,224,0.1);
      margin: 0 6px;
    }

    /* ── BUTTONS ── */
    .voya-nav-btn-ghost {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 18px;
      border-radius: 100px;
      border: 1px solid rgba(245,239,224,0.18);
      background: transparent;
      color: rgba(245,239,224,0.7);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 400;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }

    .voya-nav-btn-ghost:hover {
      border-color: rgba(245,239,224,0.4);
      color: var(--sand);
      background: rgba(245,239,224,0.04);
    }

    .voya-nav-btn-ghost i { font-size: 0.8rem; }

    .voya-nav-btn-primary {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 9px 22px;
      border-radius: 100px;
      border: none;
      background: var(--terracotta);
      color: white;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s, transform 0.15s;
    }

    .voya-nav-btn-primary:hover {
      background: #d06535;
      transform: translateY(-1px);
    }

    /* ── USER PILL ── */
    .voya-nav-user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px 5px 5px;
      border-radius: 100px;
      background: rgba(245,239,224,0.06);
      border: 1px solid rgba(245,239,224,0.1);
      cursor: pointer;
      text-decoration: none;
      transition: background 0.25s, border-color 0.25s;
    }

    .voya-nav-user-pill:hover {
      background: rgba(245,239,224,0.12);
      border-color: rgba(232, 130, 79, 0.4);
    }

    .voya-nav-user-pill:hover .voya-nav-username {
      color: var(--sand);
    }

    .voya-nav-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--terracotta);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .voya-nav-username {
      font-size: 0.8rem;
      color: rgba(245,239,224,0.6);
      font-weight: 400;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 600px) {
      .voya-nav {
        padding: 0 12px !important;
        height: 56px !important;
        margin: 8px 10px 0 10px !important;
      }
      .voya-nav-links {
        gap: 6px !important;
      }
      .voya-nav-link:not(.voya-nav-login-link),
      .voya-nav-divider {
        display: none !important;
      }
      .voya-nav-login-link {
        display: flex !important;
        font-size: 0.75rem !important;
        padding: 6px 12px !important;
        color: rgba(245,239,224,0.7) !important;
      }
      .voya-nav-username {
        display: none !important;
      }
      .voya-nav-user-pill {
        padding: 5px !important;
        border-radius: 50% !important;
      }
      .voya-nav-btn-ghost {
        padding: 8px 10px !important;
        font-size: 0.75rem !important;
        border-radius: 100px !important;
      }
      .mobile-hide-text {
        display: none !important;
      }
    }

    .voya-desktop-notification-badge {
      position: absolute;
      top: 6px;
      right: 8px;
      width: 7px;
      height: 7px;
      background-color: #ef4444 !important;
      border-radius: 50% !important;
      border: 1px solid var(--ink) !important;
      box-shadow: 0 0 4px rgba(239, 68, 68, 0.6) !important;
    }
  `;

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasUnread(false);
      return;
    }
    const checkNotification = () => {
      const val = localStorage.getItem('voya_unread_notification');
      setHasUnread(val === 'true');
    };
    checkNotification();
    const interval = setInterval(checkNotification, 1500);
    return () => clearInterval(interval);
  }, [user]);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <style>{styles}</style>
      <nav className="voya-nav">
        {/* Logo */}
        <div
          className="voya-nav-logo"
          onClick={() => navigate(user ? '/dashboard' : '/')}
        >
          <div className="voya-nav-logo-mark" style={{ background: 'transparent', width: '54px', height: '54px' }}>
            <img src="/voya_logo_premium.png" alt="Voya Logo" style={{ width: '54px', height: '54px', objectFit: 'contain' }} />
          </div>
          <span className="voya-nav-logo-text" style={{ fontSize: '2.1rem', letterSpacing: '-0.06em', textTransform: 'lowercase' }}>vo<span>ya</span></span>
        </div>

        {/* Right side */}
        <div className="voya-nav-links">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`voya-nav-link ${location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') !== 'ai' ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                <i className="fa-solid fa-compass"></i> Explore
                {hasUnread && (
                  <span className="voya-desktop-notification-badge" />
                )}
              </Link>
              <Link
                to="/dashboard?tab=ai"
                className={`voya-nav-link ${location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === 'ai' ? 'active' : ''}`}
                style={{
                  color: 'var(--terracotta)',
                  fontWeight: '600',
                  border: '1px solid rgba(232, 130, 79, 0.35)',
                  background: location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') === 'ai'
                    ? 'rgba(232, 130, 79, 0.15)'
                    : 'rgba(232, 130, 79, 0.04)',
                  padding: '8px 16px',
                  borderRadius: '100px',
                  marginRight: '6px'
                }}
              >
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--terracotta)' }}></i> AI Guide
              </Link>
              <div className="voya-nav-divider" />

              {/* User pill */}
              <Link
                to="/profile"
                className="voya-nav-user-pill"
                title="Configure traveler profile setup"
              >
                {profilePics?.[0] ? (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundImage: `url(${profilePics[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1.5px solid var(--terracotta)',
                    flexShrink: 0
                  }}></div>
                ) : (
                  <div className="voya-nav-avatar">{initials}</div>
                )}
                {user?.name && (
                  <span className="voya-nav-username">{user.name.split(' ')[0]}</span>
                )}
              </Link>

              <button onClick={handleLogoutClick} className="voya-nav-btn-ghost" title="Sign Out">
                <i className="fa-solid fa-arrow-right-from-bracket"></i> <span className="mobile-hide-text">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`voya-nav-link voya-nav-login-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link to="/register" className="voya-nav-btn-primary">
                Join voya
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;