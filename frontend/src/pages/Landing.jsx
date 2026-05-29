import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

    .voya-landing * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .voya-landing {
      font-family: 'DM Sans', sans-serif;
      --sand: #F5EFE0;
      --clay: #C8704A;
      --terracotta: #E8824F;
      --ink: #1A1410;
      --mist: #EDE8DF;
      --sage: #7A8C6E;
      --dusk: #3D2B1F;
      --gold: #D4A843;
      background: var(--sand);
      color: var(--ink);
      overflow-x: hidden;
    }

    /* ── HERO ── */
    .voya-hero {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .voya-hero-left {
      background: var(--ink);
      padding: 48px 48px 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .voya-hero-left::before {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: var(--terracotta);
      opacity: 0.15;
      pointer-events: none;
    }

    .voya-hero-left::after {
      content: '';
      position: absolute;
      bottom: 60px; left: -60px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: var(--gold);
      opacity: 0.1;
      pointer-events: none;
    }

    .voya-logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 900;
      color: var(--sand);
      letter-spacing: -0.02em;
      position: relative;
      z-index: 2;
    }

    .voya-logo span { color: var(--terracotta); }

    .voya-hero-headline { position: relative; z-index: 2; }

    .voya-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(232,130,79,0.15);
      border: 1px solid rgba(232,130,79,0.3);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--terracotta);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 28px;
    }

    .voya-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--terracotta);
      animation: voya-pulse 2s ease-in-out infinite;
    }

    @keyframes voya-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.7); }
    }

    .voya-h1 {
      font-family: 'Playfair Display', serif;
      font-size: 4.2rem;
      font-weight: 900;
      line-height: 1.02;
      color: var(--sand);
      letter-spacing: -0.04em;
      margin-bottom: 20px;
    }

    .voya-h1 em {
      font-style: italic;
      color: var(--terracotta);
    }

    .voya-hero-sub {
      font-size: 0.95rem;
      color: rgba(245,239,224,0.55);
      line-height: 1.65;
      font-weight: 300;
      max-width: 360px;
      margin-bottom: 36px;
    }

    .voya-hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .voya-btn-primary {
      background: var(--terracotta);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s, transform 0.15s;
    }

    .voya-btn-primary:hover { background: #d06535; transform: translateY(-1px); }

    .voya-btn-ghost {
      background: transparent;
      color: var(--sand);
      border: 1px solid rgba(245,239,224,0.25);
      padding: 14px 28px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 400;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }

    .voya-btn-ghost:hover {
      border-color: rgba(245,239,224,0.6);
      background: rgba(245,239,224,0.05);
    }

    .voya-stats-row {
      display: flex;
      gap: 32px;
      position: relative;
      z-index: 2;
    }

    .voya-stat-number {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--sand);
      line-height: 1;
    }

    .voya-stat-label {
      font-size: 0.75rem;
      color: rgba(245,239,224,0.4);
      font-weight: 300;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .voya-stat-divider {
      width: 1px;
      background: rgba(245,239,224,0.1);
      align-self: stretch;
    }

    /* ── HERO RIGHT ── */
    .voya-hero-right {
      background: var(--mist);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 40px;
    }

    .voya-dest-grid {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 3px;
    }

    .voya-dest-card {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      padding: 16px;
    }

    .voya-dest-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .voya-dest-bg svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .voya-dest-label {
      position: relative;
      z-index: 2;
      background: rgba(26,20,16,0.6);
      backdrop-filter: blur(6px);
      color: white;
      padding: 5px 12px;
      border-radius: 100px;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.05em;
    }

    .voya-hero-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 60%;
      background: linear-gradient(to top, rgba(26,20,16,0.85), transparent);
      pointer-events: none;
    }

    .voya-match-card {
      position: relative;
      z-index: 10;
      background: rgba(245,239,224,0.96);
      border-radius: 20px;
      padding: 20px 22px;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 320px;
      animation: voya-floatUp 0.6s ease both;
    }

    @keyframes voya-floatUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .voya-match-avatars { display: flex; }

    .voya-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 2px solid var(--sand);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin-left: -10px;
      flex-shrink: 0;
    }

    .voya-avatar:first-child { margin-left: 0; }
    .voya-av1 { background: #D4956E; }
    .voya-av2 { background: #7A9E8A; }
    .voya-av3 { background: #8A7EB8; }

    .voya-match-title { font-size: 0.85rem; font-weight: 500; color: var(--ink); }
    .voya-match-sub { font-size: 0.72rem; color: var(--sage); margin-top: 2px; }

    .voya-match-action {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: var(--terracotta);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    /* ── FEATURES ── */
    .voya-features {
      padding: 100px 60px;
      background: var(--sand);
    }

    .voya-section-kicker {
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--sage);
      margin-bottom: 16px;
    }

    .voya-section-title {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: var(--ink);
      max-width: 500px;
      margin-bottom: 60px;
    }

    .voya-features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
    }

    .voya-feat-card {
      background: var(--mist);
      padding: 40px 36px;
      position: relative;
      overflow: hidden;
    }

    .voya-feat-card:first-child { border-radius: 24px 0 0 24px; }
    .voya-feat-card:last-child { border-radius: 0 24px 24px 0; }
    .voya-feat-card:hover .voya-feat-icon-wrap { transform: scale(1.08); }

    .voya-feat-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      margin-bottom: 24px;
      transition: transform 0.2s;
    }

    .voya-icon-coral { background: rgba(200,112,74,0.12); color: var(--clay); }
    .voya-icon-sage  { background: rgba(122,140,110,0.12); color: var(--sage); }
    .voya-icon-gold  { background: rgba(212,168,67,0.12); color: var(--gold); }

    .voya-feat-number {
      position: absolute;
      top: 32px; right: 32px;
      font-family: 'Playfair Display', serif;
      font-size: 4rem;
      font-weight: 900;
      color: rgba(26,20,16,0.04);
      line-height: 1;
      pointer-events: none;
    }

    .voya-feat-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .voya-feat-desc {
      font-size: 0.88rem;
      color: rgba(26,20,16,0.55);
      line-height: 1.7;
      font-weight: 300;
    }

    /* ── TESTIMONIAL ── */
    .voya-testimonial {
      padding: 80px 60px;
      background: var(--ink);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }

    .voya-quote-mark {
      font-family: 'Playfair Display', serif;
      font-size: 8rem;
      line-height: 0.6;
      color: var(--terracotta);
      opacity: 0.4;
      margin-bottom: 16px;
    }

    .voya-quote-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      font-style: italic;
      color: var(--sand);
      line-height: 1.55;
      margin-bottom: 28px;
    }

    .voya-quote-author {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .voya-author-avatar {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: var(--terracotta);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .voya-author-name { font-size: 0.9rem; font-weight: 500; color: var(--sand); }
    .voya-author-role { font-size: 0.75rem; color: rgba(245,239,224,0.4); margin-top: 2px; }

    .voya-trip-preview {
      background: rgba(245,239,224,0.04);
      border: 1px solid rgba(245,239,224,0.08);
      border-radius: 24px;
      padding: 32px;
    }

    .voya-trip-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .voya-trip-title {
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(245,239,224,0.35);
    }

    .voya-trip-badge {
      font-size: 0.7rem;
      padding: 4px 12px;
      border-radius: 100px;
      background: rgba(122,140,110,0.2);
      color: #9AB88A;
      font-weight: 500;
    }

    .voya-member-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(245,239,224,0.06);
    }

    .voya-member-row:last-child { border-bottom: none; }

    .voya-mem-av {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }

    .voya-mem-name { font-size: 0.85rem; color: var(--sand); flex: 1; font-weight: 400; }

    .voya-mem-status {
      font-size: 0.7rem;
      padding: 3px 10px;
      border-radius: 100px;
      font-weight: 500;
    }

    .voya-status-confirmed { background: rgba(122,140,110,0.2); color: #9AB88A; }
    .voya-status-pending   { background: rgba(212,168,67,0.15); color: #D4A843; }

    /* ── CTA ── */
    .voya-cta {
      padding: 100px 60px;
      background: var(--terracotta);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .voya-cta::before {
      content: 'voya';
      position: absolute;
      font-family: 'Playfair Display', serif;
      font-size: 18rem;
      font-weight: 900;
      font-style: italic;
      color: rgba(255,255,255,0.06);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      letter-spacing: -0.05em;
      white-space: nowrap;
    }

    .voya-cta-title {
      font-family: 'Playfair Display', serif;
      font-size: 3.5rem;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: white;
      margin-bottom: 16px;
      position: relative;
    }

    .voya-cta-sub {
      font-size: 1rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 40px;
      font-weight: 300;
      position: relative;
    }

    .voya-btn-white {
      background: white;
      color: var(--clay);
      border: none;
      padding: 16px 36px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      margin-right: 12px;
      transition: transform 0.15s, box-shadow 0.15s;
      position: relative;
    }

    .voya-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

    .voya-btn-outline-white {
      background: transparent;
      color: white;
      border: 1.5px solid rgba(255,255,255,0.4);
      padding: 16px 36px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 400;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      position: relative;
    }

    .voya-btn-outline-white:hover { border-color: white; background: rgba(255,255,255,0.08); }

    /* ── FOOTER ── */
    .voya-footer {
      background: var(--dusk);
      padding: 32px 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .voya-footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      font-weight: 900;
      color: var(--sand);
    }

    .voya-footer-logo span { color: var(--terracotta); }

    .voya-footer-copy {
      font-size: 0.78rem;
      color: rgba(245,239,224,0.3);
      font-weight: 300;
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 900px) {
      .voya-hero { grid-template-columns: 1fr; min-height: auto; }
      .voya-hero-right { min-height: 50vh; }
      .voya-h1 { font-size: 2.8rem; }
      .voya-features { padding: 60px 24px; }
      .voya-features-grid { grid-template-columns: 1fr; gap: 16px; }
      .voya-feat-card:first-child { border-radius: 24px 24px 0 0; }
      .voya-feat-card:last-child { border-radius: 0 0 24px 24px; }
      .voya-testimonial { grid-template-columns: 1fr; gap: 40px; padding: 60px 24px; }
      .voya-cta { padding: 60px 24px; }
      .voya-cta-title { font-size: 2.2rem; }
      .voya-footer { flex-direction: column; gap: 12px; text-align: center; padding: 28px 24px; }
      .voya-hero-left { padding: 36px 28px 48px; }
      .voya-section-title { font-size: 2.2rem; }
    }
  `;

  return (
    <div className="voya-landing" style={{ position: 'relative', minHeight: 'calc(100vh - 100px)' }}>
      <style>{styles}</style>

      {/* ── HERO ── */}
      <div className="voya-hero">

        {/* Left: Dark panel */}
        <div className="voya-hero-left">
          <div className="voya-logo">vo<span>ya</span></div>

          <div className="voya-hero-headline">
            <div className="voya-badge">
              <div className="voya-badge-dot" />
              Discover Your Next Adventure Companion
            </div>

            <h1 className="voya-h1">
              Travel<br />with <em>the right<br />people.</em>
            </h1>

            <p className="voya-hero-sub">
              Voya connects solo travelers with the perfect companions for shared adventures. Skip the impersonal travel forums—vibe-check potential trip partners through personality prompts, match with like-minded explorers, and co-create unforgettable journeys together.
            </p>

            <div className="voya-hero-actions">
              <button onClick={() => navigate('/register')} className="voya-btn-primary">
                Get Started For Free &nbsp;→
              </button>
              <button onClick={() => navigate('/login')} className="voya-btn-ghost">
                Sign In
              </button>
            </div>
          </div>

          <div className="voya-stats-row" style={{ flexWrap: 'wrap', gap: '20px 32px' }}>
            <div>
              <div className="voya-stat-number" style={{ fontSize: '1.45rem', letterSpacing: '-0.02em' }}>100% Free</div>
              <div className="voya-stat-label">Open Beta Access</div>
            </div>
            <div className="voya-stat-divider" />
            <div>
              <div className="voya-stat-number" style={{ fontSize: '1.45rem', letterSpacing: '-0.02em' }}>Global</div>
              <div className="voya-stat-label">Destinations</div>
            </div>
            <div className="voya-stat-divider" />
            <div>
              <div className="voya-stat-number" style={{ fontSize: '1.45rem', letterSpacing: '-0.02em' }}>AI Guided</div>
              <div className="voya-stat-label">Co-Pilot Engine</div>
            </div>
          </div>
        </div>

        {/* Right: Destination grid */}
        <div className="voya-hero-right">
          <div className="voya-dest-grid">
            {/* Bali – tropical beach */}
            <div className="voya-dest-card">
              <div className="voya-dest-bg">
                <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bali-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A6B9A"/>
                      <stop offset="100%" stopColor="#F4A261"/>
                    </linearGradient>
                    <linearGradient id="bali-sea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2196A6"/>
                      <stop offset="100%" stopColor="#1A7A8A"/>
                    </linearGradient>
                  </defs>
                  {/* Sky */}
                  <rect width="300" height="220" fill="url(#bali-sky)"/>
                  {/* Sun */}
                  <circle cx="220" cy="55" r="28" fill="#FFCE6B" opacity="0.9"/>
                  <circle cx="220" cy="55" r="38" fill="#FFB84A" opacity="0.2"/>
                  {/* Distant hills */}
                  <ellipse cx="60" cy="130" rx="90" ry="55" fill="#1A5C40" opacity="0.7"/>
                  <ellipse cx="180" cy="120" rx="110" ry="60" fill="#1E6B48" opacity="0.6"/>
                  {/* Sea */}
                  <rect x="0" y="145" width="300" height="75" fill="url(#bali-sea)"/>
                  {/* Water shimmer lines */}
                  <rect x="20" y="155" width="60" height="2" rx="1" fill="white" opacity="0.15"/>
                  <rect x="100" y="162" width="80" height="2" rx="1" fill="white" opacity="0.12"/>
                  <rect x="190" y="158" width="50" height="2" rx="1" fill="white" opacity="0.1"/>
                  <rect x="30" y="170" width="40" height="1.5" rx="1" fill="white" opacity="0.1"/>
                  {/* Beach */}
                  <ellipse cx="150" cy="148" rx="180" ry="18" fill="#E8C99A"/>
                  {/* Palm trunk left */}
                  <path d="M55 220 Q58 180 65 155 Q68 145 72 138" stroke="#5C3D1E" strokeWidth="5" fill="none" strokeLinecap="round"/>
                  {/* Palm fronds left */}
                  <path d="M72 138 Q55 115 30 118" stroke="#2D7A3A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M72 138 Q65 112 60 100" stroke="#2D7A3A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M72 138 Q88 112 100 108" stroke="#2D7A3A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M72 138 Q85 120 95 125" stroke="#3A9048" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M72 138 Q50 125 40 130" stroke="#3A9048" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  {/* Palm trunk right */}
                  <path d="M255 220 Q250 185 242 158 Q238 148 234 140" stroke="#5C3D1E" strokeWidth="5" fill="none" strokeLinecap="round"/>
                  {/* Palm fronds right */}
                  <path d="M234 140 Q252 118 278 122" stroke="#2D7A3A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M234 140 Q240 114 245 102" stroke="#2D7A3A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M234 140 Q218 115 206 112" stroke="#2D7A3A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M234 140 Q216 128 205 132" stroke="#3A9048" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  {/* Coconuts */}
                  <circle cx="78" cy="141" r="5" fill="#8B5E2A"/>
                  <circle cx="85" cy="145" r="4" fill="#7A5222"/>
                  {/* Small boat */}
                  <path d="M130 152 Q150 148 170 152 L165 158 Q150 160 135 158 Z" fill="#C8704A" opacity="0.8"/>
                  <line x1="150" y1="148" x2="150" y2="138" stroke="#8B5E2A" strokeWidth="1.5"/>
                  <path d="M150 138 Q162 142 150 148" fill="white" opacity="0.7"/>
                </svg>
              </div>
              <span className="voya-dest-label">Bali, Indonesia</span>
            </div>

            {/* Marrakech – desert & architecture */}
            <div className="voya-dest-card">
              <div className="voya-dest-bg">
                <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="mrc-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4522A"/>
                      <stop offset="60%" stopColor="#E8824F"/>
                      <stop offset="100%" stopColor="#F4A261"/>
                    </linearGradient>
                    <linearGradient id="mrc-sand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C8956B"/>
                      <stop offset="100%" stopColor="#A06438"/>
                    </linearGradient>
                  </defs>
                  <rect width="300" height="220" fill="url(#mrc-sky)"/>
                  {/* Moon */}
                  <circle cx="240" cy="45" r="20" fill="#FFEAB0" opacity="0.95"/>
                  <circle cx="249" cy="40" r="16" fill="#D4522A" opacity="0.95"/>
                  {/* Star of David–style star */}
                  <polygon points="55,30 58,40 68,40 60,46 63,56 55,50 47,56 50,46 42,40 52,40" fill="#FFEAB0" opacity="0.5" transform="scale(0.5) translate(60,20)"/>
                  <polygon points="120,18 122,24 128,24 123,28 125,34 120,30 115,34 117,28 112,24 118,24" fill="#FFEAB0" opacity="0.4"/>
                  {/* Desert dunes */}
                  <path d="M0 165 Q75 130 150 158 Q225 182 300 145 L300 220 L0 220Z" fill="url(#mrc-sand)"/>
                  <path d="M0 180 Q60 160 120 172 Q200 188 300 165 L300 220 L0 220Z" fill="#A06438" opacity="0.6"/>
                  {/* Building base */}
                  <rect x="90" y="105" width="120" height="70" fill="#C8704A"/>
                  <rect x="98" y="113" width="104" height="62" fill="#D4845A"/>
                  {/* Arch entrance */}
                  <path d="M135 175 L135 148 Q150 136 165 148 L165 175Z" fill="#8B4A2A"/>
                  {/* Door */}
                  <rect x="141" y="155" width="18" height="20" rx="1" fill="#5C2E10"/>
                  {/* Windows */}
                  <path d="M105 130 L105 122 Q112 116 119 122 L119 130Z" fill="#8B4A2A"/>
                  <path d="M181 130 L181 122 Q188 116 195 122 L195 130Z" fill="#8B4A2A"/>
                  {/* Tower / minaret */}
                  <rect x="136" y="68" width="28" height="40" fill="#BE6840"/>
                  <rect x="132" y="60" width="36" height="12" fill="#C8704A"/>
                  <rect x="134" y="52" width="32" height="10" fill="#BE6840"/>
                  <path d="M150 40 L143 52 L157 52Z" fill="#D4845A"/>
                  {/* Crescent on top */}
                  <circle cx="150" cy="36" r="5" fill="#FFEAB0" opacity="0.9"/>
                  <circle cx="153" cy="34" r="4" fill="#BE6840"/>
                  {/* Wall left */}
                  <rect x="0" y="138" width="90" height="37" fill="#B8603A"/>
                  <rect x="0" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="20" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="40" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="60" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="80" y="128" width="10" height="47" fill="#BE6840"/>
                  {/* Wall right */}
                  <rect x="210" y="138" width="90" height="37" fill="#B8603A"/>
                  <rect x="210" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="230" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="250" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="270" y="128" width="10" height="47" fill="#BE6840"/>
                  <rect x="290" y="128" width="10" height="47" fill="#BE6840"/>
                  {/* Decorative pattern on building */}
                  <rect x="106" y="140" width="88" height="2" fill="#BE6840" opacity="0.5"/>
                  <rect x="106" y="136" width="88" height="1" fill="#FFEAB0" opacity="0.15"/>
                </svg>
              </div>
              <span className="voya-dest-label">Marrakech, Morocco</span>
            </div>

            {/* Patagonia – mountains & lake */}
            <div className="voya-dest-card">
              <div className="voya-dest-bg">
                <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="pat-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A3A5C"/>
                      <stop offset="100%" stopColor="#2D6B8A"/>
                    </linearGradient>
                    <linearGradient id="pat-lake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2A6B8A"/>
                      <stop offset="100%" stopColor="#1A4A6A"/>
                    </linearGradient>
                    <linearGradient id="pat-mtn1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8E8E8"/>
                      <stop offset="30%" stopColor="#8AACBA"/>
                      <stop offset="100%" stopColor="#4A6878"/>
                    </linearGradient>
                    <linearGradient id="pat-mtn2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D0D8DC"/>
                      <stop offset="35%" stopColor="#5A7A8A"/>
                      <stop offset="100%" stopColor="#3A5868"/>
                    </linearGradient>
                  </defs>
                  <rect width="300" height="220" fill="url(#pat-sky)"/>
                  {/* Stars */}
                  <circle cx="30" cy="20" r="1.5" fill="white" opacity="0.8"/>
                  <circle cx="80" cy="12" r="1" fill="white" opacity="0.6"/>
                  <circle cx="130" cy="25" r="1.5" fill="white" opacity="0.7"/>
                  <circle cx="200" cy="15" r="1" fill="white" opacity="0.5"/>
                  <circle cx="260" cy="30" r="1.5" fill="white" opacity="0.8"/>
                  <circle cx="50" cy="45" r="1" fill="white" opacity="0.4"/>
                  <circle cx="240" cy="50" r="1" fill="white" opacity="0.5"/>
                  {/* Back mountains */}
                  <path d="M-20 145 L40 60 L100 130 L160 55 L220 115 L280 50 L340 130 L340 220 L-20 220Z" fill="url(#pat-mtn2)" opacity="0.7"/>
                  {/* Snow caps back */}
                  <path d="M40 60 L28 90 L52 90Z" fill="white" opacity="0.6"/>
                  <path d="M160 55 L148 82 L172 82Z" fill="white" opacity="0.6"/>
                  <path d="M280 50 L265 82 L295 82Z" fill="white" opacity="0.6"/>
                  {/* Main mountains */}
                  <path d="M-10 175 L60 75 L110 140 L180 50 L240 125 L300 70 L340 150 L340 220 L-10 220Z" fill="url(#pat-mtn1)"/>
                  {/* Snow caps front */}
                  <path d="M60 75 L45 108 L75 108Z" fill="white" opacity="0.9"/>
                  <path d="M180 50 L162 88 L198 88Z" fill="white" opacity="0.95"/>
                  <path d="M300 70 L283 105 L317 105Z" fill="white" opacity="0.85"/>
                  {/* Glacier streaks */}
                  <path d="M180 50 L172 110" stroke="white" strokeWidth="3" opacity="0.4" strokeLinecap="round"/>
                  <path d="M180 50 L188 115" stroke="white" strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
                  {/* Foreground hills green */}
                  <path d="M0 175 Q75 155 150 168 Q225 180 300 160 L300 220 L0 220Z" fill="#2A5C3A"/>
                  <path d="M0 188 Q90 175 160 182 Q230 190 300 175 L300 220 L0 220Z" fill="#1E4A2E"/>
                  {/* Lake reflection */}
                  <ellipse cx="150" cy="195" rx="80" ry="18" fill="url(#pat-lake)" opacity="0.8"/>
                  <ellipse cx="150" cy="195" rx="70" ry="10" fill="#3A8AAA" opacity="0.3"/>
                  {/* Mountain reflection in lake */}
                  <path d="M110 185 L150 198 L190 185" fill="none" stroke="#5AAAC8" strokeWidth="1.5" opacity="0.3"/>
                  {/* Pine trees silhouette */}
                  <path d="M15 175 L20 155 L25 175Z" fill="#1A3A22"/>
                  <path d="M22 178 L28 152 L34 178Z" fill="#1A3A22"/>
                  <path d="M270 168 L275 148 L280 168Z" fill="#1A3A22"/>
                  <path d="M278 172 L284 150 L290 172Z" fill="#1A3A22"/>
                  <path d="M285 170 L291 146 L297 170Z" fill="#1A3A22"/>
                  {/* Condor silhouette */}
                  <path d="M100 85 Q108 80 116 85 Q108 90 100 85Z" fill="#1A1A2A" opacity="0.6"/>
                </svg>
              </div>
              <span className="voya-dest-label">Patagonia, Chile</span>
            </div>

            {/* Kyoto – cherry blossoms & pagoda */}
            <div className="voya-dest-card">
              <div className="voya-dest-bg">
                <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="kyo-sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8A4A7A"/>
                      <stop offset="50%" stopColor="#C87890"/>
                      <stop offset="100%" stopColor="#F0B8C0"/>
                    </linearGradient>
                  </defs>
                  <rect width="300" height="220" fill="url(#kyo-sky)"/>
                  {/* Hazy mountains background */}
                  <path d="M0 140 Q80 100 160 125 Q240 148 300 110 L300 220 L0 220Z" fill="#6A3A5A" opacity="0.35"/>
                  {/* Ground */}
                  <rect x="0" y="175" width="300" height="45" fill="#8B5E78"/>
                  <rect x="0" y="182" width="300" height="38" fill="#7A4E68"/>
                  {/* Path */}
                  <path d="M110 220 Q150 185 190 220" fill="#C89AAA" opacity="0.4"/>
                  {/* Pagoda */}
                  {/* Base */}
                  <rect x="128" y="158" width="44" height="18" fill="#4A2A3A"/>
                  {/* Level 3 */}
                  <rect x="132" y="140" width="36" height="20" fill="#5A3A4A"/>
                  <path d="M122 140 Q150 130 178 140" fill="#3A1A2A"/>
                  <path d="M120 139 L150 128 L180 139Z" fill="#4A2A3A"/>
                  {/* Level 2 */}
                  <rect x="136" y="118" width="28" height="24" fill="#5A3A4A"/>
                  <path d="M126 118 Q150 108 174 118" fill="#3A1A2A"/>
                  <path d="M124 117 L150 106 L176 117Z" fill="#4A2A3A"/>
                  {/* Level 1 */}
                  <rect x="140" y="100" width="20" height="20" fill="#5A3A4A"/>
                  <path d="M132 100 Q150 91 168 100" fill="#3A1A2A"/>
                  <path d="M130 99 L150 89 L170 99Z" fill="#4A2A3A"/>
                  {/* Finial */}
                  <rect x="148" y="78" width="4" height="14" fill="#6A4A5A"/>
                  <circle cx="150" cy="76" r="4" fill="#D4A843" opacity="0.9"/>
                  {/* Pagoda windows */}
                  <rect x="145" y="146" width="10" height="10" rx="1" fill="#1A0A12"/>
                  <rect x="145" y="124" width="10" height="10" rx="1" fill="#1A0A12"/>
                  <rect x="146" y="106" width="8" height="8" rx="1" fill="#1A0A12"/>
                  {/* Cherry blossom trees left */}
                  <rect x="35" y="150" width="6" height="35" fill="#6B3A28" rx="2"/>
                  <rect x="28" y="128" width="5" height="28" fill="#6B3A28" rx="2" transform="rotate(-15 28 128)"/>
                  <circle cx="38" cy="135" r="28" fill="#E890A8" opacity="0.85"/>
                  <circle cx="22" cy="128" r="20" fill="#F0A8BE" opacity="0.75"/>
                  <circle cx="55" cy="130" r="22" fill="#E080A0" opacity="0.8"/>
                  {/* Blossom details */}
                  <circle cx="30" cy="120" r="5" fill="#F8C8D8" opacity="0.6"/>
                  <circle cx="50" cy="118" r="4" fill="#F8C8D8" opacity="0.5"/>
                  <circle cx="38" cy="110" r="5" fill="#F8C8D8" opacity="0.55"/>
                  {/* Cherry blossom trees right */}
                  <rect x="260" y="152" width="6" height="33" fill="#6B3A28" rx="2"/>
                  <rect x="268" y="130" width="5" height="26" fill="#6B3A28" rx="2" transform="rotate(12 268 130)"/>
                  <circle cx="262" cy="138" r="25" fill="#E890A8" opacity="0.8"/>
                  <circle cx="278" cy="132" r="20" fill="#F0A8BE" opacity="0.75"/>
                  <circle cx="247" cy="134" r="20" fill="#E080A0" opacity="0.75"/>
                  {/* Falling petals */}
                  <ellipse cx="90" cy="148" rx="4" ry="2" fill="#F0A8BE" opacity="0.7" transform="rotate(-30 90 148)"/>
                  <ellipse cx="108" cy="158" rx="3" ry="1.5" fill="#F8C8D8" opacity="0.6" transform="rotate(20 108 158)"/>
                  <ellipse cx="200" cy="145" rx="4" ry="2" fill="#F0A8BE" opacity="0.65" transform="rotate(-15 200 145)"/>
                  <ellipse cx="215" cy="162" rx="3" ry="1.5" fill="#F8C8D8" opacity="0.55" transform="rotate(35 215 162)"/>
                  <ellipse cx="170" cy="152" rx="3" ry="1.5" fill="#F0A8BE" opacity="0.6" transform="rotate(-20 170 152)"/>
                  <ellipse cx="130" cy="170" rx="4" ry="2" fill="#F8C8D8" opacity="0.5" transform="rotate(10 130 170)"/>
                  {/* Red bridge */}
                  <path d="M60 180 Q150 170 240 180" fill="none" stroke="#C8302A" strokeWidth="5" opacity="0.8"/>
                  <line x1="90" y1="180" x2="90" y2="192" stroke="#C8302A" strokeWidth="3" opacity="0.7"/>
                  <line x1="150" y1="175" x2="150" y2="192" stroke="#C8302A" strokeWidth="3" opacity="0.7"/>
                  <line x1="210" y1="180" x2="210" y2="192" stroke="#C8302A" strokeWidth="3" opacity="0.7"/>
                  {/* Lanterns */}
                  <rect x="88" y="168" width="5" height="8" rx="2" fill="#D4A843" opacity="0.8"/>
                  <rect x="208" y="168" width="5" height="8" rx="2" fill="#D4A843" opacity="0.8"/>
                </svg>
              </div>
              <span className="voya-dest-label">Kyoto, Japan</span>
            </div>
          </div>

          <div className="voya-hero-overlay" />

          <div className="voya-match-card">
            <div className="voya-match-avatars">
              <div className="voya-avatar voya-av1">🧡</div>
              <div className="voya-avatar voya-av2">🌿</div>
              <div className="voya-avatar voya-av3">✨</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="voya-match-title">3 new matches!</div>
              <div className="voya-match-sub">Bali trip · 12 days · Jan 2026</div>
            </div>
            <div className="voya-match-action">→</div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="voya-features">
        <div className="voya-section-kicker">How it works</div>
        <div className="voya-section-title">Three steps to your perfect trip.</div>

        <div className="voya-features-grid">
          {/* Card 1 */}
          <div className="voya-feat-card">
            <div className="voya-feat-number">01</div>
            <div className="voya-feat-icon-wrap voya-icon-coral">
              <i className="fa-solid fa-microphone-lines" />
            </div>
            <div className="voya-feat-title">Vibe Check</div>
            <p className="voya-feat-desc">
              Build a profile packed with personality. Upload travel pictures, answer adventurous text prompts,
              and share audio voice memos so your future travel buddies can check the vibe before connecting.
            </p>
          </div>

          {/* Card 2 */}
          <div className="voya-feat-card">
            <div className="voya-feat-number">02</div>
            <div className="voya-feat-icon-wrap voya-icon-sage">
              <i className="fa-solid fa-sliders" />
            </div>
            <div className="voya-feat-title">Smart Journey Filters</div>
            <p className="voya-feat-desc">
              Customize your search to match your plans perfectly. Filter potential partners by gender,
              preferred trip durations, target locations, travel calendar schedules, and travel styles.
            </p>
          </div>

          {/* Card 3 */}
          <div className="voya-feat-card">
            <div className="voya-feat-number">03</div>
            <div className="voya-feat-icon-wrap voya-icon-gold">
              <i className="fa-solid fa-users-rectangle" />
            </div>
            <div className="voya-feat-title">Double-Opt-In Planning</div>
            <p className="voya-feat-desc">
              Create groups from your mutual matches to discuss itineraries. Group invitations require
              explicit traveler approvals first, ensuring you only travel with people you've vetted.
            </p>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIAL + GROUP PREVIEW ── */}
      <div className="voya-testimonial">
        <div>
          <div className="voya-quote-mark" style={{ fontSize: '3rem', color: 'var(--terracotta)' }}>“</div>
          <div className="voya-quote-text" style={{ fontStyle: 'normal', fontSize: '1.25rem', lineHeight: '1.65' }}>
            We founded voya to make travel social, transparent, and completely free from solo-explorer friction. By combining real-time companion matching with intuitive day-by-day AI planning, we want to help you discover not just new landscapes, but a global family of adventurers. Your next great story starts with the people you share it with.
          </div>
          <div className="voya-quote-author" style={{ marginTop: '24px' }}>
            <div className="voya-author-avatar" style={{ background: 'var(--terracotta)', fontWeight: 700 }}>VF</div>
            <div>
              <div className="voya-author-name">The voya Founders</div>
              <div className="voya-author-role">Team Voya</div>
            </div>
          </div>
        </div>

        <div className="voya-trip-preview">
          <div className="voya-trip-header">
            <div className="voya-trip-title">🗺️ &nbsp;Southeast Asia Group</div>
            <div className="voya-trip-badge">Active Trip</div>
          </div>
          <div className="voya-member-row">
            <div className="voya-mem-av" style={{ background: '#C8704A' }}>A</div>
            <div className="voya-mem-name">Alex M.</div>
            <div className="voya-mem-status voya-status-confirmed">Confirmed</div>
          </div>
          <div className="voya-member-row">
            <div className="voya-mem-av" style={{ background: '#7A8C6E' }}>S</div>
            <div className="voya-mem-name">Sarah K.</div>
            <div className="voya-mem-status voya-status-confirmed">Confirmed</div>
          </div>
          <div className="voya-member-row">
            <div className="voya-mem-av" style={{ background: '#8A7EB8' }}>L</div>
            <div className="voya-mem-name">Liam T.</div>
            <div className="voya-mem-status voya-status-confirmed">Confirmed</div>
          </div>
          <div className="voya-member-row">
            <div className="voya-mem-av" style={{ background: '#B88870' }}>+2</div>
            <div className="voya-mem-name">2 pending invites</div>
            <div className="voya-mem-status voya-status-pending">Awaiting</div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="voya-cta">
        <div className="voya-cta-title">
          Your next adventure<br />is one match away.
        </div>
        <p className="voya-cta-sub">
          Join thousands of travelers already finding their perfect trip companions.
        </p>
        <button onClick={() => navigate('/register')} className="voya-btn-white">
          Create Your Profile
        </button>
        <button onClick={() => navigate('/login')} className="voya-btn-outline-white">
          Sign In
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="voya-footer">
        <div className="voya-footer-logo">vo<span>ya</span></div>
        <div className="voya-footer-copy">
          &copy; {new Date().getFullYear()} voya Inc. Made with passion for travelers worldwide.
        </div>
      </footer>
    </div>
  );
};

export default Landing;