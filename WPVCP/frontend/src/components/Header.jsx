import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRecentlyAccessed } from '../context/RecentlyAccessedContext';
import {
  Menu, Sun, Moon, Globe, Bell, Type, Search, User as UserIcon, LogOut, Check, Clock
} from 'lucide-react';

export default function Header({ onMenuClick }) {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const { items: recentItems } = useRecentlyAccessed();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showRecentMenu, setShowRecentMenu] = useState(false);

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications?is_read=false');
      if (res.data.success) {
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (e) {
      // quiet fallback
    }
  };

  const handleNotificationsClick = () => {
    if (role === 'ADMIN') navigate('/admin/notifications');
    else if (role === 'PLANNER') navigate('/planner/notifications');
    else if (role === 'VENDOR') navigate('/vendor/notifications');
    else navigate('/customer/notifications');
  };

  const handleProfileClick = () => {
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'PLANNER') navigate('/planner/settings');
    else if (role === 'VENDOR') navigate('/vendor/profile');
    else navigate('/customer/profile');
  };

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', padding: '0.45rem' }}
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${role === 'ADMIN' ? 'badge-danger' : role === 'PLANNER' ? 'badge-purple' : role === 'VENDOR' ? 'badge-warning' : 'badge-info'}`}>
            {role === 'ADMIN' ? '👑 ' + (t('role_admin') || 'Platform Administrator') : role === 'PLANNER' ? t('role_planner') : role === 'VENDOR' ? t('role_vendor') : t('role_customer')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Language Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowLangMenu(!showLangMenu); setShowFontMenu(false); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', gap: '0.4rem' }}
            title={t('settings_language')}
          >
            <Globe size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {languages.find(l => l.code === language)?.nativeName || 'EN'}
            </span>
          </button>

          {showLangMenu && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--card-shadow)',
              minWidth: '160px',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    textAlign: 'left',
                    background: language === lang.code ? 'var(--bg-subtle)' : 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span>{lang.nativeName} ({lang.label})</span>
                  {language === lang.code && <Check size={14} color="var(--primary)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowFontMenu(!showFontMenu); setShowLangMenu(false); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', padding: '0.5rem' }}
            title={t('settings_font_size')}
          >
            <Type size={16} />
          </button>

          {showFontMenu && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--card-shadow)',
              minWidth: '150px',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              {[
                { key: 'small', label: t('settings_font_small') },
                { key: 'medium', label: t('settings_font_medium') },
                { key: 'large', label: t('settings_font_large') },
                { key: 'xlarge', label: t('settings_font_xlarge') }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFontSize(f.key); setShowFontMenu(false); }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    textAlign: 'left',
                    background: fontSize === f.key ? 'var(--bg-subtle)' : 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span>{f.label}</span>
                  {fontSize === f.key && <Check size={14} color="var(--primary)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', padding: '0.5rem' }}
          title={theme === 'light' ? t('settings_dark_mode') : t('settings_light_mode')}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
        </button>

        {/* Notification Bell with unread badge */}
        <button
          onClick={handleNotificationsClick}
          className="btn btn-secondary btn-sm"
          style={{ position: 'relative', display: 'flex', padding: '0.5rem' }}
          title={t('nav_notifications')}
          aria-label="View Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Recently Accessed Dropdown Header Widget */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowRecentMenu(!showRecentMenu); setShowLangMenu(false); setShowFontMenu(false); }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}
            title={t('recently_accessed') || 'Recently Accessed'}
          >
            <Clock size={16} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Recent</span>
          </button>

          {showRecentMenu && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: 'var(--bg-surface-elevated, #fff)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md, 10px)',
              boxShadow: 'var(--card-shadow)',
              minWidth: '280px',
              zIndex: 100,
              overflow: 'hidden',
              padding: '0.5rem 0'
            }}>
              <div style={{ padding: '0.4rem 0.85rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase' }}>
                {t('recently_accessed') || 'Recently Accessed'}
              </div>
              {!recentItems || recentItems.length === 0 ? (
                <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No recent pages yet
                </div>
              ) : (
                recentItems.slice(0, 5).map(item => (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.path); setShowRecentMenu(false); }}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    className="dropdown-item"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.type}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Pill */}
        <button
          onClick={handleProfileClick}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem' }}
        >
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.full_name || 'Account'}
          </span>
        </button>
      </div>
    </header>
  );
}
