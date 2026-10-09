import React from 'react';
import { PackageOpen } from 'lucide-react';

export function EmptyState({ icon: Icon = PackageOpen, title = 'No records found', message, description, action, actionText, onAction }) {
  const displayMsg = message || description || 'There are currently no items matching this criteria.';
  return (
    <div style={{
      padding: '3.5rem 2rem',
      textAlign: 'center',
      background: 'var(--card-bg)',
      border: '1px dashed var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.85rem'
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--bg-secondary)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={28} />
      </div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{title}</h4>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5, margin: 0 }}>{displayMsg}</p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
      {actionText && onAction && (
        <div style={{ marginTop: '0.5rem' }}>
          <button onClick={onAction} className="btn btn-primary btn-sm">
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}

export function LoadingSkeleton({ count = 3, rows = 3, height = 80 }) {
  const num = count || rows;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', padding: '0.5rem 0' }}>
      {Array.from({ length: num }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{
            height: height,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--card-bg)'
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ width: '45%', height: 16, borderRadius: 4, background: 'var(--bg-secondary)' }} />
            <div style={{ width: '75%', height: 12, borderRadius: 4, background: 'var(--bg-secondary)' }} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulseSkeleton {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .card {
          animation: pulseSkeleton 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default EmptyState;
