import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  Sun, Moon, Type, Globe, Shield, Lock, User, LogOut, Check, Save, Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user, role, logout, updateProfile } = useAuth();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('appearance');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Profile update state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profLoading, setProfLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter your current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await axios.put('/api/auth/change-password', { currentPassword, newPassword });
      toast.success(res.data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfLoading(true);
    try {
      // Update endpoint
      if (role === 'CUSTOMER') {
        await axios.put(`/api/customers/${user.customer_id}`, { full_name: fullName, phone });
      } else if (role === 'VENDOR') {
        await axios.put(`/api/vendors/${user.vendor_id}`, { phone });
      }
      updateProfile({ full_name: fullName, phone });
      toast.success('Profile details updated successfully.');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setProfLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>
          {t('settings_title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Customize platform themes, font typography scaling, multi-language localization, and security credentials.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '2rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {[
          { key: 'appearance', label: t('settings_appearance'), icon: Sun },
          { key: 'language', label: t('settings_language'), icon: Globe },
          { key: 'account', label: t('settings_account_security'), icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'none',
                borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Appearance & Font Scaling */}
      {activeTab === 'appearance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
          {/* Theme Selection */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{t('settings_appearance')}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select your visual preference. Light mode provides high-contrast clarity; dark mode provides sleek elegance.
            </p>
            <div className="grid-2">
              <div
                onClick={() => setTheme('light')}
                style={{
                  padding: '1.5rem',
                  border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  color: '#111827',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Sun size={24} color="#f59e0b" />
                  <div>
                    <div style={{ fontWeight: 700 }}>{t('settings_light_mode')}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Clean luxury pearl palette</div>
                  </div>
                </div>
                {theme === 'light' && <Check size={20} color="var(--primary)" />}
              </div>

              <div
                onClick={() => setTheme('dark')}
                style={{
                  padding: '1.5rem',
                  border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: '#111827',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Moon size={24} color="#818cf8" />
                  <div>
                    <div style={{ fontWeight: 700 }}>{t('settings_dark_mode')}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Midnight onyx aesthetics</div>
                  </div>
                </div>
                {theme === 'dark' && <Check size={20} color="var(--primary)" />}
              </div>
            </div>
          </div>

          {/* Font Size Scaling */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{t('settings_font_size')}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Choose your preferred typography scale. This updates text across all tables, cards, and navigation.
            </p>
            <div className="grid-4">
              {[
                { key: 'small', label: t('settings_font_small'), sizePx: '13.5px' },
                { key: 'medium', label: t('settings_font_medium'), sizePx: '15.0px' },
                { key: 'large', label: t('settings_font_large'), sizePx: '16.5px' },
                { key: 'xlarge', label: t('settings_font_xlarge'), sizePx: '18.0px' }
              ].map(f => {
                const isSelected = fontSize === f.key;
                return (
                  <div
                    key={f.key}
                    onClick={() => setFontSize(f.key)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: f.sizePx, fontWeight: 700, marginBottom: '0.25rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                      Aa ({f.sizePx})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {f.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Multi-Language Localization */}
      {activeTab === 'language' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>{t('settings_language')}</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Switch application language across 6 major Indian languages. Navigation items, badges, buttons, and alerts update immediately.
          </p>

          <div className="grid-3">
            {languages.map(lang => {
              const isSelected = language === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    toast.success(`Language updated to ${lang.nativeName} (${lang.label})`);
                  }}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--primary-glow)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                      {lang.nativeName}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {lang.label}
                    </div>
                  </div>
                  {isSelected && <Check size={20} color="var(--primary)" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Account & Security */}
      {activeTab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
          {/* Profile Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Personal & Contact Information</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input"
                  style={{ background: 'var(--bg-subtle)', opacity: 0.8 }}
                />
              </div>

              <button type="submit" disabled={profLoading} className="btn btn-primary">
                <Save size={16} />
                <span>{profLoading ? 'Saving...' : t('save_changes')}</span>
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Change Account Password</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Ensure your account uses a strong, complex password.
            </p>

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={pwdLoading} className="btn btn-secondary">
                <Lock size={16} />
                <span>{pwdLoading ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
