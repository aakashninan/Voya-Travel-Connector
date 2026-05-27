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
      --sand: #F5EFE0;
      --clay: #C8704A;
      --terracotta: #E8824F;
      --ink: #1A1410;
      --mist: #EDE8DF;
      --sage: #7A8C6E;
      --dusk: #3D2B1F;
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
      background: var(--terracotta);
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
      font-family: 'Playfair Display', serif;
      font-size: 1.55rem;
      font-weight: 900;
      color: var(--sand);
      letter-spacing: -0.03em;
      line-height: 1;
    }

    .voya-nav-logo-text span {
      color: var(--terracotta);
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
  `;

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
          <div className="voya-nav-logo-mark">
            <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4L9 14L15 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="2.8" stroke="white" strokeWidth="1.8"/>
            </svg>
          </div>
          <span className="voya-nav-logo-text">vo<span>ya</span></span>
        </div>

        {/* Right side */}
        <div className="voya-nav-links">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`voya-nav-link ${location.pathname === '/dashboard' && new URLSearchParams(location.search).get('tab') !== 'ai' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-compass"></i> Explore
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
              <Link
                to="/profile"
                className={`voya-nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-user-gear"></i> Profile Setup
              </Link>

              <div className="voya-nav-divider" />

              {/* User pill */}
              <div className="voya-nav-user-pill">
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
              </div>

              <button onClick={handleLogoutClick} className="voya-nav-btn-ghost">
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`voya-nav-link ${location.pathname === '/login' ? 'active' : ''}`}
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