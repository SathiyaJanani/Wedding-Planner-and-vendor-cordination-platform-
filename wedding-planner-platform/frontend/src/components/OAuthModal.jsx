import React from 'react';
import { X, ShieldCheck, ExternalLink, Key, CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-surface, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle, #f8fafc)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#fff',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                Official Google OAuth 2.0
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                Enterprise Google Identity Authentication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={22} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main, #1e293b)', lineHeight: 1.45 }}>
              <strong>Strict Security Protocol:</strong> This platform exclusively connects to Google's official OAuth 2.0 servers. It will <strong>never</strong> collect or store your Gmail password or personal credentials.
            </div>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #475569)', marginBottom: '1rem', lineHeight: 1.5 }}>
            To activate real Google Sign-In with Google's account chooser, set your Google Cloud credentials in <code style={{ background: 'var(--bg-subtle, #f1f5f9)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary)' }}>WPVCP/backend/.env</code>:
          </p>

          {/* Config Box */}
          <div style={{
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '10px',
            padding: '1rem',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            marginBottom: '1.25rem',
            overflowX: 'auto',
            border: '1px solid #1e293b'
          }}>
            <div style={{ color: '#94a3b8' }}># WPVCP/backend/.env</div>
            <div><span style={{ color: '#38bdf8' }}>GOOGLE_CLIENT_ID</span>=your-client-id.apps.googleusercontent.com</div>
            <div><span style={{ color: '#38bdf8' }}>GOOGLE_CLIENT_SECRET</span>=your-client-secret</div>
            <div><span style={{ color: '#38bdf8' }}>GOOGLE_CALLBACK_URL</span>=http://localhost:5000/api/auth/google/callback</div>
          </div>

          {/* Details list */}
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #475569)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={15} style={{ color: '#10b981' }} />
              <span><strong>Authorized Redirect URI:</strong> http://localhost:5000/api/auth/google/callback</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={15} style={{ color: '#10b981' }} />
              <span><strong>Authorized Origin:</strong> http://localhost:5173</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={15} style={{ color: '#10b981' }} />
              <span><strong>OAuth Prompt:</strong> <code style={{ color: 'var(--primary)' }}>select_account</code> (Enables "Use another account" & account chooser)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href="http://localhost:5000/api/auth/google"
              className="btn btn-primary btn-block"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
            >
              <span>Connect via Google OAuth</span>
              <ExternalLink size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ minWidth: '100px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
