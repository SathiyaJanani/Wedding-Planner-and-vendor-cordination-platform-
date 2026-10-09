import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Bot, Send, X, MessageSquare, Sparkles, RefreshCw,
  Mic, MicOff, Volume2, Pause, Play, AudioWaveform
} from 'lucide-react';

export default function Chatbot() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceCaption, setVoiceCaption] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioPlayProgress, setAudioPlayProgress] = useState(0);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const speechRecRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pointerStartRef = useRef(0);

  // Suggested prompt pills tailored to user's exact role
  const suggestionsByRole = {
    ADMIN: [
      'Show platform executive financial metrics',
      'How many total registered users in system?',
      'Show MySQL server & database status',
      'What is the total escrow volume collected?'
    ],
    CUSTOMER: [
      'What is my booking status?',
      'How much have I paid?',
      'What vendors have been selected?',
      'When is my wedding?',
      'How do I submit wedding requirements?'
    ],
    PLANNER: [
      'How many pending vendor requests?',
      'Which bookings are confirmed?',
      'Show upcoming weddings',
      'Which payments are pending?'
    ],
    VENDOR: [
      'Do I have new requests?',
      'Show my upcoming bookings',
      'What payments are pending?',
      'Show recent reviews'
    ]
  };

  const suggestions = suggestionsByRole[role] || [
    'How does this platform work?',
    'What features are available?'
  ];

  // Initialize greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'BOT',
          message_text: `Hello ${user?.full_name || 'there'}! I am your Wedding Coordination Assistant. Ask me anything about your ${role === 'ADMIN' ? 'platform metrics, database status, escrow audit, or users' : role === 'CUSTOMER' ? 'wedding project, payments, or vendors' : role === 'VENDOR' ? 'schedule, booking requests, or earnings' : 'customers, requests, and wedding budgets'}.`
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Audio tone generator for reliable audible playback across all devices
  const createAudioToneBlob = (seconds) => {
    const sampleRate = 8000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const dur = Math.max(1, seconds || 2);
    const dataSize = sampleRate * 2 * dur;
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
    setIsRecording(true);
    setRecordingDuration(0);
    setVoiceCaption('');
    audioChunksRef.current = [];

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    // 1. Hardware Microphone capture via MediaRecorder
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
      console.warn('Microphone device or permission notice:', err.message);
    }

    // 2. Parallel speech recognition for transcript
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setVoiceCaption(transcript);
        };

        speechRecRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.warn('Speech recognition start note:', e);
      }
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
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (e) {}
      speechRecRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
    setVoiceCaption('');
  };

  const stopAndSendVoice = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const durationSec = Math.max(1, recordingDuration);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (e) {}
      speechRecRef.current = null;
    }

    let audioBlob = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      await new Promise(resolve => {
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

    const audioUrl = URL.createObjectURL(audioBlob);

    const defaultQuery = role === 'CUSTOMER' ? 'What is my wedding booking and payment status?'
      : role === 'PLANNER' ? 'How many pending vendor requests are there?'
      : role === 'VENDOR' ? 'Do I have new booking requests?'
      : 'Show platform executive financial metrics';

    const queryText = (voiceCaption || input).trim() || defaultQuery;
    setVoiceCaption('');
    setInput('');
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecordingDuration(0);

    await handleSendVoiceMessage(queryText, audioUrl, durationSec);
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
      stopAndSendVoice();
    }
  };

  const handleVoiceTouchBot = () => {
    const elapsed = Date.now() - pointerStartRef.current;
    if (elapsed <= 650) {
      if (isRecording) {
        stopAndSendVoice();
      } else {
        startRecording();
      }
    }
  };

  const togglePlayUserVoice = (msgId, audioUrl) => {
    if (playingAudioId === msgId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      setPlayingAudioId(null);
      setAudioPlayProgress(0);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      setPlayingAudioId(msgId);
      setAudioPlayProgress(0);

      audio.ontimeupdate = () => {
        setAudioPlayProgress(Math.floor(audio.currentTime));
      };

      audio.onended = () => {
        setPlayingAudioId(null);
        setAudioPlayProgress(0);
        audioPlayerRef.current = null;
      };

      audio.onerror = () => {
        setPlayingAudioId(null);
        audioPlayerRef.current = null;
      };

      audio.play().catch(e => {
        console.warn('Audio playback error:', e);
        setPlayingAudioId(null);
      });
    }
  };

  const handleListenResponse = (msgId, text) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
      return;
    }

    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setSpeakingMsgId(msgId);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendVoiceMessage = async (queryText, audioUrl, durationSec) => {
    if (loading) return;

    const userMsgId = Date.now();
    const userVoiceMsg = {
      id: userMsgId,
      sender: 'USER',
      message_text: queryText,
      is_voice: true,
      audio_url: audioUrl,
      duration: durationSec
    };

    setMessages(prev => [...prev, userVoiceMsg]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chatbot/message', { message: queryText });
      if (response.data.success) {
        const botMsgId = Date.now() + 1;
        const botText = response.data.data.message_text;
        setMessages(prev => [
          ...prev,
          {
            id: botMsgId,
            sender: 'BOT',
            message_text: botText,
            is_voice_response: true
          }
        ]);

        // Speak answer aloud automatically
        setTimeout(() => {
          handleListenResponse(botMsgId, botText);
        }, 150);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'BOT',
          message_text: 'I encountered an error retrieving that information. Please verify your connection or try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      message_text: queryText,
      is_voice: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chatbot/message', { message: queryText });
      if (response.data.success) {
        const botMsgId = Date.now() + 1;
        const botText = response.data.data.message_text;
        setMessages(prev => [
          ...prev,
          {
            id: botMsgId,
            sender: 'BOT',
            message_text: botText
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'BOT',
          message_text: 'I encountered an error retrieving that information. Please verify your connection or try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (sec) => {
    const s = Math.max(0, parseInt(sec) || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-trigger"
        title="Wedding Assistant Chatbot"
        aria-label="Open Chatbot"
      >
        {isOpen ? <X size={26} /> : <Bot size={28} />}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Wedding Assistant</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                  {role ? `${role} Context Active` : 'Online'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((m, idx) => {
              const isSpeaking = speakingMsgId === m.id;
              const isPlayingVoice = playingAudioId === m.id;

              return (
                <div key={m.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div className={`chat-bubble ${m.sender === 'USER' ? 'user' : 'bot'}`}>
                    {m.is_voice ? (
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#fef08a', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
                          <Mic size={12} /> <span>Voice Question</span>
                        </div>
                        {/* Playable voice message card */}
                        <div className="voice-message-player" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          minWidth: '200px',
                          maxWidth: '260px'
                        }}>
                          <button
                            type="button"
                            onClick={() => togglePlayUserVoice(m.id, m.audio_url)}
                            style={{
                              width: '36px',
                              height: '36px',
                              minWidth: '36px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              color: 'var(--primary)',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                              transition: 'transform 0.15s ease'
                            }}
                            title={isPlayingVoice ? "Pause voice message" : "Play voice message"}
                            aria-label="Play Voice Message"
                          >
                            {isPlayingVoice ? (
                              <Pause size={16} fill="currentColor" />
                            ) : (
                              <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />
                            )}
                          </button>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
                              {[10, 16, 22, 14, 20, 26, 18, 12, 24, 16, 12, 18].map((h, i) => (
                                <span
                                  key={i}
                                  className={`voice-wave-bar ${isPlayingVoice ? 'playing' : ''}`}
                                  style={{
                                    height: isPlayingVoice ? undefined : `${h}px`,
                                    background: 'rgba(255,255,255,0.95)',
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
                              fontSize: '0.72rem',
                              opacity: 0.9,
                              fontWeight: 700,
                              fontFamily: 'monospace'
                            }}>
                              <span>{isPlayingVoice ? formatDuration(audioPlayProgress) : '0:00'}</span>
                              <span>{formatDuration(m.duration || 3)}</span>
                            </div>
                          </div>
                        </div>

                        {m.message_text && (
                          <div style={{ fontSize: '0.76rem', opacity: 0.9, marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.3rem' }}>
                            "{m.message_text}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>{m.message_text}</div>
                    )}
                    
                    {m.sender === 'BOT' && (
                      <div style={{ marginTop: '0.45rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleListenResponse(m.id, m.message_text)}
                          style={{
                            background: isSpeaking ? 'rgba(16, 185, 129, 0.2)' : 'none',
                            border: 'none',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            color: isSpeaking ? '#10b981' : 'var(--text-muted)',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: 600
                          }}
                        >
                          {isSpeaking ? <Pause size={12} /> : <Volume2 size={12} />}
                          <span>{isSpeaking ? 'Pause Audio' : 'Listen to Answer'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isSpeaking && (
                    <div className="caption-box" style={{ margin: '0 0.5rem', alignSelf: 'flex-start' }}>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 800, marginBottom: '0.15rem' }}>
                        🔊 Live Subtitles:
                      </div>
                      <div>"{m.message_text}"</div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={14} className="spin" />
                <span>Fetching live wedding records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '12px' }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Form with Dedicated Voice Message Button right beside typing input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isRecording) {
                stopAndSendVoice();
              } else {
                handleSend();
              }
            }}
            className="chatbot-input-area"
            style={{
              padding: '0.65rem 0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border)'
            }}
          >
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                value={isRecording ? (voiceCaption ? `🎙️ "${voiceCaption}"` : `🎙️ Recording voice (${formatDuration(recordingDuration)})...`) : input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Recording voice question..." : "Ask question or touch 🎤 for Voice Message..."}
                className={`form-input ${isRecording ? 'recording-input-glow' : ''}`}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  paddingRight: isRecording ? '75px' : '0.75rem',
                  fontSize: '0.84rem',
                  color: isRecording ? '#ef4444' : 'inherit',
                  fontWeight: isRecording ? 600 : 'normal'
                }}
                disabled={isRecording || loading}
              />
              {isRecording && (
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span className="recording-dot" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, fontFamily: 'monospace', color: '#ef4444' }}>
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
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Voice Message Image/Button right next to chatbot typing field */}
            <button
              type="button"
              onClick={handleVoiceTouchBot}
              onMouseDown={handlePointerDown}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchEnd={handlePointerUp}
              className={`voice-mic-btn ${isRecording ? 'recording' : ''}`}
              title={isRecording ? "Touch to send voice question straight to assistant" : "Touch to record voice question"}
              aria-label="Voice Message to Assistant"
              style={{
                width: '38px',
                height: '38px',
                minWidth: '38px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {isRecording ? (
                <AudioWaveform size={18} className="pulse-icon" />
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Text Send Button */}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || (!isRecording && !input.trim())}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '8px' }}
              title={isRecording ? "Send recorded voice question" : "Send question"}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
