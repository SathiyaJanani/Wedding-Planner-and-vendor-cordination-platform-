import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import { formatCustomerId } from '../../utils/formatters';
import { User, Heart, MapPin, Mail, Phone, Calendar, DollarSign, Users, Save } from 'lucide-react';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    id: null,
    full_name: '',
    partner_name: '',
    email: '',
    phone: '',
    wedding_date: '',
    city: '',
    state: '',
    address: '',
    wedding_theme: '',
    guest_count: 300,
    estimated_budget: 1500000,
    assigned_planner_name: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers/me');
      if (res.data.success && res.data.data) {
        const c = res.data.data;
        setProfile({
          id: c.id,
          full_name: c.full_name || '',
          partner_name: c.partner_name || '',
          email: c.email || '',
          phone: c.phone || '',
          wedding_date: c.wedding_date ? c.wedding_date.split('T')[0] : '',
          city: c.city || '',
          state: c.state || '',
          address: c.address || '',
          wedding_theme: c.wedding_theme || '',
          guest_count: c.guest_count || 300,
          estimated_budget: c.estimated_budget || 1500000,
          assigned_planner_name: c.assigned_planner_name || c.planner_name || ''
        });
      }
    } catch (err) {
      console.error('Error fetching customer profile:', err);
      showToast('Could not load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.id) return;

    try {
      setSaving(true);
      const res = await axios.put(`/api/customers/${profile.id}`, profile);
      if (res.data.success) {
        showToast('Profile updated successfully!', 'success');
        if (updateUser) {
          updateUser({ full_name: profile.full_name, phone: profile.phone });
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.1) 100%)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'var(--primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          fontWeight: 700
        }}>
          {profile.full_name?.charAt(0) || 'C'}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              {profile.full_name} {profile.partner_name && `& ${profile.partner_name}`}
            </h2>
            <span className="id-badge id-badge-cust">{formatCustomerId(profile.id || user?.customer_id)}</span>
            <Badge variant="primary">Couple Suite</Badge>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
            <span>Target City: <strong>{profile.city || 'Not specified'}</strong></span>
            {profile.wedding_date && (
              <span>Wedding Date: <strong>{new Date(profile.wedding_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
            )}
            {profile.assigned_planner_name && (
              <span>Planner: <strong style={{ color: 'var(--primary)' }}>{profile.assigned_planner_name}</strong></span>
            )}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Personal & Couple Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Your Full Name *</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              required
              value={profile.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Partner / Spouse Name</label>
            <input
              type="text"
              name="partner_name"
              className="form-control"
              placeholder="e.g. Groom or Bride's full name"
              value={profile.partner_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Registered Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              disabled
              style={{ opacity: 0.7 }}
              value={profile.email}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={profile.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Wedding Ceremony Vision
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Wedding Date</label>
            <input
              type="date"
              name="wedding_date"
              className="form-control"
              value={profile.wedding_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination / City</label>
            <input
              type="text"
              name="city"
              className="form-control"
              placeholder="e.g. Chennai, Bangalore, Udaipur"
              value={profile.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Guest Count</label>
            <input
              type="number"
              name="guest_count"
              className="form-control"
              min="10"
              max="10000"
              value={profile.guest_count}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Total Budget (INR ₹)</label>
            <input
              type="number"
              name="estimated_budget"
              className="form-control"
              min="50000"
              step="10000"
              value={profile.estimated_budget}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Wedding Theme / Preferred Aesthetic</label>
            <input
              type="text"
              name="wedding_theme"
              className="form-control"
              placeholder="e.g. Royal Heritage South Indian, Bohemian Beach Sunset, Palace Luxury"
              value={profile.wedding_theme}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
