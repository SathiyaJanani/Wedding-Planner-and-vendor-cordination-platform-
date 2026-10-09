import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, X, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';

export default function Chatbot() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested prompt pills tailored to user's exact role
  const suggestionsByRole = {
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
          message_text: `Hello ${user?.full_name || 'there'}! I am your Wedding Coordination Assistant. Ask me anything about your ${role === 'CUSTOMER' ? 'wedding project, payments, or vendors' : role === 'VENDOR' ? 'schedule, booking requests, or earnings' : 'customers, requests, and wedding budgets'}.`
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'USER',
      message_text: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chatbot/message', { message: queryText });
      if (response.data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'BOT',
            message_text: response.data.data.message_text
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
            {messages.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`chat-bubble ${m.sender === 'USER' ? 'user' : 'bot'}`}
              >
                {m.message_text}
              </div>
            ))}

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

          {/* Input Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="chatbot-input-area"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about bookings, dates, payments..."
              className="form-input"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !input.trim()}
              style={{ padding: '0.5rem 0.8rem' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
