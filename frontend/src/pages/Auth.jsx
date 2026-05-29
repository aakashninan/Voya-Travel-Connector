import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Auth = ({ isRegister, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'men'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const apiPath = isRegister ? 'register' : 'login';
    const payload = isRegister 
      ? { ...formData, age: Number(formData.age) }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${apiPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success! Save token & call parent handler
      onLoginSuccess(data);

      if (isRegister) {
        // Direct to profile builder for initial setup
        navigate('/profile');
      } else {
        // Direct to explore feed dashboard directly
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const customStyles = `
    @media (max-width: 900px) {
      .auth-cover {
        display: none !important;
      }
      .auth-container {
        justify-content: center !important;
      }
      .auth-form-panel {
        max-width: 100% !important;
        padding: 30px 20px !important;
      }
      .glass-panel-custom {
        padding: 30px 20px !important;
      }
    }
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div className="auth-container" style={{
        display: 'flex',
        minHeight: 'calc(100vh - 70px)',
        background: 'var(--bg-sand)',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden'
      }}>
        {/* 1. LEFT PANEL: VISUAL ADVENTURE SLIDESHOW COVER */}
        <div className="auth-cover" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          position: 'relative',
          backgroundImage: `linear-gradient(to right, rgba(26, 20, 16, 0.75) 0%, rgba(26, 20, 16, 0.4) 100%), url(/voya_auth_cover.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FFF'
        }}>
          {/* Cover logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '14px', height: '14px' }}>
                <path d="M3 4L9 14L15 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="2.8" stroke="white" strokeWidth="1.8"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--bg-sand)' }}>
              voya
            </span>
          </div>

          {/* Cover slogan */}
          <div style={{ maxWidth: '460px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.8rem',
              fontWeight: 900,
              lineHeight: '1.2',
              color: '#FFF',
              marginBottom: '20px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Explore the world with travelers who share your <span style={{ color: 'var(--terracotta)' }}>rhythm.</span>
            </h1>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: '1.6',
              fontWeight: 400
            }}>
              Connect with premium companions, draft seamless itineraries using Voya AI, and embark on shared planning adventures.
            </p>
          </div>

          {/* Cover footer info */}
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '16px' }}>
            <span>📍 Munnar, Kerala</span>
            <span>•</span>
            <span>🌍 4.2k active nodes</span>
          </div>
        </div>

        {/* 2. RIGHT PANEL: SIGN IN / UP FORM */}
        <div className="auth-form-panel" style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 60px',
          background: 'var(--bg-gradient)',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Back to Home Button */}
          <button 
            onClick={() => navigate('/')}
            className="btn btn-glass"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 10,
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </button>

          <div className="glass-panel glass-panel-custom" style={{
            width: '100%',
            padding: '40px',
            borderRadius: '24px',
            background: 'var(--glass-card)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '8px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {isRegister ? 'Find companion travelers around the globe' : 'Sign in to connect with matching travelers'}
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#f87171',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Aakash"
                    value={formData.name}
                    onChange={handleChange}
                    className="glass-input"
                    style={{ background: '#FFF', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px', width: '100%' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ background: '#FFF', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px', width: '100%' }}
                />
              </div>

              {isRegister && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      required
                      min="18"
                      max="120"
                      placeholder="e.g. 24"
                      value={formData.age}
                      onChange={handleChange}
                      className="glass-input"
                      style={{ background: '#FFF', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px', width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="glass-input"
                      style={{ cursor: 'pointer', background: '#FFF', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px', width: '100%' }}
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="glass-input"
                  style={{ background: '#FFF', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px', width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-coral"
                style={{ width: '100%', marginTop: '8px', background: 'var(--terracotta)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> Processing...
                  </>
                ) : (
                  isRegister ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--glass-border)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              {isRegister ? (
                <span>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--terracotta)', textDecoration: 'none', fontWeight: 600 }}>
                    Login here
                  </Link>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: 'var(--terracotta)', textDecoration: 'none', fontWeight: 600 }}>
                    Sign up for free
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
