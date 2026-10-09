import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import OAuthModal from '../../components/OAuthModal';
import { Sparkles, User, Mail, Lock, Phone, Store, Calendar, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOAuthOpen, setIsOAuthOpen] = useState(false);

  // Customer specific
  const [partnerName, setPartnerName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');

  // Vendor specific
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'VENDOR') {
      fetchCategories();
    }
  }, [role]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/vendors/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (e) {
      // quiet fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error('Please enter full name, email, and password.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        password,
        role,
        partner_name: role === 'CUSTOMER' ? partnerName : undefined,
        wedding_date: role === 'CUSTOMER' ? weddingDate : undefined,
        business_name: (role === 'VENDOR' || role === 'PLANNER') ? businessName : undefined,
        category_id: role === 'VENDOR' ? categoryId : undefined
      };

      const data = await register(payload);
      toast.success(`Account registered! Welcome, ${data.user.full_name}.`);

      if (role === 'PLANNER') navigate('/planner/dashboard');
      else if (role === 'VENDOR') navigate('/vendor/dashboard');
      else navigate('/customer/dashboard');

    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/google/url');
      if (res.data.success && res.data.configured && res.data.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        setIsOAuthOpen(true);
      }
    } catch (err) {
      setIsOAuthOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '2.5rem 1rem'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--card-shadow)',
        padding: '2.5rem 2rem'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            Join the Platform
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Choose your account role to begin coordinating weddings
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          padding: '0.35rem',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.75rem'
        }}>
          {[
            { key: 'CUSTOMER', label: '💍 Couple' },
            { key: 'VENDOR', label: '🏪 Vendor' },
            { key: 'PLANNER', label: '👤 Planner' }
          ].map(r => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              style={{
                padding: '0.6rem 0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: role === r.key ? 'var(--bg-surface)' : 'transparent',
                color: role === r.key ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: role === r.key ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: role === r.key ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Verma"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          {/* Dynamic Role-specific inputs */}
          {role === 'CUSTOMER' && (
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Partner's Name</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Anita Sharma"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Wedding Date</label>
                <input
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {role === 'VENDOR' && (
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Business / Brand Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Shutter & Soul Studios"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="form-select"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {role === 'PLANNER' && (
            <div className="form-group">
              <label className="form-label">Agency / Studio Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Royal Vows Event Directors"
                className="form-input"
                required
              />
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password</label>
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '0.75rem' }}
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.5rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          textTransform: 'uppercase'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span>Or register with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Continue with Google Button */}
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
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span style={{ fontWeight: 600 }}>Sign up with Google</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
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
