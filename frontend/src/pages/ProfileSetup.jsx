import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const TRAVEL_STYLE_OPTIONS = [
  'Backpacking', 'Adventure', 'Luxury', 'Relaxing', 'Road-Trips', 'Foodie', 'Cultural', 'Budget', 'Nature'
];

const HINGE_QUESTIONS = [
  'My absolute worst travel habit is...',
  'The weirdest food I\'ve eaten just to be polite...',
  'My ultimate travel red flag in a partner is...',
  'Most adventurous thing I\'ve done...',
  'My perfect travel day looks like...',
  'I\'m looking for a travel partner who...',
  'Worst travel experience that made me laugh...',
  'A destination that completely changed me...',
  'My golden rule of traveling is...'
];

const VOICE_QUESTIONS = [
  'Say hello in your native language...',
  'My travel vibe in three words...',
  'A secret travel tip I\'m willing to share...',
  'The worst tourist trap I\'ve ever visited...'
];

// High-quality default travel image links to keep UI premium immediately (unused now)
const DEFAULT_TRAVEL_PICS = ['', '', ''];

const ProfileSetup = ({ token, onLogout }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form States (Earthy Organic prefilled templates for frictionless 15-second setup)
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('men');
  const [occupation, setOccupation] = useState('World Nomad & Taco Enthusiast');
  const [bio, setBio] = useState('On a mission to discover the world\'s most breathtaking sunrise hike and the ultimate street taco. I spend 80% of my time exploring hidden mountain ridges or sipping specialty coffee. Let\'s get lost together!');
  const [location, setLocation] = useState('San Francisco, USA');
  const [nativity, setNativity] = useState('Global Citizen');
  const [pictures, setPictures] = useState(['', '', '']);
  const [destinations, setDestinations] = useState('Kyoto Japan, Rome Italy, Oaxaca Mexico');
  const [travelDuration, setTravelDuration] = useState('1-2 weeks');
  const [travelStyles, setTravelStyles] = useState(['Foodie', 'Adventure', 'Nature']);
  const [travelCalendar, setTravelCalendar] = useState('Summer 2026');

  // Hinge Prompts (Maximum 3) with prefilled travel-journal templates
  const [prompts, setPrompts] = useState([
    { question: HINGE_QUESTIONS[0], answer: 'Packing enough socks for a 6-month polar expedition even though I\'m only traveling for a weekend.' },
    { question: HINGE_QUESTIONS[1], answer: 'Deep-fried grasshoppers in Mexico. Honestly? Tasted exactly like crunchy potato chips with lime!' },
    { question: HINGE_QUESTIONS[2], answer: 'Someone who insists on a rigid hourly itinerary. Let\'s get lost in the back alleys instead!' }
  ]);

  // Voice Prompt State & Native Refs
  const [voiceQuestion, setVoiceQuestion] = useState(VOICE_QUESTIONS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordedBase64, setRecordedBase64] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Fetch current user details
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name || '');
          setAge(data.age || '');
          setGender(data.gender || 'men');
          setOccupation(data.occupation || '');
          setBio(data.bio || '');
          setLocation(data.location || '');
          setNativity(data.nativity || '');
          if (data.pictures && data.pictures.length > 0) {
            const padded = [...data.pictures];
            while (padded.length < 3) padded.push('');
            setPictures(padded);
          }
          setDestinations(data.destinations ? data.destinations.join(', ') : '');
          setTravelDuration(data.travelDuration || '1-2 weeks');
          setTravelStyles(data.travelStyles || []);
          setTravelCalendar(data.travelCalendar || 'Summer 2026');
          if (data.prompts && data.prompts.length > 0) {
            setPrompts(data.prompts);
          }
          if (data.voicePrompt) {
            setVoiceQuestion(data.voicePrompt.question || VOICE_QUESTIONS[0]);
            setRecordedBase64(data.voicePrompt.audio || '');
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Handle travel style tag toggles
  const handleStyleToggle = (style) => {
    if (travelStyles.includes(style)) {
      setTravelStyles(travelStyles.filter(s => s !== style));
    } else {
      setTravelStyles([...travelStyles, style]);
    }
  };

  // Picture slots handler
  const handlePictureChange = (index, value) => {
    const updated = [...pictures];
    updated[index] = value;
    setPictures(updated);
  };

  // Helper to compress base64 images to web-optimized 800px JPEGs on the client side
  const compressImage = (base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to high-performance web optimized JPEG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Support up to 10MB upload files since we automatically compress them anyway!
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be smaller than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setMessage('Optimizing image for instant loading...');
      try {
        const compressed = await compressImage(reader.result, 800, 800, 0.7);
        handlePictureChange(index, compressed);
        setMessage('Image optimized and loaded successfully!');
      } catch (err) {
        console.error('Image compression failed, using original:', err);
        handlePictureChange(index, reader.result);
        setMessage('Image loaded successfully (without optimization).');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    handlePictureChange(index, '');
  };

  // Prompt answers
  const handlePromptChange = (index, key, value) => {
    const updated = [...prompts];
    updated[index] = { ...updated[index], [key]: value };
    setPrompts(updated);
  };

  // Real Native Voice Recorder using MediaRecorder API
  const startRecording = async () => {
    setError('');
    setMessage('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          setRecordedBase64(base64Audio);
          setAudioUrl(URL.createObjectURL(audioBlob));
          setMessage('Voice greeting recorded successfully! Listen to it below.');
        };
        
        // Stop all tracks on the stream to release the mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting voice recording:', err);
      setError('Could not access microphone. Please allow microphone access in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    const formattedDestinations = destinations
      .split(',')
      .map(d => d.trim())
      .filter(d => d !== '');

    const payload = {
      name,
      age: Number(age),
      gender,
      occupation,
      bio,
      location,
      nativity,
      pictures: pictures.filter(p => p !== ''),
      destinations: formattedDestinations,
      travelDuration,
      travelStyles,
      travelCalendar,
      prompts,
      voicePrompt: {
        question: voiceQuestion,
        audio: recordedBase64
      }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setMessage('Profile saved successfully! Redirecting to Explore Feed...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Account Action
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('WARNING: Are you absolutely sure you want to permanently delete your account? This action is irreversible and will erase all your matches, messages, and group travel sessions.');
    
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      alert('Your account has been deleted. We are sad to see you go!');
      onLogout();
      navigate('/');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px', position: 'relative' }}>
      <div className="welcome-gradient-bg" style={{ width: '400px', top: '10%' }}></div>

      <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', position: 'relative', zIndex: 10 }}>
        {/* Profile Progress Stepper */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Step {step} of 3
            </span>
            <h2 style={{ fontSize: '1.8rem', marginTop: '4px' }}>
              {step === 1 && 'Vibe Setup & Images'}
              {step === 2 && 'Travel Style & Itinerary'}
              {step === 3 && 'Hinge Prompts & Voice Greeting'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '32px', height: '6px', borderRadius: '3px', background: step >= 1 ? 'var(--cyan)' : 'var(--glass-border)' }}></div>
            <div style={{ width: '32px', height: '6px', borderRadius: '3px', background: step >= 2 ? 'var(--cyan)' : 'var(--glass-border)' }}></div>
            <div style={{ width: '32px', height: '6px', borderRadius: '3px', background: step >= 3 ? 'var(--cyan)' : 'var(--glass-border)' }}></div>
          </div>
        </div>

        {/* Global Notifications */}
        {message && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#86efac', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px' }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> {message}
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i> {error}
          </div>
        )}

        {/* STEP 1: Basic Information & Pictures */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="glass-input" placeholder="Your name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="glass-input" placeholder="Age" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="glass-input">
                  <option value="men" style={{ background: 'var(--bg-dark)' }}>Men</option>
                  <option value="women" style={{ background: 'var(--bg-dark)' }}>Women</option>
                  <option value="other" style={{ background: 'var(--bg-dark)' }}>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Job / Occupation</label>
                <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="glass-input" placeholder="e.g. Travel Blogger, Designer" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Current Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="glass-input" placeholder="e.g. London, UK" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Nativity / Nationality</label>
                <input type="text" value={nativity} onChange={(e) => setNativity(e.target.value)} className="glass-input" placeholder="e.g. Italian, Japanese" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>About Me (Bio)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="3" className="glass-input" style={{ resize: 'vertical' }} placeholder="Introduce yourself! What kinds of vibes do you look for?" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Profile Photos (Select up to 3 files from your PC)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                {[0, 1, 2].map((idx) => (
                  <div key={idx}>
                    {pictures[idx] ? (
                      /* Filled Slot */
                      <div style={{
                        position: 'relative',
                        height: '160px',
                        borderRadius: '16px',
                        backgroundImage: `url(${pictures[idx]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        overflow: 'hidden'
                      }}>
                        <button
                          type="button"
                          onClick={(e) => handleRemovePicture(idx, e)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(239, 68, 68, 0.85)',
                            border: 'none',
                            color: '#fff',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                          }}
                          title="Remove Photo"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    ) : (
                      /* Empty Slot */
                      <label
                        htmlFor={`file-upload-${idx}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '160px',
                          borderRadius: '16px',
                          border: '2px dashed var(--glass-border)',
                          background: 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          gap: '10px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--cyan)';
                          e.currentTarget.style.background = 'var(--cyan-glow)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--glass-border)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                        }}
                      >
                        <input
                          id={`file-upload-${idx}`}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileChange(idx, e)}
                        />
                        <i className="fa-solid fa-image" style={{ fontSize: '1.6rem', color: 'var(--text-muted)' }}></i>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Choose Card</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Travel Preferences */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Dream Destinations (comma-separated)
              </label>
              <input 
                type="text" 
                value={destinations} 
                onChange={(e) => setDestinations(e.target.value)} 
                className="glass-input" 
                placeholder="e.g. Kyoto Japan, Reykjavik Iceland, Rome Italy" 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Target Calendar (Trip Timing)
                </label>
                <input 
                  type="text" 
                  value={travelCalendar} 
                  onChange={(e) => setTravelCalendar(e.target.value)} 
                  className="glass-input" 
                  placeholder="e.g. July 2026, Autumn 2026" 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Preferred Duration
                </label>
                <select value={travelDuration} onChange={(e) => setTravelDuration(e.target.value)} className="glass-input">
                  <option value="1-3 days" style={{ background: 'var(--bg-dark)' }}>Weekend (1-3 days)</option>
                  <option value="1-2 weeks" style={{ background: 'var(--bg-dark)' }}>1-2 weeks</option>
                  <option value="2-4 weeks" style={{ background: 'var(--bg-dark)' }}>2-4 weeks</option>
                  <option value="1 month+" style={{ background: 'var(--bg-dark)' }}>1 month+</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Select Your Travel Styles (pills)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {TRAVEL_STYLE_OPTIONS.map((style) => {
                  const isActive = travelStyles.includes(style);
                  return (
                    <span
                      key={style}
                      className={`tag-pill ${isActive ? 'active' : ''}`}
                      onClick={() => handleStyleToggle(style)}
                    >
                      {isActive && <i className="fa-solid fa-check" style={{ marginRight: '4px' }}></i>}
                      {style}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Hinge Prompts & Voice Greetings */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Hinge Prompt Questions (Max 3) */}
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-file-pen" style={{ color: 'var(--coral)' }}></i> Hinge-Style Prompts (Configure 3)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {prompts.map((p, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                        PROMPT QUESTION #{idx + 1}
                      </label>
                      <select
                        value={p.question}
                        onChange={(e) => handlePromptChange(idx, 'question', e.target.value)}
                        className="glass-input"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {HINGE_QUESTIONS.map(q => (
                          <option key={q} value={q} style={{ background: 'var(--bg-dark)' }}>{q}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                        PROMPT ANSWER
                      </label>
                      <input
                        type="text"
                        value={p.answer}
                        onChange={(e) => handlePromptChange(idx, 'answer', e.target.value)}
                        className="glass-input"
                        placeholder="Write your adventurous response..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Prompt Recording Section */}
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-microphone" style={{ color: 'var(--cyan)' }}></i> Voice Introduction Memo
              </h4>
              <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    SELECT VOICE QUESTION
                  </label>
                  <select
                    value={voiceQuestion}
                    onChange={(e) => setVoiceQuestion(e.target.value)}
                    className="glass-input"
                  >
                    {VOICE_QUESTIONS.map(q => (
                      <option key={q} value={q} style={{ background: 'var(--bg-dark)' }}>{q}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="btn btn-cyan"
                      style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                    >
                      <i className="fa-solid fa-microphone"></i> Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="btn btn-coral"
                      style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                    >
                      <i className="fa-solid fa-circle-stop"></i> Stop & Save Greeting
                    </button>
                  )}

                  {recordedBase64 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: '100%', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="pulse-dot"></div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 500 }}>
                          Voice memo ready!
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <audio src={recordedBase64} controls style={{ width: '100%', height: '36px', borderRadius: '8px' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Controllers */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid var(--glass-border)'
        }}>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="btn btn-glass">
              <i className="fa-solid fa-chevron-left"></i> Previous Step
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="btn btn-cyan">
              Next Step <i className="fa-solid fa-chevron-right"></i>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={loading}
              className="btn btn-coral"
              style={{ padding: '12px 36px' }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i> Complete Vibe Profile
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Danger Zone: Account Deletion (Always Visible at bottom) */}
      <div className="glass-panel" style={{
        marginTop: '24px',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        background: 'rgba(239, 68, 68, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div>
          <h4 style={{ color: '#f87171', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i> Danger Zone
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
            Permanently delete your profile, and erase all traveler connections, likes, matches, and chats.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="btn"
          style={{
            background: 'transparent',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '8px 16px',
            fontSize: '0.85rem'
          }}
        >
          <i className="fa-solid fa-trash-can"></i> Delete My Account
        </button>
      </div>
    </div>
  );
};

export default ProfileSetup;
