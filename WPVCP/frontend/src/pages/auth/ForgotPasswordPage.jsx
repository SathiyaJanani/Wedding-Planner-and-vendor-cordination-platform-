import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success(res.data.message || 'Password reset instructions sent.');
    } catch (err) {
      toast.error('Failed to process reset request. Please try again.');
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
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--card-shadow)',
        padding: '2.5rem 2rem'
      }}>
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
          <h2 className="heading-cinzel" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Enter your registered email to receive recovery instructions
          </p>
        </div>

        {submitted ? (
          <div style={{
            padding: '1.5rem',
            background: 'var(--status-success-bg)',
            color: 'var(--status-success)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            lineHeight: 1.6,
            fontSize: '0.9rem'
          }}>
            Check your inbox! We have dispatched instructions to <strong>{email}</strong>.
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/login" className="btn btn-primary btn-block">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: '1.25rem' }}
            >
              <Send size={18} />
              <span>{loading ? 'Sending Instructions...' : 'Send Reset Link'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <ArrowLeft size={16} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
