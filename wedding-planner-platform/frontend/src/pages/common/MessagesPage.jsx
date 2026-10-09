import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import {
  MessageSquare, Send, User, Clock, Check, CheckCheck, Sparkles
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
  const messagesEndRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (activeConv) fetchMessages(activeConv.id, false);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConv]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('/api/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
        if (res.data.data.length > 0 && !activeConv) {
          setActiveConv(res.data.data[0]);
          fetchMessages(res.data.data[0].id, true);
        }
      }
    } catch (e) {
      toast.error('Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId, scroll = false) => {
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
    fetchMessages(conv.id, true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newText.trim() || sending || !activeConv) return;

    setSending(true);
    try {
      const res = await axios.post('/api/messages', {
        conversation_id: activeConv.id,
        recipient_id: activeConv.other_user.id,
        message_text: newText.trim(),
        wedding_project_id: activeConv.wedding_project_id
      });
      if (res.data.success) {
        setNewText('');
        fetchMessages(activeConv.id, true);
        fetchConversations();
      }
    } catch (err) {
      toast.error('Failed to dispatch message.');
    } finally {
      setSending(false);
    }
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
            <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.5rem' }}>
              Conversations ({conversations.length})
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
                          {m.message_text}
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

              {/* Message Input Form */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  gap: '0.75rem',
                  background: 'var(--bg-surface)'
                }}
              >
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder={`Write message to ${activeConv.other_user.name}...`}
                  className="form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={sending || !newText.trim()}
                  className="btn btn-primary"
                  style={{ display: 'flex', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
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
    </div>
  );
}
