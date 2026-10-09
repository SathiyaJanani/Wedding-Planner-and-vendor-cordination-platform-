import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import { formatVendorId } from '../../utils/formatters';
import { Store, MapPin, Mail, Phone, Globe, Instagram, Save, Star, ShieldCheck } from 'lucide-react';
import WeddingHallMap from '../../components/WeddingHallMap';
import { isWeddingHallVendor } from '../../utils/weddingHallHelper';

export default function VendorProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    business_name: '',
    category_id: '',
    category_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    price_range: 'MID',
    description: '',
    experience_years: 5,
    website_url: '',
    instagram_url: '',
    rating: '5.0',
    is_verified: 1
  });

  useEffect(() => {
    fetchProfileAndCategories();
  }, []);

  const fetchProfileAndCategories = async () => {
    try {
      setLoading(true);
      const [profRes, catRes] = await Promise.all([
        axios.get('/api/vendors/profile/me'),
        axios.get('/api/vendors/categories')
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
      }

      if (profRes.data.success && profRes.data.data) {
        const v = profRes.data.data;
        setFormData({
          id: v.id,
          business_name: v.business_name || '',
          category_id: v.category_id || '',
          category_name: v.category_name || '',
          contact_person: v.contact_person || '',
          phone: v.phone || '',
          email: v.email || '',
          address: v.address || '',
          city: v.city || '',
          state: v.state || '',
          pincode: v.pincode || v.postal_code || '',
          latitude: v.latitude !== null && v.latitude !== undefined ? v.latitude : '',
          longitude: v.longitude !== null && v.longitude !== undefined ? v.longitude : '',
          price_range: v.price_range || 'MID',
          description: v.description || '',
          experience_years: v.experience_years || 3,
          website_url: v.website_url || '',
          instagram_url: v.instagram_url || '',
          rating: v.rating || '5.0',
          is_verified: v.is_verified || 0
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showToast('Could not load vendor profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) return;
    try {
      setSaving(true);
      const isHall = isWeddingHallVendor(formData);
      const payload = {
        ...formData,
        postal_code: formData.pincode || formData.postal_code
      };

      // Strict requirement: Only Wedding Hall vendors submit latitude/longitude
      if (isHall) {
        payload.latitude = formData.latitude !== '' ? parseFloat(formData.latitude) : null;
        payload.longitude = formData.longitude !== '' ? parseFloat(formData.longitude) : null;
      } else {
        delete payload.latitude;
        delete payload.longitude;
      }

      const res = await axios.put(`/api/vendors/${formData.id}`, payload);
      if (res.data.success) {
        showToast('Vendor profile updated successfully!', 'success');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.08) 100%)',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 700
        }}>
          {formData.business_name?.charAt(0) || 'V'}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
              {formData.business_name || 'Vendor Business'}
            </h2>
            <span className="id-badge id-badge-vnd">{formatVendorId(formData.id || user?.vendor_id)}</span>
            {formData.is_verified ? (
              <Badge variant="success">
                <ShieldCheck size={13} style={{ marginRight: 3, verticalAlign: -2 }} /> Verified Partner
              </Badge>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
            <span>Category: <strong>{formData.category_name || 'General'}</strong></span>
            <span>Rating: <strong style={{ color: '#EAB308' }}>★ {formData.rating}</strong></span>
            <span>Tier: <strong>{formData.price_range}</strong></span>
            <span>Experience: <strong>{formData.experience_years} Years</strong></span>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Business & Contact Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            <input
              type="text"
              name="business_name"
              className="form-control"
              required
              value={formData.business_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Category *</label>
            <select
              name="category_id"
              className="form-control"
              required
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Contact Person</label>
            <input
              type="text"
              name="contact_person"
              className="form-control"
              value={formData.contact_person}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price Bracket</label>
            <select
              name="price_range"
              className="form-control"
              value={formData.price_range}
              onChange={handleChange}
            >
              <option value="BUDGET">Budget-Friendly</option>
              <option value="MID">Mid-Range / Premium</option>
              <option value="LUXURY">Luxury / Bespoke</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              className="form-control"
              min="0"
              max="60"
              value={formData.experience_years}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 style={{ margin: '1rem 0 0', fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Location & Social Links
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Street Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              className="form-control"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              name="state"
              className="form-control"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PIN Code</label>
            <input
              type="text"
              name="pincode"
              className="form-control"
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Website URL</label>
            <input
              type="url"
              name="website_url"
              className="form-control"
              placeholder="https://..."
              value={formData.website_url}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instagram Handle / URL</label>
            <input
              type="text"
              name="instagram_url"
              className="form-control"
              placeholder="https://instagram.com/..."
              value={formData.instagram_url}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">About the Business / Wedding Portfolio</label>
          <textarea
            name="description"
            className="form-control"
            rows={4}
            placeholder="Describe your signature wedding style, team strengths, equipment, packages..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Wedding Hall Location & Coordinates - Strictly Wedding Hall Vendors Only */}
        {isWeddingHallVendor(formData) && (
          <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" />
              <span>Wedding Hall Coordinates & Location Map</span>
            </h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Configure GPS coordinates for your wedding venue so couples and wedding planners can locate your venue on Google Maps and get turn-by-turn navigation directions.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Latitude (e.g. 12.9982)</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="form-control"
                  placeholder="12.998200"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude (e.g. 77.5921)</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="form-control"
                  placeholder="77.592100"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Display Interactive Google Map for Wedding Hall */}
            <WeddingHallMap vendor={formData} title="Your Wedding Hall Location" />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}
          >
            <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
