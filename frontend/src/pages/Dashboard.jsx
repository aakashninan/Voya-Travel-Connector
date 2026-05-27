import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';

const Dashboard = ({ token, currentUser }) => {
  const chatEndRef = useRef(null);
  // Feed & Filters States
  const [feed, setFeed] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [genderFilter, setGenderFilter] = useState('everyone');
  const [styleFilter, setStyleFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [nativityFilter, setNativityFilter] = useState('');

  // Matches, Groups, & Chat States
  const [matches, setMatches] = useState([]);
  const [likesReceived, setLikesReceived] = useState([]);
  const [activeLikerDetail, setActiveLikerDetail] = useState(null); // stores profile of liked-received expander card
  const [activeDirectMatchChat, setActiveDirectMatchChat] = useState(null); // stores partner traveler of 1-on-1 chat
  const [directMessages, setDirectMessages] = useState([]); // stores messages list inside 1-on-1 chat
  const [directChatMessage, setDirectChatMessage] = useState('');
  const [myGroups, setMyGroups] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [activeChatGroup, setActiveChatGroup] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [inviteeMatchId, setInviteeMatchId] = useState('');

  // Modals & Overlays
  const [matchAlert, setMatchAlert] = useState(null); // { name, picture }
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupDest, setNewGroupDest] = useState('');

  // Earthy visual sync & animations
  const [myProfile, setMyProfile] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Feedback notifications
  const [notify, setNotify] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  // Voice playback simulation
  const [playingAudioIdx, setPlayingAudioIdx] = useState(null); // indices

  // Fetch Feed
  const fetchFeed = async () => {
    try {
      let query = `?gender=${genderFilter}`;
      if (styleFilter) query += `&travelStyle=${styleFilter}`;
      if (durationFilter) query += `&duration=${durationFilter}`;
      if (destinationFilter) query += `&destination=${destinationFilter}`;
      if (locationFilter) query += `&location=${locationFilter}`;
      if (nativityFilter) query += `&nativity=${nativityFilter}`;

      const res = await fetch(`${API_BASE_URL}/api/users/feed${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeed(data);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    }
  };

  // Fetch Matches, Groups, & Invites
  const fetchConnections = async () => {
    try {
      // 1. Matches
      const resMatches = await fetch(`${API_BASE_URL}/api/matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resMatches.ok) {
        const data = await resMatches.json();
        setMatches(data);
      }

      // 2. Groups
      const resGroups = await fetch(`${API_BASE_URL}/api/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resGroups.ok) {
        const data = await resGroups.json();
        setMyGroups(data);
        // If we have an active chat, update its content from fresh data
        if (activeChatGroup) {
          const freshActive = data.find(g => g._id === activeChatGroup._id);
          if (freshActive) {
            setActiveChatGroup(freshActive);
          }
        }
      }

      // 3. Pending invites
      const resInvites = await fetch(`${API_BASE_URL}/api/groups/invites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resInvites.ok) {
        const data = await resInvites.json();
        setPendingInvites(data);
      }

      // 4. Who Liked Me (Likes Received)
      const resLikes = await fetch(`${API_BASE_URL}/api/matches/likes-received`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resLikes.ok) {
        const data = await resLikes.json();
        setLikesReceived(data);
      }

      // 5. Direct Messages (1-on-1 chats)
      if (activeDirectMatchChat) {
        const resDirect = await fetch(`${API_BASE_URL}/api/matches/${activeDirectMatchChat._id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resDirect.ok) {
          const data = await resDirect.json();
          setDirectMessages(data);
        }
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyProfile(data);
      }
    } catch (err) {
      console.error('Error fetching my profile:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFeed();
      fetchConnections();
      fetchMyProfile();
    }
  }, [token]);

  // Periodic polling for new chat messages & invitations (Optimized for real-time 1.5-second syncing)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchConnections();
    }, 1500);
    return () => clearInterval(interval);
  }, [token, activeChatGroup, activeDirectMatchChat]);

  // Automatically scroll chat logs to bottom when messages list updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatGroup?.messages, activeChatGroup?._id, directMessages, activeDirectMatchChat?._id]);

  // Keydown event listener for left/right arrows to like/skip cards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeChatGroup || activeDirectMatchChat) return; // Disable keyboard swipes during chat sessions
      
      const activeInput = document.activeElement;
      if (
        activeInput &&
        (activeInput.tagName === 'INPUT' ||
        activeInput.tagName === 'TEXTAREA' ||
        activeInput.tagName === 'SELECT' ||
        activeInput.contentEditable === 'true')
      ) {
        return; // Ignore keypress while typing in comments or search bars
      }

      // Case 1: Swiping on detailed Liker profile from "Who Liked You"
      if (activeLikerDetail) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleSwipe(activeLikerDetail, 'dislike');
          setActiveLikerDetail(null); // Return to feed
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleSwipe(activeLikerDetail, 'like');
          setActiveLikerDetail(null); // Return to feed
        }
        return;
      }

      // Case 2: Swiping on normal explore feed deck
      if (feed && feed.length > 0 && currentIndex < feed.length) {
        const activeCard = feed[currentIndex];
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleSwipe(activeCard, 'dislike');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleSwipe(activeCard, 'like');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [feed, currentIndex, activeChatGroup, activeDirectMatchChat, activeLikerDetail]);

  // Show status notification
  const triggerNotification = (text, type = 'success') => {
    setNotify({ text, type });
    setTimeout(() => setNotify({ text: '', type: '' }), 4000);
  };

  // Swipe Action Handler
  const handleSwipe = async (targetUser, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/matches/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: targetUser._id, status })
      });
      const data = await res.json();

      if (res.ok) {
        // If mutual match occurred, trigger gorgeous splash alert!
        if (data.isMatch) {
          setMatchAlert({
            name: targetUser.name,
            picture: targetUser.pictures && targetUser.pictures[0]
              ? targetUser.pictures[0]
              : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
          });
        }

        // Always refresh connections on any successful swipe
        fetchConnections();

        // Shift card deck with beautiful fly-off animations
        if (feed[currentIndex] && feed[currentIndex]._id === targetUser._id) {
          setSwipeDirection(status === 'like' ? 'right' : 'left');
          setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setSwipeDirection(null);
          }, 350);
        }
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  // Create Group Handler
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          destination: newGroupDest
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerNotification(`Group "${newGroupName}" formed! Invite matches now.`);
        setNewGroupName('');
        setNewGroupDesc('');
        setNewGroupDest('');
        setShowCreateGroup(false);
        fetchConnections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Group Invite approval respond (approve / reject)
  const handleInviteResponse = async (groupId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        triggerNotification(`Group invitation successfully ${action === 'approve' ? 'approved!' : 'declined.'}`);
        fetchConnections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Group Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeChatGroup) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/${activeChatGroup._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: chatMessage })
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessage('');
        // Update local chat logs
        setActiveChatGroup(prev => ({
          ...prev,
          messages: data
        }));
        fetchConnections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Direct 1-on-1 Message
  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!directChatMessage.trim() || !activeDirectMatchChat) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/matches/${activeDirectMatchChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: directChatMessage })
      });
      const data = await res.json();
      if (res.ok) {
        setDirectChatMessage('');
        setDirectMessages(data);
        fetchConnections();
      }
    } catch (err) {
      console.error('Send direct message error:', err);
    }
  };

  // Invite match to active group
  const handleSendGroupInvite = async (e) => {
    e.preventDefault();
    if (!inviteeMatchId || !activeChatGroup) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/${activeChatGroup._id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteeId: inviteeMatchId })
      });
      const data = await res.json();
      if (res.ok) {
        triggerNotification(`Invitation sent to your match! They must approve to join.`);
        setInviteeMatchId('');
        fetchConnections();
      } else {
        triggerNotification(data.message || 'Invitation failed', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Play voice prompt simulator sound
  const handlePlayVoice = (idx, base64Audio) => {
    if (playingAudioIdx === idx) {
      setPlayingAudioIdx(null);
    } else {
      setPlayingAudioIdx(idx);
      // Play brief high-quality beep sound representing premium voice note playback
      const audio = new Audio(base64Audio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio playback click simulated!'));
      
      // Stop playing index after 4 seconds
      setTimeout(() => {
        setPlayingAudioIdx(null);
      }, 4000);
    }
  };

  // Get active traveler card from deck
  const activeUserCard = feed[currentIndex];

  return (
    <div className="app-layout" style={{ gridTemplateColumns: '320px 1fr', gap: '24px', padding: '24px', maxWidth: '100%' }}>
      {/* 1. LEFT PANEL: MATCHES & GROUP CONVERSATIONS */}
      <div className="app-layout-left glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
        overflowY: 'auto'
      }}>
        {/* Profile Card Preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'var(--terracotta)',
            backgroundImage: `url(${myProfile?.pictures?.[0] || currentUser?.pictures?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '2.5px solid var(--terracotta)'
          }}></div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{currentUser?.name || 'Explorer'}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <i className="fa-solid fa-plane-departure" style={{ color: 'var(--cyan)' }}></i> Ready for departure
            </span>
          </div>
        </div>

        {/* Global Toast Alert */}
        {notify.text && (
          <div style={{
            background: notify.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            border: notify.type === 'error' ? '1px solid #ef4444' : '1px solid #22c55e',
            color: notify.type === 'error' ? '#f87171' : '#86efac',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            marginBottom: '16px'
          }}>
            {notify.text}
          </div>
        )}

        {/* Group Planning Panel */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h5 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Travel Groups
            </h5>
            <button 
              onClick={() => setShowCreateGroup(!showCreateGroup)} 
              className="btn btn-coral" 
              style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              <i className="fa-solid fa-plus"></i> Form Group
            </button>
          </div>

          {/* Form Group Popup/Form inline */}
          {showCreateGroup && (
            <form onSubmit={handleCreateGroup} className="glass-panel" style={{
              padding: '16px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <input 
                type="text" 
                placeholder="Group Name (e.g. Kyoto Trip)" 
                className="glass-input" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                required 
              />
              <input 
                type="text" 
                placeholder="Target Destination" 
                className="glass-input" 
                value={newGroupDest} 
                onChange={(e) => setNewGroupDest(e.target.value)} 
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              />
              <textarea 
                placeholder="Trip Plan Description" 
                className="glass-input" 
                value={newGroupDesc} 
                onChange={(e) => setNewGroupDesc(e.target.value)} 
                style={{ padding: '8px 12px', fontSize: '0.8rem', resize: 'vertical' }}
                rows="2"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-cyan" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}>
                  Create
                </button>
                <button type="button" className="btn btn-glass" onClick={() => setShowCreateGroup(false)} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of active groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myGroups.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No active groups yet. Form one!
              </span>
            ) : (
              myGroups.map(group => {
                const isActive = activeChatGroup?._id === group._id;
                return (
                  <div
                    key={group._id}
                    onClick={() => {
                      setActiveChatGroup(group);
                      setActiveDirectMatchChat(null);
                      setActiveLikerDetail(null);
                      // Turn off swiping feed to open group chat page!
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isActive ? 'var(--cyan-glow)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? 'var(--cyan)' : 'var(--glass-border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{group.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-users"></i> {group.members?.length || 1}
                      </span>
                    </div>
                    {group.destination && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', display: 'block', marginTop: '4px' }}>
                        <i className="fa-solid fa-map-location-dot"></i> {group.destination}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Group Invites Section (Needs Approvals!) */}
        <div style={{ marginBottom: '24px' }}>
          <h5 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Pending Invitations ({pendingInvites.length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingInvites.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No pending trip requests.
              </span>
            ) : (
              pendingInvites.map(inviteGroup => (
                <div key={inviteGroup._id} className="glass-panel" style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 77, 121, 0.03)',
                  border: '1px solid rgba(255, 77, 121, 0.2)'
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', display: 'block' }}>{inviteGroup.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', margin: '4px 0' }}>
                    Invited by: {inviteGroup.creator?.name} (age {inviteGroup.creator?.age})
                  </span>
                  {inviteGroup.destination && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', display: 'block', marginBottom: '8px' }}>
                      <i className="fa-solid fa-location-arrow"></i> {inviteGroup.destination}
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleInviteResponse(inviteGroup._id, 'approve')}
                      className="btn btn-cyan"
                      style={{ padding: '4px 10px', fontSize: '0.7rem', flex: 1 }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleInviteResponse(inviteGroup._id, 'reject')}
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: '0.7rem', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Who Liked You (Likes Received) Section */}
        <div style={{ marginBottom: '24px' }}>
          <h5 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Who Liked You ({likesReceived.length})
          </h5>
          <div>
            {likesReceived.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No new likes received yet.
              </span>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {likesReceived.map(liker => (
                  <div
                    key={liker._id}
                    onClick={() => {
                      setActiveLikerDetail(liker);
                      setActiveChatGroup(null);
                      setActiveDirectMatchChat(null);
                    }}
                    className="liker-card-hover"
                    style={{
                      position: 'relative',
                      height: '140px',
                      borderRadius: '16px',
                      backgroundImage: `url(${liker.pictures?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      boxShadow: 'var(--shadow-glow)'
                    }}
                  >
                    <div style={{
                      padding: '8px 10px',
                      background: 'linear-gradient(to top, rgba(4,7,15,0.92) 0%, rgba(4,7,15,0.3) 75%, transparent 100%)',
                      width: '100%'
                    }}>
                      <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, display: 'block', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                        {liker.name}, {liker.age}
                      </span>
                      <span style={{ color: 'var(--cyan)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        ⚡ Vibe Match?
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Matches Section */}
        <div style={{ flex: 1 }}>
          <h5 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Mutual Matches ({matches.length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matches.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Swipe to match with travelers!
              </span>
            ) : (
              matches.map(m => {
                const isActive = activeDirectMatchChat?._id === m._id;
                return (
                  <div
                    key={m._id}
                    onClick={() => {
                      setActiveDirectMatchChat(m);
                      setActiveChatGroup(null);
                      setActiveLikerDetail(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      borderRadius: '12px',
                      background: isActive ? 'var(--coral-glow)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${isActive ? 'var(--coral)' : 'var(--glass-border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--glass-border)',
                      backgroundImage: `url(${m.pictures?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {m.name}, {m.age}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: isActive ? '#fff' : 'var(--text-muted)' }}>
                        <i className="fa-solid fa-comments" style={{ color: 'var(--cyan)' }}></i> Chat Forum
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2. CENTER PANEL: SWIPING CARD DECK OR GROUP CHAT OR DIRECT MATCH FORUM OR LIKER ELABORATE VIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        {activeDirectMatchChat ? (
          /* 1-on-1 DIRECT MATCH CHAT FORUM */
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            position: 'relative'
          }}>
            {/* Direct Chat Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <button
                  onClick={() => setActiveDirectMatchChat(null)}
                  className="btn btn-glass"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '8px' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Back to Explore
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundImage: `url(${activeDirectMatchChat.pictures?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}></div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>Direct Chat with {activeDirectMatchChat.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {activeDirectMatchChat.location && `📍 Resides in ${activeDirectMatchChat.location}`}
                      {activeDirectMatchChat.nativity && ` • 🌍 Originally from ${activeDirectMatchChat.nativity}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form group with this match button */}
              <button
                onClick={() => {
                  setNewGroupName(`Trip with ${activeDirectMatchChat.name}`);
                  setNewGroupDest(activeDirectMatchChat.destinations?.[0] || '');
                  setShowCreateGroup(true);
                }}
                className="btn btn-coral"
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                <i className="fa-solid fa-users-gear"></i> Form Trip Group
              </button>
            </div>

            {/* Direct Chat Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '8px',
              marginBottom: '20px'
            }}>
              {directMessages.length === 0 ? (
                <div style={{
                  margin: 'auto',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  <i className="fa-solid fa-comments" style={{ fontSize: '2.5rem', color: 'var(--coral-glow)', marginBottom: '12px', display: 'block' }}></i>
                  Your direct chat forum with {activeDirectMatchChat.name} is active!<br />Say hello and share travel calendars.
                </div>
              ) : (
                directMessages.map((msg, idx) => {
                  const isMe = msg.sender === currentUser?._id;
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        background: isMe ? 'var(--cyan)' : 'rgba(15, 23, 42, 0.04)',
                        border: isMe ? 'none' : '1px solid var(--glass-border)',
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        color: isMe ? '#fff' : 'var(--text-primary)'
                      }}
                    >
                      <span style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: isMe ? 'rgba(255,255,255,0.85)' : 'var(--coral)',
                        marginBottom: '4px'
                      }}>
                        {msg.senderName}
                      </span>
                      <p style={{ fontSize: '0.85rem', wordBreak: 'break-word', lineHeight: '1.4' }}>{msg.text}</p>
                      <span style={{
                        display: 'block',
                        textAlign: 'right',
                        fontSize: '0.6rem',
                        color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                        marginTop: '4px'
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Direct Message Form Input */}
            <form onSubmit={handleSendDirectMessage} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder={`Type a message to ${activeDirectMatchChat.name}...`}
                value={directChatMessage}
                onChange={(e) => setDirectChatMessage(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-cyan">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        ) : activeLikerDetail ? (
          /* ELABORATED INCOMING LIKER PROFILE DETAIL CARD VIEW */
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            position: 'relative'
          }}>
            {/* Liker Detail Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <button
                  onClick={() => setActiveLikerDetail(null)}
                  className="btn btn-glass"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Back to Explore
                </button>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 600 }}>
                🌍 Detail Vibe Check
              </span>
            </div>

            {/* Top Match/Skip button bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexShrink: 0 }}>
              <button
                onClick={() => {
                  handleSwipe(activeLikerDetail, 'dislike');
                  setActiveLikerDetail(null);
                }}
                className="btn btn-glass"
                style={{ flex: 1, maxWidth: '160px', padding: '10px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'var(--glass-border)' }}
              >
                <i className="fa-solid fa-xmark"></i> Skip
              </button>
              <button
                onClick={() => {
                  handleSwipe(activeLikerDetail, 'like');
                  setActiveLikerDetail(null);
                }}
                className="btn btn-coral"
                style={{ flex: 1, maxWidth: '160px', padding: '10px', fontSize: '0.85rem' }}
              >
                <i className="fa-solid fa-heart"></i> Match Back
              </button>
            </div>

            {/* Scrollable Liker Card View */}
            <div className="card-deck-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '440px', height: '420px', margin: '0 auto', flex: 1 }}>
              <div
                className="swipe-card glass-panel"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '24px',
                  overflowY: 'auto'
                }}
              >
                {/* Images Carousel */}
                <div style={{
                  width: '100%',
                  height: '240px',
                  background: 'var(--bg-dark)',
                  backgroundImage: `url(${activeLikerDetail.pictures?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#fff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                    }}>
                      {activeLikerDetail.name}, {activeLikerDetail.age}
                    </span>
                    <span style={{
                      background: 'rgba(4,7,15,0.7)',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      color: 'var(--cyan)',
                      width: 'fit-content',
                      border: '1px solid var(--cyan-glow)'
                    }}>
                      <i className="fa-solid fa-briefcase"></i> {activeLikerDetail.occupation || 'Traveler'}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div style={{ padding: '24px' }}>
                  {/* Bio */}
                  {activeLikerDetail.bio && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                      "{activeLikerDetail.bio}"
                    </p>
                  )}

                  {/* Travel Preferences Summary */}
                  <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      <i className="fa-solid fa-suitcase-rolling" style={{ color: 'var(--cyan)' }}></i> Itinerary & Preferences
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>DESTINATIONS</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>
                          {activeLikerDetail.destinations?.join(', ') || 'Flexible'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>CALENDAR</span>
                        <span style={{ color: 'var(--coral)', fontWeight: 600 }}>
                          {activeLikerDetail.travelCalendar || 'Anytime'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>DURATION</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>
                          {activeLikerDetail.travelDuration || 'Flexible'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>TRAVEL STYLES</span>
                        <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                          {activeLikerDetail.travelStyles?.join(', ') || 'Vagabond'}
                        </span>
                      </div>
                      {/* Nativity / Nationality */}
                      {activeLikerDetail.nativity && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>ORIGIN (NATIVITY)</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>
                            {activeLikerDetail.nativity}
                          </span>
                        </div>
                      )}
                      {/* Current Residence / Location */}
                      {activeLikerDetail.location && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>RESIDES IN</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>
                            {activeLikerDetail.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice Prompt Playback (If Exists) */}
                  {activeLikerDetail.voicePrompt && activeLikerDetail.voicePrompt.audio && (
                    <div className="audio-player-glass">
                      <button
                        onClick={() => handlePlayVoice('liker', activeLikerDetail.voicePrompt.audio)}
                        className="audio-btn"
                        title="Listen to voice greeting"
                      >
                        {playingAudioIdx === 'liker' ? (
                          <i className="fa-solid fa-pause"></i>
                        ) : (
                          <i className="fa-solid fa-play"></i>
                        )}
                      </button>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          PLAYING VOICE PROMPT
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          "{activeLikerDetail.voicePrompt.question}"
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hinge Prompts Answers */}
                  {activeLikerDetail.prompts && activeLikerDetail.prompts.map((p, idx) => (
                    <div key={idx} className="hinge-prompt-box">
                      <div className="hinge-prompt-q">{p.question}</div>
                      <div className="hinge-prompt-a">{p.answer}</div>
                    </div>
                  ))}

                  {/* Extra picture slots for vibe checks */}
                  {activeLikerDetail.pictures?.slice(1).map((pic, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '100%',
                        height: '240px',
                        borderRadius: '16px',
                        background: 'var(--bg-dark)',
                        backgroundImage: `url(${pic})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        margin: '20px 0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Match/Skip button bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexShrink: 0 }}>
              <button
                onClick={() => {
                  handleSwipe(activeLikerDetail, 'dislike');
                  setActiveLikerDetail(null);
                }}
                className="btn btn-glass"
                style={{ flex: 1, maxWidth: '160px', padding: '10px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'var(--glass-border)' }}
              >
                <i className="fa-solid fa-xmark"></i> Skip
              </button>
              <button
                onClick={() => {
                  handleSwipe(activeLikerDetail, 'like');
                  setActiveLikerDetail(null);
                }}
                className="btn btn-coral"
                style={{ flex: 1, maxWidth: '160px', padding: '10px', fontSize: '0.85rem' }}
              >
                <i className="fa-solid fa-heart"></i> Match Back
              </button>
            </div>
          </div>
        ) : activeChatGroup ? (
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            position: 'relative'
          }}>
            {/* Chat Board Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--glass-border)',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <button
                  onClick={() => setActiveChatGroup(null)}
                  className="btn btn-glass"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '8px' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Back to Explore
                </button>
                <h3 style={{ fontSize: '1.4rem' }}>{activeChatGroup.name}</h3>
                {activeChatGroup.destination && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>
                    <i className="fa-solid fa-location-dot"></i> Trip Destination: {activeChatGroup.destination}
                  </span>
                )}
              </div>

              {/* Invite Matches dropdown menu */}
              <div className="glass-panel" style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSendGroupInvite} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className="glass-input"
                    value={inviteeMatchId}
                    onChange={(e) => setInviteeMatchId(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.75rem', width: '130px' }}
                    required
                  >
                    <option value="">Invite a Match...</option>
                    {matches.map(m => (
                      <option key={m._id} value={m._id} style={{ background: 'var(--bg-dark)' }}>{m.name}</option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-cyan" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* Chat Log messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '8px',
              marginBottom: '20px'
            }}>
              {activeChatGroup.messages?.length === 0 ? (
                <div style={{
                  margin: 'auto',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  <i className="fa-solid fa-comments" style={{ fontSize: '2.5rem', color: 'var(--cyan-glow)', marginBottom: '12px', display: 'block' }}></i>
                  No travel planning messages yet.<br />Align your calendars and check details below!
                </div>
              ) : (
                activeChatGroup.messages?.map((msg, idx) => {
                  const isMe = msg.sender === currentUser?._id;
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        background: isMe ? 'var(--coral)' : 'rgba(15, 23, 42, 0.04)',
                        border: isMe ? 'none' : '1px solid var(--glass-border)',
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        color: isMe ? '#fff' : 'var(--text-primary)'
                      }}
                    >
                      <span style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: isMe ? 'rgba(255,255,255,0.85)' : 'var(--cyan)',
                        marginBottom: '4px'
                      }}>
                        {msg.senderName}
                      </span>
                      <p style={{ fontSize: '0.85rem', wordBreak: 'break-word', lineHeight: '1.4' }}>{msg.text}</p>
                      <span style={{
                        display: 'block',
                        textAlign: 'right',
                        fontSize: '0.6rem',
                        color: isMe ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)',
                        marginTop: '4px'
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Discuss travel schedules, hostels, packing lists..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-coral">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
            {/* Sleek Top Filter Bar */}
            <div className="glass-panel" style={{
              display: 'grid',
              gridTemplateColumns: '0.9fr 1.1fr 1.1fr 1.1fr 1.1fr auto',
              gap: '12px',
              padding: '16px 20px',
              borderRadius: '16px',
              alignItems: 'flex-end',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--glass-border)',
              width: '100%',
              zIndex: 10
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="glass-input"
                  style={{ height: '36px', padding: '0 10px', fontSize: '0.8rem' }}
                >
                  <option value="everyone" style={{ background: 'var(--bg-ink)', color: '#fff' }}>Everyone</option>
                  <option value="men" style={{ background: 'var(--bg-ink)', color: '#fff' }}>Men</option>
                  <option value="women" style={{ background: 'var(--bg-ink)', color: '#fff' }}>Women</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Destination
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-map-pin" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--terracotta)' }}></i>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Japan, Paris"
                    value={destinationFilter}
                    onChange={(e) => setDestinationFilter(e.target.value)}
                    style={{ height: '36px', padding: '0 10px 0 28px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Location
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-house-chimney" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--sage)' }}></i>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. London, Rome"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    style={{ height: '36px', padding: '0 10px 0 28px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nativity
                </label>
                <div style={{ position: 'relative' }}>
                  <i className="fa-solid fa-globe" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--gold)' }}></i>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Italian, Japanese"
                    value={nativityFilter}
                    onChange={(e) => setNativityFilter(e.target.value)}
                    style={{ height: '36px', padding: '0 10px 0 28px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Trip Duration
                </label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="glass-input"
                  style={{ height: '36px', padding: '0 10px', fontSize: '0.8rem' }}
                >
                  <option value="" style={{ background: 'var(--bg-ink)', color: '#fff' }}>Flexible</option>
                  <option value="1-3 days" style={{ background: 'var(--bg-ink)', color: '#fff' }}>1-3 days</option>
                  <option value="1-2 weeks" style={{ background: 'var(--bg-ink)', color: '#fff' }}>1-2 weeks</option>
                  <option value="2-4 weeks" style={{ background: 'var(--bg-ink)', color: '#fff' }}>2-4 weeks</option>
                  <option value="1 month+" style={{ background: 'var(--bg-ink)', color: '#fff' }}>1 month+</option>
                </select>
              </div>

              <button
                onClick={fetchFeed}
                className="btn btn-coral"
                style={{ height: '36px', width: '38px', padding: 0, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', borderRadius: '10px' }}
                title="Apply Filters"
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>

            {/* Swiper Deck Wrapper */}
            <div className="deck-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {currentIndex >= feed.length ? (
              <div className="glass-panel" style={{
                padding: '40px',
                textAlign: 'center',
                maxWidth: '440px',
                borderRadius: '24px'
              }}>
                <i className="fa-solid fa-earth-americas" style={{
                  fontSize: '3.5rem',
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--violet) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '20px'
                }}></i>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No More Travelers in Range</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  Try expanding your search filters on the right, or check back later as new globe-trotters complete their profile vibe checks!
                </p>
                <button onClick={fetchFeed} className="btn btn-cyan" style={{ fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-arrows-rotate"></i> Reset Swipe Queue
                </button>
              </div>
            ) : (
              /* CARD DECK CARD WRAPPER */
              <div className="card-deck-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '440px', height: '600px' }}>
                {/* Floating Skip button */}
                <button
                  onClick={() => handleSwipe(activeUserCard, 'dislike')}
                  className="btn floating-skip-btn"
                  style={{
                    position: 'absolute',
                    left: '-75px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--glass-card)',
                    border: '1px solid var(--glass-border)',
                    color: '#f87171',
                    fontSize: '1.6rem',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-glow)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  title="Pass (Left Arrow)"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Floating Like button */}
                <button
                  onClick={() => handleSwipe(activeUserCard, 'like')}
                  className="btn floating-like-btn"
                  style={{
                    position: 'absolute',
                    right: '-75px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--coral)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '1.6rem',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px var(--coral-glow)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  title="Like (Right Arrow)"
                >
                  <i className="fa-solid fa-heart"></i>
                </button>

                {/* CARD DECK CARD WITH ANIMATION STATES */}
                <div className={`swipe-card glass-panel ${
                  swipeDirection === 'left' ? 'swipe-left-anim' :
                  swipeDirection === 'right' ? 'swipe-right-anim' : ''
                }`} style={{ position: 'relative', width: '100%', height: '100%', margin: 0 }}>
                {/* Images Carousel */}
                <div style={{
                  width: '100%',
                  height: '240px',
                  background: 'var(--bg-dark)',
                  backgroundImage: `url(${activeUserCard.pictures?.[0] || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {/* Floating Gender and Style Pills */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      color: '#fff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                    }}>
                      {activeUserCard.name}, {activeUserCard.age}
                    </span>
                    <span style={{
                      background: 'rgba(4,7,15,0.7)',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      color: 'var(--cyan)',
                      width: 'fit-content',
                      border: '1px solid var(--cyan-glow)'
                    }}>
                      <i className="fa-solid fa-briefcase"></i> {activeUserCard.occupation || 'Traveler'}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div style={{ padding: '24px' }}>
                  {/* Bio */}
                  {activeUserCard.bio && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                      fontStyle: 'italic'
                    }}>
                      "{activeUserCard.bio}"
                    </p>
                  )}

                  {/* Travel Preferences Summary */}
                  <div className="glass-panel" style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.01)',
                    marginBottom: '20px'
                  }}>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                      <i className="fa-solid fa-suitcase-rolling" style={{ color: 'var(--cyan)' }}></i> Itinerary & Preferences
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>DESTINATIONS</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>
                          {activeUserCard.destinations?.join(', ') || 'Flexible'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>CALENDAR</span>
                        <span style={{ color: 'var(--coral)', fontWeight: 600 }}>
                          {activeUserCard.travelCalendar || 'Anytime'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>DURATION</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>
                          {activeUserCard.travelDuration || 'Flexible'}
                        </span>
                      </div>
                      {/* Nativity / Nationality */}
                      {activeUserCard.nativity && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>ORIGIN (NATIVITY)</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>
                            {activeUserCard.nativity}
                          </span>
                        </div>
                      )}
                      {/* Current Residence / Location */}
                      {activeUserCard.location && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>RESIDES IN</span>
                          <span style={{ color: '#fff', fontWeight: 600 }}>
                            {activeUserCard.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Voice Prompt Playback (If Exists) */}
                  {activeUserCard.voicePrompt && activeUserCard.voicePrompt.audio && (
                    <div className="audio-player-glass">
                      <button
                        onClick={() => handlePlayVoice(currentIndex, activeUserCard.voicePrompt.audio)}
                        className="audio-btn"
                        title="Listen to traveler"
                      >
                        {playingAudioIdx === currentIndex ? (
                          <i className="fa-solid fa-pause"></i>
                        ) : (
                          <i className="fa-solid fa-play"></i>
                        )}
                      </button>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          PLAYING VOICE PROMPT
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          "{activeUserCard.voicePrompt.question}"
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Hinge Prompts Answers */}
                  {activeUserCard.prompts && activeUserCard.prompts.map((p, idx) => (
                    <div key={idx} className="hinge-prompt-box">
                      <div className="hinge-prompt-q">{p.question}</div>
                      <div className="hinge-prompt-a">{p.answer}</div>
                    </div>
                  ))}

                  {/* Extra picture slots for vibe checks */}
                  {activeUserCard.pictures?.slice(1).map((pic, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '100%',
                        height: '240px',
                        borderRadius: '16px',
                        background: 'var(--bg-dark)',
                        backgroundImage: `url(${pic})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        margin: '20px 0',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                      }}
                    />
                  ))}

                </div>
              </div>
              </div>
            )}
          </div>
          </div>
        )}
      </div>



      {/* MUTUAL MATCH FLASH SCREEN POPUP OVERLAY */}
      {matchAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(4,7,15,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fade-in 0.5s ease-out'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '460px',
            padding: '24px'
          }}>
            <h1 className="gradient-text" style={{ fontSize: '3.2rem', marginBottom: '8px', fontWeight: 800 }}>
              It's a WanderMatch!
            </h1>
            <p style={{ color: 'var(--cyan)', fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '24px', fontWeight: 600 }}>
              ✈️ You both want to travel together!
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '32px' }}>
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                backgroundImage: `url(${currentUser?.pictures?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '4px solid var(--cyan)',
                boxShadow: '0 0 25px var(--cyan-glow)'
              }} />
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                backgroundImage: `url(${matchAlert.picture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '4px solid var(--coral)',
                boxShadow: '0 0 25px var(--coral-glow)'
              }} />
            </div>

            <h3 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Connect with {matchAlert.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px' }}>
              A new mutual connection is formed. Form a travel group on the left side menu to plan flights, itineraries, and lodgings.
            </p>

            <button
              onClick={() => setMatchAlert(null)}
              className="btn btn-coral"
              style={{ padding: '12px 36px', fontSize: '1rem' }}
            >
              Start Planning!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
