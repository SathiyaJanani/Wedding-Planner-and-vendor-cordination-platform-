import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatCustomerId, formatVendorId, formatCurrency } from '../../utils/formatters';
import {
  HeartHandshake, Phone, Mail, Award, MessageSquare, ShieldCheck,
  Sparkles, Star, UserPlus, CheckCircle, Send
} from 'lucide-react';

export default function MyPlanner() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [planner, setPlanner] = useState(null);
  const [availablePlanners, setAvailablePlanners] = useState([]);

  // Planner Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedPlannerForRequest, setSelectedPlannerForRequest] = useState(null);
  const [weddingVision, setWeddingVision] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      const [profRes, availRes] = await Promise.all([
        axios.get('/api/customers/me'),
        axios.get('/api/customers/planners/available').catch(() => ({ data: { data: [] } }))
      ]);

      if (profRes.data.success && profRes.data.data) {
        const c = profRes.data.data;
        if (c.planner_id || c.assigned_planner_name) {
          setPlanner({
            id: c.planner_id || 1,
            agency_name: c.assigned_planner_name || 'Vows & Veils Premier Planning Concierge',
            planner_name: c.planner_contact_name || c.planner_name || 'Priya Sharma',
            email: c.planner_email || 'planner@vowsandveils.com',
            phone: c.planner_phone || '+91 98765 43210',
            bio: c.planner_bio || 'Dedicated senior wedding artisan specializing in grand celebrations, custom mandap aesthetics, and seamless vendor coordination.',
            experience_years: c.planner_experience || 10,
            rating: '4.9',
            completed_weddings: 120
          });
        } else {
          setPlanner(null);
        }
      }

      if (availRes.data?.success) {
        setAvailablePlanners(availRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading planner:', err);
      showToast('Could not load planner details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPlannerRequest = async (e) => {
    e.preventDefault();
    if (!selectedPlannerForRequest?.id) return;

    try {
      setSubmittingRequest(true);
      const res = await axios.post('/api/customers/request-planner', {
        planner_id: selectedPlannerForRequest.id,
        wedding_vision: weddingVision.trim()
      });

      if (res.data.success) {
        showToast('Planner engagement request sent successfully!', 'success');
        setRequestModalOpen(false);
        setWeddingVision('');
        fetchPlannerData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request planner', 'error');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

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
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Lead Wedding Planner Portal</h2>
            {user?.customer_id && (
              <span className="id-badge id-badge-cust">{formatCustomerId(user.customer_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Your dedicated coordinator orchestrates quotes, manages vendor negotiations, and ensures seamless ceremony timelines.
          </p>
        </div>

        {planner && (
          <Badge variant="success">
            <ShieldCheck size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
            Active Concierge Assigned
          </Badge>
        )}
      </div>

      {/* Case 1: Assigned Planner Dossier */}
      {planner ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Card */}
          <div className="card" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(201, 149, 107, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-gold) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 800,
              boxShadow: '0 6px 18px rgba(225, 29, 72, 0.3)'
            }}>
              {planner.planner_name.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{planner.planner_name}</h3>
                <Badge variant="success">
                  <ShieldCheck size={13} style={{ marginRight: 3, verticalAlign: -2 }} /> Senior Certified
                </Badge>
              </div>

              <div style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.25rem' }}>
                {planner.agency_name}
              </div>

              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                {planner.bio}
              </p>
            </div>
          </div>

          {/* Contact & Experience Grid */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700 }}>
              Credentials & Direct Coordination
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Award size={16} color="var(--primary)" /> Industry Experience
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', marginTop: '0.35rem' }}>
                  {planner.experience_years}+ Years
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Sparkles size={16} color="var(--primary)" /> Curated Weddings
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', marginTop: '0.35rem' }}>
                  {planner.completed_weddings}+ Ceremonies
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Phone size={16} color="var(--primary)" /> Direct Mobile
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '0.35rem' }}>
                  {planner.phone}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Mail size={16} color="var(--primary)" /> Concierge Email
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.35rem' }}>
                  {planner.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ready to review your vendor arrangement?
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  to="/customer/messages"
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <MessageSquare size={16} /> Open Direct Chat
                </Link>
                <Link
                  to="/customer/vendor-selection"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Sparkles size={16} /> Review Arranged Vendors
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Case 2: No Planner Assigned Yet - Browse Available Planners */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{
            padding: '1.5rem',
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid #EAB308',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              Select & Request Your Wedding Planner
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Choose from our verified luxury wedding planning agencies below to oversee your wedding arrangements, vendor contracts, and ceremony itineraries.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {availablePlanners.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.4rem'
                    }}>
                      {p.full_name?.charAt(0) || 'P'}
                    </div>

                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#EAB308', fontWeight: 700, fontSize: '0.9rem' }}>
                      <Star size={15} fill="#EAB308" /> {p.rating || '4.9'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800 }}>
                    {p.full_name}
                  </h3>
                  <div style={{ fontSize: '0.92rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                    {p.agency_name}
                  </div>

                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {p.bio || 'Curating bespoke ceremonial experiences with artisan decor, luxury logistics, and premier vendor coordination.'}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'var(--bg-subtle)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}>
                    <div>Experience: <strong>{p.experience_years}+ Years</strong></div>
                    <div>Weddings: <strong>{p.completed_weddings || 80}+</strong></div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => {
                      setSelectedPlannerForRequest(p);
                      setWeddingVision('');
                      setRequestModalOpen(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <UserPlus size={16} /> Send Engagement Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => !submittingRequest && setRequestModalOpen(false)}
        title="Send Wedding Planner Engagement Request"
      >
        <form onSubmit={handleSendPlannerRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedPlannerForRequest && (
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{selectedPlannerForRequest.full_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                {selectedPlannerForRequest.agency_name}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Brief Wedding Vision & Requests</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="e.g., We are planning a 3-day royal destination celebration in Bangalore for 400 guests. Looking for custom mandap decor, premium photography, and seamless logistics."
              value={weddingVision}
              onChange={(e) => setWeddingVision(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={submittingRequest}
              onClick={() => setRequestModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingRequest}
            >
              {submittingRequest ? 'Submitting...' : 'Dispatch Request to Planner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
