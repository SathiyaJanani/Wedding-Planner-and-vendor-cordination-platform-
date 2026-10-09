import React from 'react';
import { Link } from 'react-router-dom';
import { useRecentlyAccessed } from '../context/RecentlyAccessedContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock, ArrowRight, FolderHeart, Camera, Wallet, Calendar,
  ShieldCheck, User, FileText, CheckCircle, Receipt, PieChart,
  CreditCard, PackageCheck, Sparkles, Trash2
} from 'lucide-react';

const ICON_MAP = {
  Clock, FolderHeart, Camera, Wallet, Calendar, ShieldCheck, User,
  FileText, CheckCircle, Receipt, PieChart, CreditCard, PackageCheck, Sparkles
};

export default function RecentlyAccessedTray({ limit = 4, showClear = false }) {
  const { items, clearRecent } = useRecentlyAccessed();
  const { t } = useLanguage();

  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, limit);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg, 14px)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: 'var(--card-shadow, 0 4px 12px rgba(0,0,0,0.03))'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(225, 29, 72, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={18} />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em'
            }}>
              {t('recently_accessed') || 'Recently Accessed'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Jump directly back to your active projects, vendor catalogs, and invoices
            </p>
          </div>
        </div>

        {showClear && items.length > 0 && (
          <button
            onClick={clearRecent}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
            title="Clear Recent History"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Grid of recently accessed items */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem'
      }}>
        {displayItems.map((item) => {
          const IconComponent = ICON_MAP[item.icon] || FileText;

          return (
            <Link
              key={item.id}
              to={item.path}
              style={{
                textDecoration: 'none',
                background: 'var(--bg-subtle, #f8fafc)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md, 10px)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              className="recent-item-hover"
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <IconComponent size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '0.2rem'
                }}>
                  <span style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    fontWeight: 700,
                    color: 'var(--primary)'
                  }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>

                <div style={{
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.title}
                </div>

                {item.subtitle && (
                  <div style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px'
                  }}>
                    {item.subtitle}
                  </div>
                )}
              </div>

              <ArrowRight size={14} style={{ color: 'var(--text-muted)', marginTop: '6px', flexShrink: 0 }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
