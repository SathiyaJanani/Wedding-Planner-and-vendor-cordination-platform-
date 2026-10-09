import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { Bell, Check, CheckCheck, Clock, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (e) {
      // quiet
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success('All notifications marked as read.');
    } catch (e) {
      toast.error('Failed to mark all as read.');
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Notifications & System Alerts
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Real-time updates regarding booking requests, customer approvals, milestone payments, and vendor updates.
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm" style={{ display: 'flex', gap: '0.4rem' }}>
          <CheckCheck size={16} />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : notifications.length === 0 ? (
          <EmptyState title="No notifications" message="You are all caught up! New coordination alerts will arrive here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '1.25rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: n.is_read ? 'transparent' : 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: n.is_read ? 'var(--bg-subtle)' : 'var(--primary-light)',
                    color: n.is_read ? 'var(--text-muted)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                        {n.title}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        {n.notification_type}
                      </span>
                      {!n.is_read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={12} />
                      <span>{n.created_at ? n.created_at.slice(0, 16).replace('T', ' ') : 'Just now'}</span>
                    </div>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0, padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <Check size={14} />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
