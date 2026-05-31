import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

// Custom inline travel backpack SVG icon component
const BackpackIcon = ({ size = 22, style = {} }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    {/* Carry Handle */}
    <path d="M9 3.5V2a1.5 1.5 0 0 1 3 0v1.5h-3z" />
    
    {/* Main Pack Body */}
    <path d="M5 8.5C5 5.5 7.5 5 12 5s7 .5 7 3.5v10c0 1.9-1.6 3.5-3.5 3.5h-7C6.6 22 5 20.4 5 18.5v-10z" />
    
    {/* Front Pocket (Bulge) in contrast (white or cutout) */}
    <path d="M8 12h8v5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5z" fill="#FFFFFF" stroke="currentColor" strokeWidth="0.5" />
    
    {/* Vertical Harness Straps */}
    <rect x="7.5" y="6" width="1.5" height="6" rx="0.5" fill="#FFFFFF" />
    <rect x="15" y="6" width="1.5" height="6" rx="0.5" fill="#FFFFFF" />
    
    {/* Buckle details */}
    <circle cx="8.25" cy="10" r="0.75" fill="currentColor" />
    <circle cx="15.75" cy="10" r="0.75" fill="currentColor" />
  </svg>
);

const Dashboard = ({ token, currentUser }) => {
  const chatEndRef = useRef(null);
  const aiChatContainerRef = useRef(null);
  const normalChatContainerRef = useRef(null);
  const aiInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Feed & Filters States
  const [feed, setFeed] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [genderFilter, setGenderFilter] = useState('everyone');
  const [styleFilter, setStyleFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [nativityFilter, setNativityFilter] = useState('');
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

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
  const [chatsLoading, setChatsLoading] = useState(false);
  const lastActiveChatId = useRef(null);

  // Modals & Overlays
  const [matchAlert, setMatchAlert] = useState(null); // { name, picture }
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupDest, setNewGroupDest] = useState('');

  // Earthy visual sync & animations
  const [myProfile, setMyProfile] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [mobileView, setMobileView] = useState('explore'); // 'explore' | 'chats' | 'ai'

  // Feedback notifications
  const [notify, setNotify] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  // AI Travel Co-Pilot States
  const [activeAIChat, setActiveAIChat] = useState(false);
  const [aiLoadingStatus, setAiLoadingStatus] = useState('Voya AI Co-Pilot is starting...');
  const [aiMessages, setAiMessages] = useState(() => {
    const saved = sessionStorage.getItem('voya_ai_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved AI messages:', e);
      }
    }
    return [
      {
        role: 'assistant',
        content: `👋 Hello traveler! I am your **Voya AI Travel Co-Pilot**. \n\nTell me where you want to go and what your budget is (e.g., *"$500 for a 3-day trip to Tokyo"* or *"moderate budget for Paris"*), and I will compile a complete day-by-day itinerary and match you with perfect hotel suggestions!\n\nWhere are we traveling next? ✈️`
      }
    ];
  });
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Sync AI Messages to Session Storage for persistence across tab changes
  useEffect(() => {
    sessionStorage.setItem('voya_ai_messages', JSON.stringify(aiMessages));
  }, [aiMessages]);

  // Clear AI chat history upon logout (token deletion)
  useEffect(() => {
    if (!token) {
      sessionStorage.removeItem('voya_ai_messages');
    }
  }, [token]);

  // Voice playback simulation
  const [playingAudioIdx, setPlayingAudioIdx] = useState(null); // indices

  const [hasNotification, setHasNotification] = useState(false);

  // Notification indicator logic for new matches / likes / group messages
  useEffect(() => {
    if (!token) return;
    
    let hasUnread = false;

    // 1. Pending likes received
    if (likesReceived && likesReceived.length > 0) {
      hasUnread = true;
    }

    // 2. Unread group messages
    const readMap = JSON.parse(localStorage.getItem('voya_read_groups') || '{}');
    if (myGroups && myGroups.length > 0) {
      myGroups.forEach(g => {
        const lastMsg = g.messages?.[g.messages.length - 1];
        if (lastMsg) {
          if (activeChatGroup?._id === g._id) {
            readMap[g._id] = lastMsg._id;
          } else if (readMap[g._id] !== lastMsg._id) {
            hasUnread = true;
          }
        }
      });
    }
    localStorage.setItem('voya_read_groups', JSON.stringify(readMap));

    // Save flag to localStorage so Navbar can read it
    localStorage.setItem('voya_unread_notification', hasUnread ? 'true' : 'false');
    setHasNotification(hasUnread);
  }, [token, likesReceived, myGroups, activeChatGroup]);

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

  // Fetch Matches, Groups, & Invites (Consolidated single fast API request)
  const fetchConnections = async () => {
    try {
      const activeChatId = activeDirectMatchChat?._id || '';
      const res = await fetch(`${API_BASE_URL}/api/users/sync?activeDirectChatId=${activeChatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        if (data.matches) setMatches(data.matches);
        if (data.likesReceived) setLikesReceived(data.likesReceived);
        if (data.pendingInvites) setPendingInvites(data.pendingInvites);
        if (data.directMessages && activeChatId) {
          setDirectMessages(data.directMessages);
        }
        
        if (data.groups) {
          setMyGroups(data.groups);
          // If we have an active chat, update its content from fresh data
          if (activeChatGroup) {
            const freshActive = data.groups.find(g => g._id === activeChatGroup._id);
            if (freshActive) {
              setActiveChatGroup(freshActive);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setChatsLoading(false);
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

  // Listen to URL search queries to toggle AI Chat Tab dynamically (e.g. from global Header)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'ai') {
      setActiveAIChat(true);
      setActiveChatGroup(null);
      setActiveDirectMatchChat(null);
      setActiveLikerDetail(null);
      setMobileView('ai');
    } else {
      setActiveAIChat(false);
      setMobileView('explore');
    }
  }, [location.search]);

  // Periodic polling for new chat messages & invitations (Adaptive Polling Engine to prevent server congestion)
  useEffect(() => {
    if (!token) return;
    const pollInterval = (activeChatGroup || activeDirectMatchChat) ? 3000 : 8000;
    const interval = setInterval(() => {
      fetchConnections();
    }, pollInterval);
    return () => clearInterval(interval);
  }, [token, activeChatGroup, activeDirectMatchChat]);

  // Instant load chat logs and show skeleton shimmer loader upon new chat selection
  useEffect(() => {
    const currentChatId = activeDirectMatchChat?._id || activeChatGroup?._id || null;
    if (currentChatId && currentChatId !== lastActiveChatId.current) {
      setChatsLoading(true);
      lastActiveChatId.current = currentChatId;
      fetchConnections(); // Fetch immediately without polling delay!
    } else if (!currentChatId) {
      lastActiveChatId.current = null;
    }
  }, [activeDirectMatchChat?._id, activeChatGroup?._id]);

  // Automatically scroll normal chat logs to bottom when messages updates
  useEffect(() => {
    if (normalChatContainerRef.current && (activeChatGroup || activeDirectMatchChat)) {
      const container = normalChatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeChatGroup?.messages, activeChatGroup?._id, directMessages, activeDirectMatchChat?._id]);

  // Automatically scroll AI chat timeline to bottom on new messages or tab load
  useEffect(() => {
    if (aiChatContainerRef.current && activeAIChat) {
      const container = aiChatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [aiMessages, activeAIChat]);

  // Auto-focus the AI Input bar as soon as loading is complete or chat opens
  useEffect(() => {
    if (!aiLoading && activeAIChat && aiInputRef.current) {
      aiInputRef.current.focus();
    }
  }, [aiLoading, activeAIChat]);

  // Dynamic travel-planning status phrase shifting for AI loader
  useEffect(() => {
    if (!aiLoading) return;
    setAiLoadingStatus('Voya AI is starting Co-Pilot engine...');
    const loadingPhrases = [
      'Mapping scenic routes...',
      'Matching budget-friendly boutique hotels...',
      'Assembling day-by-day itineraries...',
      'Calculating local transit & daily dining costs...',
      'Polishing custom travel guide tips...',
      'Consulting Voya local experts database...'
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingPhrases.length;
      setAiLoadingStatus(loadingPhrases[index]);
    }, 2200);
    return () => clearInterval(interval);
  }, [aiLoading]);

  // Keydown event listener for left/right arrows to like/skip cards
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeChatGroup || activeDirectMatchChat || activeAIChat) return; // Disable keyboard swipes during chat sessions
      
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
  }, [feed, currentIndex, activeChatGroup, activeDirectMatchChat, activeLikerDetail, activeAIChat]);

  // Touch Swiping Gesture Support for Mobile/Phones
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchMoveRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      touchMoveRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      touchMoveRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e, targetUser, isLikerView = false) => {
    const diffX = touchMoveRef.current.x - touchStartRef.current.x;
    const diffY = touchMoveRef.current.y - touchStartRef.current.y;
    
    // If the user scrolled vertically, cancel/ignore the swipe gesture
    if (Math.abs(diffY) > 40) return;
    
    // Ignore vertical scrolling, only swipe if horizontal drag is dominant and exceeds 80px
    if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swipe Right -> Like
        if (isLikerView) {
          handleSwipe(targetUser, 'like');
          setActiveLikerDetail(null);
        } else {
          handleSwipe(targetUser, 'like');
        }
      } else {
        // Swipe Left -> Dislike
        if (isLikerView) {
          handleSwipe(targetUser, 'dislike');
          setActiveLikerDetail(null);
        } else {
          handleSwipe(targetUser, 'dislike');
        }
      }
    }
  };

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

  // Send message to Voya AI Travel Co-Pilot
  const handleSendMessageToAI = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMessage = { role: 'user', content: aiInput.trim() };
    const updatedMessages = [...aiMessages, userMessage];
    setAiMessages(updatedMessages);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await res.json();
      if (res.ok) {
        setAiMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
      } else {
        const errorMsg = data.message || `⚠️ Sorry traveler, I hit a slight turbulence check on my flight systems. Could you try asking again?`;
        setAiMessages([
          ...updatedMessages,
          { role: 'assistant', content: errorMsg }
        ]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setAiMessages([
        ...updatedMessages,
        { role: 'assistant', content: `⚠️ Sorry traveler, my connection to the cockpit seems slightly offline. Let's try once more!` }
      ]);
    } finally {
      setAiLoading(false);
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

  // Custom premium Markdown parser for beautiful text formatting, including custom tables
  const renderMarkdown = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    const elements = [];
    let inTable = false;
    let tableHeaders = [];
    let tableRows = [];

    const commitTable = (keyIndex) => {
      if (tableHeaders.length > 0 || tableRows.length > 0) {
        elements.push(
          <div key={`table-${keyIndex}`} style={{ overflowX: 'auto', margin: '16px 0', width: '100%' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              textAlign: 'left',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              {tableHeaders.length > 0 && (
                <thead>
                  <tr style={{ background: 'rgba(232, 130, 79, 0.08)', borderBottom: '2px solid var(--glass-border)' }}>
                    {tableHeaders.map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {parseFormatting(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ 
                    borderBottom: '1px solid var(--glass-border)', 
                    background: rIdx % 2 === 1 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                    transition: 'background 0.2s'
                  }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {parseFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeaders = [];
        tableRows = [];
      }
      inTable = false;
    };

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const trimmed = line.trim();

      // Check if this line is a table row (starts and ends with | or contains multiple |)
      const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1;

      if (isTableRow) {
        // Check if it is a separator line like | --- | --- |
        const isSeparator = /^\|[\s-|-:|]*\|$/.test(trimmed) && trimmed.includes('---');
        
        if (isSeparator) {
          // It's a separator line, skip it but mark that we are in a table
          inTable = true;
          continue;
        }

        // Split by pipe and remove first and last empty elements
        const cells = trimmed.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);

        if (!inTable) {
          // If we weren't in a table, this is the header row!
          tableHeaders = cells;
          inTable = true;
        } else {
          // If we were already in a table, this is a data row!
          tableRows.push(cells);
        }
      } else {
        // Not a table row. If we were in a table, commit it first!
        if (inTable) {
          commitTable(index);
        }

        if (trimmed === '---') {
          elements.push(<hr key={index} style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '12px 0' }} />);
        } else if (trimmed.startsWith('### ')) {
          elements.push(<h4 key={index} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px', fontWeight: 750 }}>{parseFormatting(trimmed.substring(4))}</h4>);
        } else if (trimmed.startsWith('#### ')) {
          elements.push(<h5 key={index} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.0rem', color: 'var(--text-primary)', marginTop: '14px', marginBottom: '6px', fontWeight: 700 }}>{parseFormatting(trimmed.substring(5))}</h5>);
        } else if (trimmed.startsWith('##### ')) {
          elements.push(<h6 key={index} style={{ fontFamily: 'var(--font-serif)', fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '12px', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{parseFormatting(trimmed.substring(6))}</h6>);
        } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          elements.push(
            <div key={index} style={{ display: 'flex', gap: '8px', paddingLeft: '12px', marginBottom: '6px', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--coral)' }}>•</span>
              <span style={{ flex: 1 }}>{parseFormatting(trimmed.substring(2))}</span>
            </div>
          );
        } else if (trimmed === '') {
          elements.push(<div key={index} style={{ height: '8px' }} />);
        } else {
          elements.push(
            <p key={index} style={{ marginBottom: '8px', fontSize: '0.88rem', lineHeight: '1.5' }}>
              {parseFormatting(line)}
            </p>
          );
        }
      }
    }

    // If the text ends while still in a table, commit it!
    if (inTable) {
      commitTable(lines.length);
    }

    return elements;
  };

  const parseFormatting = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part}</strong>;
      }
      const subParts = part.split(/_([^_]+)_/g);
      return subParts.map((subPart, j) => {
        if (j % 2 === 1) {
          return <em key={j} style={{ fontStyle: 'italic' }}>{subPart}</em>;
        }
        return subPart;
      });
    });
  };

  // Get active traveler card from deck
  const activeUserCard = feed[currentIndex];

  const showMobileNav = true;

  return (
    <div className={`app-layout ${showMobileNav ? 'has-mobile-nav' : ''}`} style={{ gridTemplateColumns: '320px 1fr', gap: '24px', padding: '24px', maxWidth: '100%' }}>
      {/* 1. LEFT PANEL: MATCHES & GROUP CONVERSATIONS */}
      <div className={`app-layout-left glass-panel ${(mobileView !== 'chats' || activeDirectMatchChat || activeChatGroup || activeLikerDetail) ? 'mobile-hide' : ''}`} style={{
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

        {/* AI Travel Co-Pilot CTA Button */}
        <button
          onClick={() => {
            setActiveAIChat(true);
            setActiveChatGroup(null);
            setActiveDirectMatchChat(null);
            setActiveLikerDetail(null);
            setMobileView('ai');
          }}
          className={`btn ${activeAIChat ? 'btn-coral' : 'btn-glass'}`}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px',
            fontSize: '0.9rem',
            fontWeight: '600',
            borderRadius: '14px',
            marginBottom: '20px',
            border: activeAIChat ? '1px solid var(--terracotta)' : '1px solid var(--glass-border)',
            boxShadow: activeAIChat ? '0 4px 15px rgba(200, 112, 74, 0.25)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>✨</span>
          <span>voya AI Guide</span>
          {activeAIChat && (
            <span style={{
              marginLeft: 'auto',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.65rem',
              textTransform: 'uppercase'
            }}>Active</span>
          )}
        </button>

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
                      setActiveAIChat(false);
                      setMobileView('explore');
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
                      setActiveAIChat(false);
                      setMobileView('explore');
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
                      setActiveAIChat(false);
                      setMobileView('explore');
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
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLikerDetail(m);
                        setMobileView('explore');
                      }}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'var(--glass-border)',
                        backgroundImage: `url(${m.pictures?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        border: '2px solid transparent',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--coral)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                      title="View Traveler Profile"
                    ></div>
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
      <div className={(mobileView !== 'explore' && mobileView !== 'ai' && !activeDirectMatchChat && !activeChatGroup && !activeLikerDetail) ? 'mobile-hide' : ''} style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, position: 'relative', overflow: 'hidden', flex: 1 }}>
        {activeAIChat ? (
          /* ✨ VOYA AI TRAVEL CO-PILOT WORKSPACE */
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            padding: '24px',
            position: 'relative',
            background: 'var(--mist-card)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-crisp)',
            overflow: 'hidden'
          }}>
            {/* AI Chat Header */}
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
                  onClick={() => {
                    setActiveAIChat(false);
                    setMobileView('explore');
                    navigate('/dashboard');
                  }}
                  className="btn btn-glass"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Back to Explore
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--terracotta) 0%, var(--clay) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: '#fff',
                    boxShadow: '0 4px 10px rgba(200, 112, 74, 0.2)'
                  }}>✨</div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: 0, fontWeight: 750 }}>Voya AI Travel Guide</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      ⚡ Custom day-by-day itineraries and budget hotel matchmaker
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Messages timeline */}
            <div ref={aiChatContainerRef} style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              paddingRight: '8px',
              marginBottom: '20px'
            }}>
              {aiMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`voya-chat-bubble ${isUser ? 'me ai' : 'ai'}`}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {isUser ? msg.content : renderMarkdown(msg.content)}
                  </div>
                );
              })}

              {aiLoading && (
                <div className="voya-thinking-container">
                  <div className="voya-thinking-bubble glass-panel">
                    <div className="voya-thinking-header">
                      <i className="fa-solid fa-wand-magic-sparkles voya-thinking-glow-icon"></i>
                      <span className="voya-thinking-status">{aiLoadingStatus}</span>
                    </div>
                    <div className="voya-thinking-dots">
                      <span className="voya-thinking-dot"></span>
                      <span className="voya-thinking-dot"></span>
                      <span className="voya-thinking-dot"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* AI Message Input */}
            <form
              onSubmit={handleSendMessageToAI}
              style={{
                display: 'flex',
                gap: '10px',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '16px'
              }}
            >
              <input
                ref={aiInputRef}
                type="text"
                className="glass-input"
                placeholder="Ask e.g. 'I want to go to Tokyo for 3 days with a backpacker budget of $500'..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                style={{ flex: 1, padding: '14px 18px', fontSize: '0.9rem', borderRadius: '14px', border: '1px solid var(--glass-border)', background: '#FFF' }}
                disabled={aiLoading}
                required
              />
              <button
                type="submit"
                className="btn btn-coral"
                style={{ padding: '14px 28px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: '600', background: 'var(--terracotta)', color: '#fff', border: 'none' }}
                disabled={aiLoading}
              >
                Plan Trip
              </button>
            </form>
          </div>
        ) : (activeDirectMatchChat && !activeLikerDetail) ? (
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
                  onClick={() => {
                    setActiveDirectMatchChat(null);
                    setMobileView('chats');
                  }}
                  className="btn btn-glass"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '8px' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Back to Chats
                </button>
                <div 
                  onClick={() => setActiveLikerDetail(activeDirectMatchChat)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                  title="View profile of traveler"
                >
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
            <div ref={normalChatContainerRef} style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '8px',
              marginBottom: '20px'
            }}>
              {chatsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, padding: '10px 0' }}>
                  <div className="chat-skeleton-bubble other" style={{ width: '45%' }} />
                  <div className="chat-skeleton-bubble me" style={{ width: '60%' }} />
                  <div className="chat-skeleton-bubble other" style={{ width: '50%' }} />
                  <div className="chat-skeleton-bubble me" style={{ width: '35%' }} />
                </div>
              ) : directMessages.length === 0 ? (
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
                      className={`voya-chat-bubble ${isMe ? 'me' : 'other'}`}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
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
          /* ELABORATED PROFILE DETAIL CARD VIEW (UNIVERSAL) */
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            position: 'relative',
            background: 'var(--mist-card)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow-crisp)',
            overflow: 'hidden'
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
                  onClick={() => {
                    setActiveLikerDetail(null);
                    setMobileView('chats');
                  }}
                  className="btn btn-glass"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> {activeDirectMatchChat ? 'Back to Chat' : activeChatGroup ? 'Back to Group' : 'Back to Explore'}
                </button>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 600 }}>
                {activeLikerDetail._id === currentUser?._id ? '🌍 Your Travel Profile Vibe' : '🌍 Traveler Vibe Check'}
              </span>
            </div>

            {/* Scrollable Liker Card View */}
            <div className="card-deck-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '440px', height: '420px', margin: '0 auto', flex: 1 }}>
              {activeLikerDetail._id !== currentUser?._id && !matches.some(m => m._id === activeLikerDetail._id) && (
                <>
                  {/* Floating Skip button */}
                  <button
                    onClick={() => {
                      handleSwipe(activeLikerDetail, 'dislike');
                      setActiveLikerDetail(null);
                    }}
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
                    title="Skip"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>

                  {/* Floating Like button */}
                  <button
                    onClick={() => {
                      handleSwipe(activeLikerDetail, 'like');
                      setActiveLikerDetail(null);
                    }}
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
                    title="Like / Match"
                  >
                    <BackpackIcon size={24} />
                  </button>
                </>
              )}

              <div
                className="swipe-card glass-panel"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '24px',
                  overflowY: 'auto'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(e, activeLikerDetail, true)}
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
                  {/* Subtle dark gradient overlay for text readability */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(44, 38, 33, 0.85) 0%, rgba(44, 38, 33, 0.1) 50%, transparent 100%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Stamp Badge */}
                  {activeLikerDetail.location && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(251, 239, 227, 0.92)',
                      border: '1.5px dashed var(--sage)',
                      color: 'var(--text-primary)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transform: 'rotate(2deg)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      ✈️ {activeLikerDetail.location.split(',')[0]}
                    </div>
                  )}

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
                      borderRadius: '100px',
                      fontSize: '0.72rem',
                      color: 'var(--cyan)',
                      fontWeight: 600,
                      width: 'fit-content',
                      border: '1px solid var(--cyan-glow)'
                    }}>
                      <i className="fa-solid fa-briefcase"></i> {activeLikerDetail.occupation || 'Traveler'}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="swipe-card-body" style={{ padding: '24px' }}>
                  {/* Bio */}
                  {activeLikerDetail.bio && (
                    <p style={{
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.65',
                      marginBottom: '24px',
                      fontStyle: 'italic',
                      borderLeft: '3px solid var(--sage)',
                      paddingLeft: '12px'
                    }}>
                      "{activeLikerDetail.bio}"
                    </p>
                  )}

                  {/* Boarding Pass Style Itinerary Ticket */}
                  <div className="glass-panel" style={{
                    padding: '18px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(251, 239, 227, 0.6) 0%, rgba(244, 234, 225, 0.6) 100%)',
                    border: '1px dashed rgba(44, 38, 33, 0.15)',
                    marginBottom: '24px',
                    position: 'relative',
                    boxShadow: '0 4px 15px rgba(44, 38, 33, 0.02)'
                  }}>
                    {/* Ticket notches */}
                    <div style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-sand)', borderRight: '1px solid var(--glass-border)', zIndex: 2 }} />
                    <div style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-sand)', borderLeft: '1px solid var(--glass-border)', zIndex: 2 }} />

                    <h5 style={{ fontSize: '0.78rem', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-plane-departure"></i> EXPLORER BOARDING PASS
                    </h5>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px 10px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>DESTINATIONS</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 750, fontSize: '0.88rem' }}>
                          🌍 {activeLikerDetail.destinations?.join(', ') || 'Flexible Wandering'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>DURATION</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 750, fontSize: '0.88rem' }}>
                          ⏱️ {activeLikerDetail.travelDuration || 'Flexible'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>CALENDAR / WINDOW</span>
                        <span style={{ color: 'var(--terracotta)', fontWeight: 750, fontSize: '0.88rem' }}>
                          📅 {activeLikerDetail.travelCalendar || 'Open Dates'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>NATIVITY</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 750, fontSize: '0.88rem' }}>
                          🦁 {activeLikerDetail.nativity || 'Global Nomad'}
                        </span>
                      </div>
                    </div>

                    {/* Travel Style Pills */}
                    {activeLikerDetail.travelStyles && activeLikerDetail.travelStyles.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed rgba(44, 38, 33, 0.1)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {activeLikerDetail.travelStyles.map(style => (
                          <span key={style} style={{
                            background: 'rgba(200, 70, 10, 0.1)',
                            color: 'var(--sage)',
                            padding: '3px 8px',
                            borderRadius: '100px',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            #{style}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Voice Prompt Playback (If Exists) */}
                  {activeLikerDetail.voicePrompt && activeLikerDetail.voicePrompt.audio && (
                    <div className="audio-player-glass">
                      <button
                        type="button"
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

            {/* Mobile Swipe Buttons for Elaborated Profile (Phone support!) */}
            {activeLikerDetail._id !== currentUser?._id && !matches.some(m => m._id === activeLikerDetail._id) && (
              <div className="mobile-action-buttons liker-mobile-actions">
                <button 
                  onClick={() => {
                    handleSwipe(activeLikerDetail, 'dislike');
                    setActiveLikerDetail(null);
                  }} 
                  className="mobile-btn mobile-btn-skip"
                  title="Skip"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <button 
                  onClick={() => {
                    handleSwipe(activeLikerDetail, 'like');
                    setActiveLikerDetail(null);
                  }} 
                  className="mobile-btn mobile-btn-like"
                  title="Like"
                >
                  <BackpackIcon size={22} />
                </button>
              </div>
            )}

            {/* If it's current user, show an edit profile button instead of swipe controls */}
            {activeLikerDetail._id === currentUser?._id && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/profile');
                  }}
                  className="btn btn-coral"
                  style={{ width: '100%', maxWidth: '240px', padding: '12px', fontSize: '0.85rem' }}
                >
                  <i className="fa-solid fa-pen-to-square"></i> Edit Profile Settings
                </button>
              </div>
            )}
          </div>
        ) : (activeChatGroup && !activeLikerDetail) ? (
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
                  onClick={() => {
                    setActiveChatGroup(null);
                    setMobileView('chats');
                  }}
                  className="btn btn-glass"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', marginBottom: '8px' }}
                >
                  <i className="fa-solid fa-chevron-left"></i> Back to Chats
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
            <div ref={normalChatContainerRef} style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '8px',
              marginBottom: '20px'
            }}>
              {chatsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, padding: '10px 0' }}>
                  <div className="chat-skeleton-bubble other" style={{ width: '50%' }} />
                  <div className="chat-skeleton-bubble me" style={{ width: '40%' }} />
                  <div className="chat-skeleton-bubble other" style={{ width: '65%' }} />
                  <div className="chat-skeleton-bubble me" style={{ width: '45%' }} />
                </div>
              ) : activeChatGroup.messages?.length === 0 ? (
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
                      className={`voya-chat-bubble ${isMe ? 'me coral' : 'other'}`}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
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
            <div className={`voya-filter-bar glass-panel ${mobileFiltersExpanded ? 'expanded' : 'collapsed'}`}>
              <div 
                className="voya-filter-header" 
                onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
              >
                <div className="voya-filter-header-left">
                  <i className="fa-solid fa-sliders"></i>
                  <span>
                    { (genderFilter !== 'everyone' || destinationFilter || locationFilter || nativityFilter || durationFilter) 
                      ? 'Filters Active' : 'Filter Travelers' }
                  </span>
                  {(() => {
                    let count = 0;
                    if (genderFilter !== 'everyone') count++;
                    if (destinationFilter) count++;
                    if (locationFilter) count++;
                    if (nativityFilter) count++;
                    if (durationFilter) count++;
                    return count > 0 ? (
                      <span className="voya-filter-badge">{count}</span>
                    ) : null;
                  })()}
                </div>
                <i className="fa-solid fa-chevron-down voya-filter-chevron"></i>
              </div>

              <div className="voya-filter-content">
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
                  <span className="voya-filter-btn-text" style={{ marginLeft: '6px', fontSize: '0.85rem' }}>Apply Filters</span>
                </button>
              </div>
            </div>

            {/* Swiper Deck Wrapper */}
            <div className="deck-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', gap: '15px' }}>
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
                  <BackpackIcon size={24} />
                </button>

                {/* CARD DECK CARD WITH ANIMATION STATES */}
                <div className={`swipe-card glass-panel ${
                  swipeDirection === 'left' ? 'swipe-left-anim' :
                  swipeDirection === 'right' ? 'swipe-right-anim' : ''
                }`} style={{ position: 'relative', width: '100%', height: '100%', margin: 0, borderRadius: '24px', overflowY: 'auto' }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={(e) => handleTouchEnd(e, activeUserCard, false)}
                >
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
                  {/* Subtle dark gradient overlay for text readability */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(44, 38, 33, 0.85) 0%, rgba(44, 38, 33, 0.1) 50%, transparent 100%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Stamp Badge */}
                  {activeUserCard.location && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(251, 239, 227, 0.92)',
                      border: '1.5px dashed var(--sage)',
                      color: 'var(--text-primary)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transform: 'rotate(2deg)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      ✈️ {activeUserCard.location.split(',')[0]}
                    </div>
                  )}

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
                      borderRadius: '100px',
                      fontSize: '0.72rem',
                      color: 'var(--cyan)',
                      fontWeight: 600,
                      width: 'fit-content',
                      border: '1px solid var(--cyan-glow)'
                    }}>
                      <i className="fa-solid fa-briefcase"></i> {activeUserCard.occupation || 'Traveler'}
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="swipe-card-body" style={{ padding: '24px' }}>
                  {/* Bio */}
                  {activeUserCard.bio && (
                    <p style={{
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.65',
                      marginBottom: '24px',
                      fontStyle: 'italic',
                      borderLeft: '3px solid var(--sage)',
                      paddingLeft: '12px'
                    }}>
                      "{activeUserCard.bio}"
                    </p>
                  )}

                  {/* Boarding Pass Style Itinerary Ticket */}
                  <div className="glass-panel" style={{
                    padding: '18px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(251, 239, 227, 0.6) 0%, rgba(244, 234, 225, 0.6) 100%)',
                    border: '1px dashed rgba(44, 38, 33, 0.15)',
                    marginBottom: '24px',
                    position: 'relative',
                    boxShadow: '0 4px 15px rgba(44, 38, 33, 0.02)'
                  }}>
                    {/* Ticket notches */}
                    <div style={{ position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-sand)', borderRight: '1px solid var(--glass-border)', zIndex: 2 }} />
                    <div style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--bg-sand)', borderLeft: '1px solid var(--glass-border)', zIndex: 2 }} />

                    <h5 style={{ fontSize: '0.78rem', color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-plane-departure"></i> EXPLORER BOARDING PASS
                    </h5>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px 10px', fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>DESTINATIONS</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 750, fontSize: '0.88rem' }}>
                          🌍 {activeUserCard.destinations?.join(', ') || 'Flexible Wandering'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>DURATION</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 750, fontSize: '0.88rem' }}>
                          ⏱️ {activeUserCard.travelDuration || 'Flexible'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>CALENDAR / WINDOW</span>
                        <span style={{ color: 'var(--terracotta)', fontWeight: 750, fontSize: '0.88rem' }}>
                          📅 {activeUserCard.travelCalendar || 'Open Dates'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem', letterSpacing: '0.03em', fontWeight: 700 }}>NATIVITY</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 750, fontSize: '0.88rem' }}>
                          🦁 {activeUserCard.nativity || 'Global Nomad'}
                        </span>
                      </div>
                    </div>

                    {/* Travel Style Pills */}
                    {activeUserCard.travelStyles && activeUserCard.travelStyles.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed rgba(44, 38, 33, 0.1)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {activeUserCard.travelStyles.map(style => (
                          <span key={style} style={{
                            background: 'rgba(200, 70, 10, 0.1)',
                            color: 'var(--sage)',
                            padding: '3px 8px',
                            borderRadius: '100px',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            #{style}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Voice Prompt Playback (If Exists) */}
                  {activeUserCard.voicePrompt && activeUserCard.voicePrompt.audio && (
                    <div className="audio-player-glass">
                      <button
                        type="button"
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

              {/* Mobile Swipe Buttons (Phone support!) */}
              <div className="mobile-action-buttons deck-mobile-actions">
                <button 
                  onClick={() => handleSwipe(activeUserCard, 'dislike')} 
                  className="mobile-btn mobile-btn-skip"
                  title="Skip"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <button 
                  onClick={() => handleSwipe(activeUserCard, 'like')} 
                  className="mobile-btn mobile-btn-like"
                  title="Like"
                >
                  <BackpackIcon size={22} />
                </button>
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

      {/* Floating Bottom Navigation Bar for Mobile Phones */}
      {showMobileNav && (
        <div className="voya-mobile-nav">
          <button 
            onClick={() => {
              setMobileView('explore');
              setActiveAIChat(false);
              setActiveDirectMatchChat(null);
              setActiveChatGroup(null);
              setActiveLikerDetail(null);
            }} 
            className={`voya-mobile-nav-item ${mobileView === 'explore' && !activeAIChat && !activeDirectMatchChat && !activeChatGroup ? 'active' : ''}`}
          >
            <i className="fa-solid fa-compass"></i>
            <span>Explore</span>
          </button>
          <button 
            onClick={() => {
              setMobileView('chats');
              setActiveAIChat(false);
              setActiveDirectMatchChat(null);
              setActiveChatGroup(null);
              setActiveLikerDetail(null);
            }} 
            className={`voya-mobile-nav-item ${(mobileView === 'chats' || activeDirectMatchChat || activeChatGroup) && !activeAIChat ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            <i className="fa-solid fa-comments"></i>
            {hasNotification && (
              <span className="voya-nav-notification-dot" />
            )}
            <span>Chats</span>
          </button>
          <button 
            onClick={() => {
              setMobileView('ai');
              setActiveAIChat(true);
              setActiveChatGroup(null);
              setActiveDirectMatchChat(null);
              setActiveLikerDetail(null);
            }} 
            className={`voya-mobile-nav-item ${mobileView === 'ai' || activeAIChat ? 'active' : ''}`}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>AI Guide</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
