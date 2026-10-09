import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Sun, Moon, Globe, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (role === 'PLANNER') return '/planner/dashboard';
    if (role === 'VENDOR') return '/vendor/dashboard';
    return '/customer/dashboard';
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: '76px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'var(--primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)'
        }}>
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.04em', color: 'var(--text-main)' }}>
            VOWS & VEILS
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Wedding Coordination Platform
          </div>
        </div>
      </Link>

      {/* Middle Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav-links">
        <a href="#services" style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--text-main)' }}>Services</a>
        <a href="#how-it-works" style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--text-main)' }}>Workflow</a>
        <a href="#features" style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--text-main)' }}>Features</a>
        <a href="#testimonials" style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--text-main)' }}>Reviews</a>
        <a href="#faq" style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--text-main)' }}>FAQ</a>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Language dropdown */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="form-select"
          style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
          aria-label="Select Language"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.nativeName}</option>
          ))}
        </select>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.5rem' }}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#f59e0b" />}
        </button>

        <Link to="/login" className="btn btn-secondary btn-sm" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <LogIn size={15} />
          <span>Sign In</span>
        </Link>
        <Link to="/register" className="btn btn-primary btn-sm" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <UserPlus size={15} />
          <span>Create Account</span>
        </Link>
      </div>
    </nav>
  );
}
