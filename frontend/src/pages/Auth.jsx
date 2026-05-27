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

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)',
      padding: '40px 24px',
      position: 'relative'
    }}>
      <div className="welcome-gradient-bg" style={{ top: '20%' }}></div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '40px',
        borderRadius: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--terracotta)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '22px', height: '22px' }}>
                <path d="M3 4L9 14L15 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="2.8" stroke="white" strokeWidth="1.8"/>
              </svg>
            </div>
            <span style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '2.5rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}>
              vo<span style={{ color: 'var(--terracotta)' }}>ya</span>
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                  style={{ cursor: 'pointer' }}
                >
                  <option value="men" style={{ background: 'var(--bg-dark)' }}>Men</option>
                  <option value="women" style={{ background: 'var(--bg-dark)' }}>Women</option>
                  <option value="other" style={{ background: 'var(--bg-dark)' }}>Other</option>
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
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-coral"
            style={{ width: '100%', marginTop: '8px', position: 'relative' }}
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
              <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
                Login here
              </Link>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--coral)', textDecoration: 'none', fontWeight: 600 }}>
                Sign up for free
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
