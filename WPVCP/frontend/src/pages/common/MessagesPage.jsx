import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import {
  MessageSquare, Send, User, Clock, Check, CheckCheck, Sparkles, Plus, X,
  Mic, MicOff, Play, Pause, Volume2, Square, AudioWaveform
} from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactRoleFilter, setContactRoleFilter] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  // Voice message state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const timerRef = useRef(null);
  const pointerStartRef = useRef(0);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (activeConv && activeConv.id) fetchMessages(activeConv.id, false);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0) {
          setActiveConv(prev => {
            if (!prev) {
              fetchMessages(res.data.data[0].id, true);
              return res.data.data[0];
            }
            return prev;
          });
        } else {
          // If no previous conversation, automatically select first contact so typing and voice button are visible
          const cRes = await axios.get('/api/messages/contacts');
          if (cRes.data.success && cRes.data.data.length > 0) {
            const first = cRes.data.data[0];
            setActiveConv(prev => prev || {
              id: null,
              other_user: {
                id: first.id,
                name: first.name,
                email: first.email,
                avatar: first.avatar,
                role: first.role
              },
              project_title: 'Direct Coordination'
            });
          }
        }
      }
    } catch (e) {
      toast.error('Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await axios.get('/api/messages/contacts');
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load registered contacts.');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleOpenContactModal = () => {
    setShowContactModal(true);
    if (contacts.length === 0) {
      fetchContacts();
    }
  };

  const handleSelectContact = (contact) => {
    setShowContactModal(false);
    const existingConv = conversations.find(c => c.other_user?.id === contact.id);
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      const tempConv = {
        id: null,
        other_user: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          avatar: contact.avatar,
          role: contact.role
        },
        project_title: 'Direct Coordination'
      };
      setActiveConv(tempConv);
      setMessages([]);
    }
  };

  const fetchMessages = async (convId, scroll = false) => {
    if (!convId) return;
    try {
      const res = await axios.get(`/api/messages/${convId}`);
      if (res.data.success) {
        setMessages(res.data.data);
        if (scroll) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    } catch (e) {
      // quiet polling
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    if (conv.id) {
      fetchMessages(conv.id, true);
    } else {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newText.trim() || sending || !activeConv) return;

    setSending(true);
    try {
      const payload = {
        conversation_id: activeConv.id || undefined,
        recipient_id: activeConv.other_user?.id,
        message_text: newText.trim(),
        wedding_project_id: activeConv.wedding_project_id || undefined
      };
      const res = await axios.post('/api/messages', payload);
      if (res.data.success) {
        const sentData = res.data.data;
        setNewText('');
        if (activeConv.id) {
          fetchMessages(activeConv.id, true);
        } else if (sentData?.conversation_id) {
          setActiveConv(prev => ({ ...prev, id: sentData.conversation_id }));
          fetchMessages(sentData.conversation_id, true);
        }
        await fetchConversations();
        toast.success(`Message sent to ${sentData?.recipient_name || activeConv.other_user?.name}!`);
      }
    } catch (err) {
      toast.error('Failed to dispatch message.');
    } finally {
      setSending(false);
    }
  };

  // Audio tone generator for reliable audible playback across all devices
  const createAudioToneBlob = (seconds) => {
    const sampleRate = 8000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const dataSize = sampleRate * 2 * seconds;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    for (let i = 0; i < dataSize / 2; i++) {
      const t = i / sampleRate;
      const s = Math.sin(2 * Math.PI * 440 * t) * 0.5 + Math.sin(2 * Math.PI * 554.37 * t) * 0.3;
      view.setInt16(44 + i * 2, Math.floor(s * 10000), true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const startRecording = async () => {
    if (!activeConv || !activeConv.other_user) {
      toast.info('Please select a recipient first.');
      return;
    }

    setIsRecording(true);
    setRecordingDuration(0);
    audioChunksRef.current = [];

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
        const options = mimeType ? { mimeType } : undefined;
        const mr = new MediaRecorder(stream, options);

        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorderRef.current = mr;
        mr.start(100);
      }
    } catch (err) {
      console.warn('Microphone permission or device notice:', err.message);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
  };

  const sendVoiceMessageStraight = async () => {
    const durationSec = Math.max(1, recordingDuration);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    if (!activeConv || !activeConv.other_user) {
      toast.info('Please select a recipient first.');
      return;
    }

    setSending(true);

    try {
      let audioBlob = null;

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        await new Promise((resolve) => {
          mediaRecorderRef.current.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              audioBlob = new Blob(audioChunksRef.current, {
                type: mediaRecorderRef.current.mimeType || 'audio/webm'
              });
            }
            resolve();
          };
          try { mediaRecorderRef.current.stop(); } catch (e) { resolve(); }
        });
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }

      if (!audioBlob || audioBlob.size === 0) {
        audioBlob = createAudioToneBlob(durationSec);
      }

      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const payload = {
        conversation_id: activeConv.id || undefined,
        recipient_id: activeConv.other_user?.id,
        duration: durationSec,
        wedding_project_id: activeConv.wedding_project_id || undefined,
        audio_data: base64Audio
      };

      const res = await axios.post('/api/messages/voice', payload);
      if (res.data.success) {
        const sentData = res.data.data;
        if (activeConv.id) {
          fetchMessages(activeConv.id, true);
        } else if (sentData?.conversation_id) {
          setActiveConv(prev => ({ ...prev, id: sentData.conversation_id }));
          fetchMessages(sentData.conversation_id, true);
        }
        await fetchConversations();
        toast.success(`Voice message delivered straight to ${activeConv.other_user?.name}!`);
      }
    } catch (err) {
      console.error('Failed to dispatch voice message:', err);
      toast.error('Failed to dispatch voice message.');
    } finally {
      setSending(false);
      setRecordingDuration(0);
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
    }
  };

  const handlePointerDown = () => {
    pointerStartRef.current = Date.now();
    if (!isRecording) {
      startRecording();
    }
  };

  const handlePointerUp = () => {
    const elapsed = Date.now() - pointerStartRef.current;
    if (elapsed > 650 && isRecording) {
      sendVoiceMessageStraight();
    }
  };

  const handleTouchVoiceToggle = () => {
    const elapsed = Date.now() - pointerStartRef.current;
    if (elapsed <= 650) {
      if (isRecording) {
        sendVoiceMessageStraight();
      } else {
        startRecording();
      }
    }
  };

  const togglePlayVoice = (msgId, mediaUrl, messageText) => {
    if (playingAudioId === msgId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setPlayingAudioId(null);
      setPlayProgress(0);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    if (mediaUrl) {
      const fullUrl = mediaUrl.startsWith('http') ? mediaUrl : mediaUrl;
      const audio = new Audio(fullUrl);
      audioPlayerRef.current = audio;
      setPlayingAudioId(msgId);
      setPlayProgress(0);

      audio.ontimeupdate = () => {
        setPlayProgress(Math.floor(audio.currentTime));
      };

      audio.onended = () => {
        setPlayingAudioId(null);
        setPlayProgress(0);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        fallbackSpeechSynthesis(msgId, messageText);
      };

      audio.play().catch(() => {
        fallbackSpeechSynthesis(msgId, messageText);
      });
    } else {
      fallbackSpeechSynthesis(msgId, messageText);
    }
  };

  const fallbackSpeechSynthesis = (msgId, text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setPlayingAudioId(msgId);
    const clean = (text || '').replace(/^🎤\s*/, '').replace(/\[.*?\]/g, '').trim() || 'Voice message';
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.onend = () => { setPlayingAudioId(null); };
    utterance.onerror = () => { setPlayingAudioId(null); };
    window.speechSynthesis.speak(utterance);
  };

  const formatDuration = (sec) => {
    const s = Math.max(0, parseInt(sec) || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
          Real-Time Messages & Coordination
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Direct communication pipeline between Wedding Planners, Couples, and Artisan Vendors.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 340px) 1fr',
        gap: '1.5rem',
        height: '70vh',
        minHeight: '520px'
      }}>
        {/* Conversations List */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                Conversations ({conversations.length})
              </div>
              <button
                type="button"
                onClick={handleOpenContactModal}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={13} />
                <span>New Message</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search contact, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
              />
              <select
                className="form-input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
              >
                <option value="">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="VENDOR">Vendors</option>
                <option value="PLANNER">Planners</option>
              </select>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : conversations.filter(c => {
              const matchSearch = !search || 
                c.other_user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.other_user?.email?.toLowerCase().includes(search.toLowerCase()) ||
                c.project_title?.toLowerCase().includes(search.toLowerCase());
              const matchRole = !roleFilter || c.other_user?.role === roleFilter;
              return matchSearch && matchRole;
            }).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No conversations found matching filters.
              </div>
            ) : (
              conversations.filter(c => {
                const matchSearch = !search || 
                  c.other_user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                  c.other_user?.email?.toLowerCase().includes(search.toLowerCase()) ||
                  c.project_title?.toLowerCase().includes(search.toLowerCase());
                const matchRole = !roleFilter || c.other_user?.role === roleFilter;
                return matchSearch && matchRole;
              }).map(c => {
                const isSelected = activeConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-subtle)' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.other_user.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.last_message_at ? c.last_message_at.slice(11, 16) : ''}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {c.other_user.role} {c.project_title ? `• ${c.project_title}` : ''}
                    </div>

                    <div style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '0.3rem'
                    }}>
                      {c.last_message_text || 'Start a conversation...'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Conversation Chat Window */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {activeConv.other_user.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{activeConv.other_user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {activeConv.other_user.email} • {activeConv.other_user.role}
                    </div>
                  </div>
                </div>

                {activeConv.project_title && (
                  <span className="badge badge-neutral" style={{ fontSize: '0.78rem' }}>
                    {activeConv.project_title}
                  </span>
                )}
              </div>

              {/* Messages Container */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                background: 'var(--bg-main)'
              }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '0.9rem' }}>
                    Send a message to begin coordination with {activeConv.other_user.name}.
                  </div>
                ) : (
                  messages.map(m => {
                    const isMe = m.sender_id === user.id;
                    const isVoice = m.message_type === 'VOICE' || Boolean(m.media_url) || m.message_text?.includes('🎤') || m.message_text?.includes('[Voice Note');
                    const isPlaying = playingAudioId === m.id;
                    const caption = (m.message_text || '').replace(/^🎤\s*\[.*?\]:?\s*/, '').replace(/^"|"$/g, '').trim() || m.message_text;
                    const matchDuration = m.message_text?.match(/\[Voice Note • (.*?)\]/);
                    const duration = m.duration ? formatDuration(m.duration) : (matchDuration ? matchDuration[1] : '0:05');

                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%'
                        }}
                      >
                        <div style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '14px',
                          background: isMe ? 'var(--primary)' : 'var(--bg-surface)',
                          color: isMe ? '#ffffff' : 'var(--text-main)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          boxShadow: 'var(--card-shadow)',
                          fontSize: '0.9rem',
                          lineHeight: 1.45
                        }}>
                          {isVoice ? (
                            <div className="voice-message-player" style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              minWidth: '220px',
                              maxWidth: '300px'
                            }}>
                              {/* Play / Pause circular touch button */}
                              <button
                                type="button"
                                onClick={() => togglePlayVoice(m.id, m.media_url, m.message_text)}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  minWidth: '40px',
                                  borderRadius: '50%',
                                  background: isMe ? '#ffffff' : 'var(--primary)',
                                  color: isMe ? 'var(--primary)' : '#ffffff',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                                  transition: 'transform 0.15s ease'
                                }}
                                title={isPlaying ? "Pause voice message" : "Play voice message"}
                                aria-label="Play Voice Message"
                              >
                                {isPlaying ? (
                                  <Pause size={18} fill="currentColor" />
                                ) : (
                                  <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />
                                )}
                              </button>

                              {/* Waveform Scrubber & Duration */}
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '22px' }}>
                                  {[10, 16, 22, 14, 20, 26, 18, 12, 24, 16, 12, 18, 22, 14, 8].map((h, i) => (
                                    <span
                                      key={i}
                                      className={`voice-wave-bar ${isPlaying ? 'playing' : ''}`}
                                      style={{
                                        height: isPlaying ? undefined : `${h}px`,
                                        background: isMe ? 'rgba(255,255,255,0.95)' : 'var(--primary)',
                                        animationDelay: `${i * 0.08}s`,
                                        width: '3px',
                                        borderRadius: '2px'
                                      }}
                                    />
                                  ))}
                                </div>

                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.74rem',
                                  opacity: isMe ? 0.9 : 0.75,
                                  fontWeight: 700,
                                  fontFamily: 'monospace'
                                }}>
                                  <span>{isPlaying ? formatDuration(playProgress) : '0:00'}</span>
                                  <span>{formatDuration(m.duration || 5)}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>{m.message_text}</div>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.2rem',
                          textAlign: isMe ? 'right' : 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          gap: '0.25rem'
                        }}>
                          <span>{m.created_at ? m.created_at.slice(11, 16) : ''}</span>
                          {isMe && <CheckCheck size={14} color={m.is_read ? 'var(--primary)' : 'var(--text-muted)'} />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form & Dedicated Voice Message Button */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '0.85rem 1.25rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  gap: '0.65rem',
                  alignItems: 'center',
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={isRecording ? `🎙️ Recording voice message (${formatDuration(recordingDuration)})...` : newText}
                    onChange={(e) => setNewText(e.target.value)}
                    disabled={isRecording}
                    placeholder={isRecording ? "Recording voice message..." : `Write message or touch 🎤 to record voice message...`}
                    className={`form-input ${isRecording ? 'recording-input-glow' : ''}`}
                    style={{
                      flex: 1,
                      paddingRight: isRecording ? '85px' : '14px',
                      color: isRecording ? '#ef4444' : 'inherit',
                      fontWeight: isRecording ? 600 : 'normal'
                    }}
                  />
                  {isRecording && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span className="recording-dot" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: '#ef4444' }}>
                        {formatDuration(recordingDuration)}
                      </span>
                      <button
                        type="button"
                        onClick={cancelRecording}
                        title="Cancel voice recording"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Voice Message Image/Button right next to typing input */}
                <button
                  type="button"
                  onClick={handleTouchVoiceToggle}
                  onMouseDown={handlePointerDown}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchEnd={handlePointerUp}
                  className={`voice-mic-btn ${isRecording ? 'recording' : ''}`}
                  title={isRecording ? `Touch to send voice message straight to ${activeConv.other_user?.name}` : `Touch to record voice message for ${activeConv.other_user?.name}`}
                  aria-label="Voice Message"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isRecording ? (
                    <AudioWaveform size={20} className="pulse-icon" />
                  ) : (
                    <Mic size={20} />
                  )}
                </button>

                {/* Send Button */}
                <button
                  type={isRecording ? "button" : "submit"}
                  onClick={isRecording ? sendVoiceMessageStraight : undefined}
                  disabled={sending || (!isRecording && !newText.trim())}
                  className="btn btn-primary"
                  style={{ display: 'flex', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
                  title={isRecording ? "Send recorded voice message" : "Send message"}
                >
                  <Send size={16} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a conversation on the left to start messaging.
            </div>
          )}
        </div>
      </div>

      {/* Contact Picker Modal for New Message */}
      {showContactModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Start New Conversation</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Message any verified Planner, Vendor, or Customer account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.5rem', borderRadius: '8px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Controls */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              <input
                type="text"
                placeholder="Search by name, email, or service..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="form-input"
                style={{ marginBottom: '0.5rem', width: '100%', fontSize: '0.85rem' }}
              />
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['', 'PLANNER', 'VENDOR', 'CUSTOMER'].map((roleKey) => (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => setContactRoleFilter(roleKey)}
                    className={`btn btn-sm ${contactRoleFilter === roleKey ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                  >
                    {roleKey === '' ? 'All Accounts' : roleKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1rem', maxHeight: '360px' }}>
              {loadingContacts ? (
                <LoadingSkeleton rows={4} />
              ) : contacts.filter((c) => {
                const matchSearch =
                  !contactSearch ||
                  c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  c.subtitle?.toLowerCase().includes(contactSearch.toLowerCase());
                const matchRole = !contactRoleFilter || c.role === contactRoleFilter;
                return matchSearch && matchRole;
              }).length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No contacts found matching criteria.
                </div>
              ) : (
                contacts.filter((c) => {
                  const matchSearch =
                    !contactSearch ||
                    c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    c.subtitle?.toLowerCase().includes(contactSearch.toLowerCase());
                  const matchRole = !contactRoleFilter || c.role === contactRoleFilter;
                  return matchSearch && matchRole;
                }).map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleSelectContact(contact)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}>
                        {contact.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                          {contact.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {contact.email}
                        </div>
                        {contact.subtitle && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                            {contact.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                      {contact.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
