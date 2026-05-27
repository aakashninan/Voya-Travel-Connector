import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 100px)' }}>
      {/* Dynamic Background Glowing Blobs */}
      <div className="welcome-gradient-bg"></div>
      <div className="welcome-gradient-bg-2"></div>

      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px 60px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          padding: '6px 16px',
          borderRadius: '30px',
          marginBottom: '24px'
        }}>
          <div className="pulse-dot"></div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Discover Your Next Adventure Companion
          </span>
        </div>

        <h1 style={{
          fontSize: '3.8rem',
          lineHeight: '1.1',
          marginBottom: '20px',
          fontWeight: 800,
          letterSpacing: '-0.04em'
        }}>
          Find Your Travel Soulmate.<br />
          <span className="gradient-text">Plan Journeys Together.</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          margin: '0 auto 40px auto',
          lineHeight: '1.6',
          fontWeight: 400
        }}>
          voya connects travelers like a dating app, but for shared trips. 
          Vibe-check strangers using Hinge-style voice and text prompts, swipe to match, 
          and seamlessly organize group adventures with mutual approvals.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/register')} className="btn btn-coral" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
            Get Started For Free <i className="fa-solid fa-arrow-right"></i>
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-glass" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
            Sign In
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto 80px auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Card 1 */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'rgba(255, 77, 121, 0.1)',
            border: '1px solid var(--coral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'var(--coral)',
            fontSize: '1.4rem'
          }}>
            <i className="fa-solid fa-microphone-lines"></i>
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Hinge-Style Vibe Check</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Build a profile packed with personality. Upload travel pictures, answer adventurous text prompts, 
            and share audio voice memos so your future travel buddies can check the vibe before connecting.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid var(--cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'var(--cyan)',
            fontSize: '1.4rem'
          }}>
            <i className="fa-solid fa-sliders"></i>
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Smart Journey Filters</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Customize your search to match your plans perfectly. Filter potential partners by gender, 
            preferred trip durations, target locations, travel calendar schedules, and travel styles.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'rgba(138, 63, 252, 0.15)',
            border: '1px solid var(--violet)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: 'var(--violet)',
            fontSize: '1.4rem'
          }}>
            <i className="fa-solid fa-users-rectangle"></i>
          </div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Double-Opt-In Planning</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Create groups from your mutual matches to discuss itineraries. Group invitations require 
            explicit traveler approvals first, ensuring you only travel with people you've vetted.
          </p>
        </div>
      </div>

      {/* Testimonial Quote */}
      <div className="glass-panel" style={{
        maxWidth: '800px',
        margin: '0 auto 80px auto',
        padding: '40px',
        borderRadius: '24px',
        textAlign: 'center',
        border: '1px dashed var(--glass-border)',
        position: 'relative',
        zIndex: 10
      }}>
        <i className="fa-solid fa-quote-left" style={{ fontSize: '2.5rem', color: 'var(--coral)', opacity: 0.3, marginBottom: '16px' }}></i>
        <h4 style={{ fontStyle: 'italic', fontSize: '1.25rem', fontWeight: 500, marginBottom: '20px', lineHeight: '1.6' }}>
          "voya totally changed how I travel. I was nervous about backpacking solo in Southeast Asia, but I matched with Sarah and Liam. We created a planning group, aligned our calendars, did a voice check, and ended up having the trip of a lifetime!"
        </h4>
        <span style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          — Alex M., Adventurer & Backpacker
        </span>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '40px 24px',
        borderTop: '1px solid var(--glass-border)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        position: 'relative',
        zIndex: 10
      }}>
        <p>&copy; {new Date().getFullYear()} voya Inc. Made with passion for travelers worldwide.</p>
      </footer>
    </div>
  );
};

export default Landing;
