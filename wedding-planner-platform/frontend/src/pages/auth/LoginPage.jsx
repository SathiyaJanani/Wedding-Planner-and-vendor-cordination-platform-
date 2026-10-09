import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import OAuthModal from '../../components/OAuthModal';
import { Sparkles, Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, setAuthToken } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOAuthOpen, setIsOAuthOpen] = useState(false);

  // Detect and process official Google OAuth redirect parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get('google_token');
    const googleError = params.get('google_error');
    const role = params.get('role');

    if (googleToken) {
      setAuthToken(googleToken);
      toast.success('Successfully authenticated with Google!');
      redirectUser(role || 'CUSTOMER');
    } else if (googleError) {
      if (googleError === 'not_configured') {
        setIsOAuthOpen(true);
      } else {
        toast.error(`Google authentication error: ${googleError}`);
      }
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.full_name}!`);
      redirectUser(data.user.role);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/google/url');
      if (res.data.success && res.data.configured && res.data.authUrl) {
        // Redirect directly to official Google OAuth 2.0 authorization endpoint
        window.location.href = res.data.authUrl;
      } else {
        // Open Google OAuth Configuration Guide
        setIsOAuthOpen(true);
      }
    } catch (err) {
      setIsOAuthOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === 'PLANNER') navigate('/planner/dashboard');
    else if (role === 'VENDOR') navigate('/vendor/dashboard');
    else navigate('/customer/dashboard');
  };

  // Quick preset helper for evaluator/examiner testing
  const fillPreset = (roleType) => {
    if (roleType === 'PLANNER') {
      setEmail('planner@wedding.com');
      setPassword('password123');
    } else if (roleType === 'VENDOR') {
      setEmail('shutter@wedding.com');
      setPassword('password123');
    } else if (roleType === 'CUSTOMER') {
      setEmail('rahul.anita@gmail.com');
      setPassword('password123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--card-shadow)',
        padding: '2.5rem 2rem'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'var(--primary)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(225, 29, 72, 0.3)',
            marginBottom: '1rem'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 className="heading-cinzel" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Sign in to access your wedding coordination workspace
          </p>
        </div>

        {/* Quick Testing Login Chips */}
        <div style={{
          padding: '0.75rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px dashed var(--border)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Quick Sample Logins (Password: password123)
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => fillPreset('PLANNER')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              👤 Planner
            </button>
            <button type="button" onClick={() => fillPreset('VENDOR')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              🏪 Vendor
            </button>
            <button type="button" onClick={() => fillPreset('CUSTOMER')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              💍 Customer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '1.25rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.75rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          textTransform: 'uppercase'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span>Or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Professional Continue with Google Button */}
        <button
          type="button"
          onClick={handleContinueWithGoogle}
          disabled={loading}
          className="btn btn-secondary btn-block btn-lg"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            background: 'var(--bg-surface)'
          }}
        >
          {/* SVG Google 'G' icon */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span style={{ fontWeight: 600 }}>Continue with Google</span>
        </button>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create Account
          </Link>
        </div>
      </div>

      {/* Official Google OAuth Modal */}
      <OAuthModal
        isOpen={isOAuthOpen}
        onClose={() => setIsOAuthOpen(false)}
      />
    </div>
  );
}
