import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatCustomerId, formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileText, Save, Send, CheckCircle, Clock, Sparkles,
  Edit3, ArrowRight, ShieldCheck, HeartHandshake, AlertCircle
} from 'lucide-react';

export default function CustomerRequirements() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Send to planner confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedReqForPlanner, setSelectedReqForPlanner] = useState(null);

  const [formData, setFormData] = useState({
    event_date: '',
    city: '',
    guest_count: 350,
    budget_min: 1000000,
    budget_max: 2500000,
    theme_preferences: 'Royal Heritage & Traditional Elegance',
    ceremony_types: 'Mehendi, Sangeet, Muhurtham, Reception',
    dietary_preferences: 'South Indian Vegetarian & Multi-Cuisine Fusion',
    notes: ''
  });

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/requirements/me');
      if (res.data.success) {
        const data = res.data.data || [];
        setRequirements(data);
        if (data.length === 0) {
          setShowForm(true);
        } else {
          // Pre-populate with latest requirement
          const latest = data[0];
          setFormData({
            event_date: latest.wedding_date ? latest.wedding_date.split('T')[0] : '',
            city: latest.location || latest.city || '',
            guest_count: latest.guest_count || 350,
            budget_min: latest.budget_min || Math.round(parseFloat(latest.estimated_budget || 1500000) * 0.7),
            budget_max: latest.budget_max || parseFloat(latest.estimated_budget || 2500000),
            theme_preferences: latest.special_preferences || latest.theme_preferences || 'Royal Heritage',
            ceremony_types: Array.isArray(latest.required_services) ? latest.required_services.join(', ') : (latest.required_services || 'Mehendi, Sangeet, Muhurtham, Reception'),
            dietary_preferences: latest.dietary_preferences || 'Multi-Cuisine Fusion',
            notes: latest.notes || ''
          });
        }
      }
    } catch (err) {
      console.error('Error loading requirements:', err);
      showToast('Could not load requirements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Unified Save: status can be 'DRAFT' or 'SUBMITTED'
  const handleSave = async (submitStatus = 'DRAFT') => {
    try {
      setSaving(true);
      const payload = {
        ...formData,
        wedding_date: formData.event_date,
        location: formData.city,
        estimated_budget: formData.budget_max,
        required_services: formData.ceremony_types,
        special_preferences: `${formData.theme_preferences} | ${formData.notes}`,
        status: submitStatus
      };

      let res;
      if (editingId) {
        res = await axios.put(`/api/requirements/${editingId}`, payload);
      } else {
        res = await axios.post('/api/requirements', payload);
      }

      if (res.data.success) {
        showToast(
          submitStatus === 'SUBMITTED'
            ? 'Requirements dispatched directly to your wedding planner! Location & details updated for review.'
            : 'Wedding requirements saved as draft successfully!',
          'success'
        );
        setShowForm(false);
        setEditingId(null);
        fetchRequirements();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save requirements', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Direct Send / Resend to Planner for an existing requirement card
  const handleSendToPlannerDirect = async (reqId) => {
    if (!reqId) return;
    try {
      setSending(true);
      const res = await axios.put(`/api/requirements/${reqId}/send-to-planner`);
      if (res.data.success) {
        showToast('Requirements dispatched to wedding planner for Accept / Decline!', 'success');
        setConfirmModalOpen(false);
        setSelectedReqForPlanner(null);
        fetchRequirements();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to dispatch to planner', 'error');
    } finally {
      setSending(false);
    }
  };

  const startEdit = (req) => {
    if (!req) return;
    setEditingId(req.id);
    setFormData({
      event_date: req.wedding_date ? String(req.wedding_date).split('T')[0] : '',
      city: req.location || req.city || '',
      guest_count: req.guest_count || 350,
      budget_min: req.budget_min || Math.round(parseFloat(req.estimated_budget || 1500000) * 0.7),
      budget_max: req.budget_max || parseFloat(req.estimated_budget || 2500000),
      theme_preferences: req.special_preferences ? req.special_preferences.split('|')[0]?.trim() : (req.theme_preferences || ''),
      ceremony_types: Array.isArray(req.required_services) ? req.required_services.join(', ') : (req.required_services || ''),
      dietary_preferences: req.dietary_preferences || '',
      notes: req.special_preferences && req.special_preferences.includes('|') ? req.special_preferences.split('|')[1]?.trim() : (req.notes || '')
    });
    setShowForm(true);
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  const activeReq = requirements[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(225, 29, 72, 0.05) 100%)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Wedding Requirements Sheet</h2>
            {user?.customer_id && (
              <span className="id-badge id-badge-cust">{formatCustomerId(user.customer_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Define your ceremony dates, destination preferences, guest capacity, and budget bracket. Save your changes as a draft or resend them directly to your wedding planner.
          </p>
        </div>

        {requirements.length > 0 && !showForm && (
          <button
            onClick={() => startEdit(activeReq || requirements[0])}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Edit3 size={16} /> Edit Requirements
          </button>
        )}
      </div>

      {/* Existing Requirements Presentation */}
      {!showForm && requirements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {requirements.map((req, idx) => {
            const isDraft = req.status === 'DRAFT';
            const isSubmitted = req.status === 'SUBMITTED' || req.status === 'UNDER_REVIEW';
            const isConverted = req.status === 'CONVERTED' || req.status === 'CONVERTED_TO_PROJECT';

            return (
              <div key={req.id || idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                        Wedding Specification #{req.id}
                      </span>
                      <Badge variant={isConverted ? 'success' : isSubmitted ? 'warning' : 'secondary'}>
                        {isDraft ? 'Draft Saved' : isSubmitted ? 'Sent to Planner • Under Review' : 'Project Formulated'}
                      </Badge>
                      {(req.status === 'RESENT' || req.verification_status === 'RESENT') && (
                        <span className="badge badge-warning" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', fontWeight: 700 }}>
                          🔄 Resent to Planner
                        </span>
                      )}
                      {req.verification_status === 'PENDING_PLANNER_VERIFICATION' && (
                        <span className="badge badge-warning" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> Pending Planner Verification
                        </span>
                      )}
                      {req.verification_status === 'VERIFIED' && (
                        <span className="badge badge-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Last updated: {formatDate(req.updated_at || req.created_at)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Wedding Budget</div>
                    <div style={{ fontWeight: 800, color: 'var(--status-success)', fontSize: '1.25rem' }}>
                      {formatCurrency(req.estimated_budget)}
                    </div>
                  </div>
                </div>

                {/* Re-Verification Banner */}
                {req.verification_status === 'PENDING_PLANNER_VERIFICATION' && (
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <ShieldCheck size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#d97706' }}>
                        Pending Lead Planner Re-Verification
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {req.change_summary || 'You recently updated requirement parameters (location, dates, or budget). Your lead planner must review and Accept or Decline these adjustments.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Declined Banner */}
                {req.verification_status === 'DECLINED' && (
                  <div style={{
                    padding: '0.85rem 1.15rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#b91c1c' }}>
                        Planner Declined Requested Adjustments
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {req.change_summary || 'The requested venue/location or date changes could not be accommodated. Click "Edit & Re-Save" to propose an alternative.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Workflow Status Banner */}
                {isDraft && (
                  <div style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid #EAB308',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <AlertCircle size={20} color="#EAB308" />
                      <div>
                        <strong>Draft Saved Locally</strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Your changes are saved as a draft. Click "Send to Wedding Planner" to submit the updated location and dates for review.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={sending}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={() => handleSendToPlannerDirect(req.id)}
                    >
                      <Send size={15} /> {sending ? 'Sending...' : 'Send to Wedding Planner'}
                    </button>
                  </div>
                )}

                {isSubmitted && (
                  <div style={{
                    padding: '0.9rem 1.25rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid var(--status-success)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <CheckCircle size={20} color="var(--status-success)" />
                    <div>
                      <strong style={{ fontSize: '0.92rem' }}>Successfully Sent to Wedding Planner!</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Your lead planner is reviewing dates, budget allocations, and inquiring with artisan vendors. You can track progress under "Vendor Selection".
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  background: 'var(--bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Ceremony Date:</span>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {formatDate(req.wedding_date)}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Destination / City:</span>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {req.location || 'Bangalore'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Target Guest Count:</span>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {req.guest_count} Attendees
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Theme / Aesthetics:</span>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
                      {req.special_preferences || 'Custom Theme'}
                    </div>
                  </div>
                </div>

                {req.required_services && (
                  <div style={{ fontSize: '0.88rem' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Rituals & Services Requested:</strong>{' '}
                    <span>
                      {Array.isArray(req.required_services) ? req.required_services.join(', ') : req.required_services}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => startEdit(req)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                  >
                    <Edit3 size={14} /> Edit Destination & Requirements
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={sending}
                    onClick={() => handleSendToPlannerDirect(req.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                  >
                    <Send size={14} /> {isDraft ? 'Send to Planner' : 'Resend to Planner for Approval'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Submission Form */}
      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave('SUBMITTED'); }} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
              {editingId ? 'Edit Wedding Requirements' : 'Specify Your Dream Wedding Vision'}
            </h3>
            {requirements.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Proposed Wedding Date *</label>
              <input
                type="date"
                name="event_date"
                className="form-control"
                required
                value={formData.event_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Destination / City *</label>
              <input
                type="text"
                name="city"
                className="form-control"
                required
                placeholder="e.g. Bangalore, Chennai, Udaipur"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guest Capacity *</label>
              <input
                type="number"
                name="guest_count"
                className="form-control"
                min="10"
                max="10000"
                required
                value={formData.guest_count}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Maximum Budget (₹) *</label>
              <input
                type="number"
                name="budget_max"
                className="form-control"
                step="50000"
                required
                value={formData.budget_max}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Ceremonies & Rituals *</label>
              <input
                type="text"
                name="ceremony_types"
                className="form-control"
                required
                placeholder="e.g. Mehendi, Sangeet, Muhurtham, Reception"
                value={formData.ceremony_types}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Theme & Aesthetic Preferences</label>
              <input
                type="text"
                name="theme_preferences"
                className="form-control"
                placeholder="e.g. Royal South Indian Silk & Jasmine, Pastel Floral Boho, Mandap Luxury"
                value={formData.theme_preferences}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Special Preferences & Specific Inquiries</label>
              <textarea
                name="notes"
                className="form-control"
                rows={3}
                placeholder="Any specific florist, photography style, bridal entry concept, or dietary requirements..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Dual Action Buttons: Save Draft AND Send to Planner */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '1rem',
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving || sending}
              onClick={() => handleSave(editingId ? 'RESENT' : 'DRAFT')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : (editingId ? 'Save & Notify Planner' : 'Save Draft')}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={saving || sending || !formData.event_date || !formData.city}
              onClick={() => handleSave(editingId ? 'RESENT' : 'SUBMITTED')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={16} />
              {sending ? 'Sending...' : (editingId ? 'Resend to Wedding Planner' : 'Save & Send to Wedding Planner')}
            </button>
          </div>
        </form>
      )}

      {/* Confirm Send to Planner Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => !sending && setConfirmModalOpen(false)}
        title="Forward Requirements to Wedding Planner"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(225, 29, 72, 0.08)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.3rem' }}>
              Ready to Send to Lead Planner
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              Your requirements will be submitted to your assigned wedding concierge team. They will evaluate your ceremonial dates, curate verified vendor quotes, and formulate your vendor arrangement proposal.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={sending}
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={sending}
              onClick={() => {
                if (selectedReqForPlanner) {
                  handleSendToPlannerConfirm();
                } else if (requirements.length > 0) {
                  setSelectedReqForPlanner(requirements[0]);
                  handleSendToPlannerConfirm();
                } else {
                  setConfirmModalOpen(false);
                }
              }}
            >
              {sending ? 'Sending...' : 'Confirm & Dispatch to Planner'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
