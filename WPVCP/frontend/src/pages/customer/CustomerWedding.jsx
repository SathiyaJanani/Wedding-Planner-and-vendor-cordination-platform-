import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  Sparkles, Calendar, MapPin, DollarSign, Users, HeartHandshake,
  Clock, CheckSquare, CreditCard, FolderOpen, ArrowRight, ShieldCheck
} from 'lucide-react';
import WeddingHallMap from '../../components/WeddingHallMap';
import { isWeddingHallVendor } from '../../utils/weddingHallHelper';

export default function CustomerWedding() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [booking, setBooking] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchWeddingOverview();
  }, []);

  const fetchWeddingOverview = async () => {
    try {
      setLoading(true);
      const [projRes, bookRes] = await Promise.allSettled([
        axios.get('/api/projects/customer/active'),
        axios.get('/api/bookings/customer/active')
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.data.success) {
        setProject(projRes.value.data.data);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value.data.success) {
        setBooking(bookRes.value.data.data);
      }
    } catch (err) {
      console.error('Error loading wedding overview:', err);
      showToast('Could not load wedding project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerVerify = async () => {
    if (!project?.id) return;
    try {
      setVerifying(true);
      const res = await axios.put(`/api/projects/${project.id}/customer-verify`);
      if (res.data.success) {
        showToast(res.data.message || 'Project modifications verified and confirmed successfully!', 'success');
        fetchWeddingOverview();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to verify project changes', 'error');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  if (!project) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No Wedding Project Created Yet"
        description="Submit your wedding requirements so our lead wedding planners can structure your official wedding project."
        actionText="Submit Wedding Requirements"
        onAction={() => window.location.href = '/customer/requirements'}
      />
    );
  }

  const services = booking?.services || [];
  const weddingHallService = services.find(s => isWeddingHallVendor(s));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Verification Notice Banner */}
      {project.verification_status === 'PENDING_CUSTOMER_VERIFICATION' && (
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%)',
          border: '1.5px solid #f59e0b',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldCheck size={28} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '1rem', color: '#b45309' }}>
                Planner / Administrator Project Modifications Awaiting Your Verification
              </strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {project.change_summary || 'Your lead wedding planner made modifications to the budget, ceremony dates, or guest allocations.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-warning"
            disabled={verifying}
            onClick={handleCustomerVerify}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <ShieldCheck size={16} />
            <span>{verifying ? 'Confirming...' : 'Verify & Accept Project Changes'}</span>
          </button>
        </div>
      )}

      {/* Hero Wedding Project Card */}
      <div className="card" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.15) 100%)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{project.title}</h2>
              <Badge variant="primary">{project.status?.replace('_', ' ')}</Badge>
              {project.verification_status === 'PENDING_CUSTOMER_VERIFICATION' && (
                <span className="badge badge-warning" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} /> Pending Your Verification
                </span>
              )}
              {project.verification_status === 'VERIFIED' && (
                <span className="badge badge-success" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={12} /> Project Verified
                </span>
              )}
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {project.description || 'Curated luxury wedding celebration managed through the Vows & Veils Concierge.'}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Budget</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>
              ₹{parseFloat(project.estimated_budget || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wedding Date</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                {project.wedding_date ? new Date(project.wedding_date).toLocaleDateString('en-IN', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }) : 'TBD'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location / Venue</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                {project.venue || project.city || 'TBD'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Guest Count</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                {project.guest_count ? `${project.guest_count} Attendees` : '300 Guests'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HeartHandshake size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead Planner</div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                {project.planner_name || 'Vows & Veils Concierge'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arranged Vendors Summary */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Curated Vendor Team</h3>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Vendors selected by your planner. You can inspect quotes and approve them.
            </p>
          </div>
          <Link to="/customer/vendor-selection" className="btn btn-primary btn-sm">
            View Selection Suite <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </Link>
        </div>

        {services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0 }}>Your planner is currently verifying vendor availability and negotiating quotes.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Vendor Partner</th>
                  <th>Service Details</th>
                  <th>Agreed Fee</th>
                  <th>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.category_name || 'Service'}</td>
                    <td style={{ fontWeight: 600 }}>{s.vendor_name || s.business_name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.service_name || 'Ceremony package'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                      ₹{parseFloat(s.price || s.proposed_price || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <Badge variant={booking?.status === 'CONFIRMED' ? 'success' : 'warning'}>
                        {booking?.status?.replace('_', ' ') || 'PROPOSED'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wedding Hall Location Map - Strictly Wedding Hall Only */}
      {weddingHallService && (
        <WeddingHallMap vendor={weddingHallService} title="Booked Wedding Hall Location" />
      )}

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Link to="/customer/schedule" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Clock size={24} color="var(--primary)" />
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Wedding Schedule</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track ceremony day timings from morning rituals to reception.
          </p>
        </Link>

        <Link to="/customer/budget" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <DollarSign size={24} color="var(--status-success)" />
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Budget Tracker</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time breakdown of expenses across venue, decor, photography.
          </p>
        </Link>

        <Link to="/customer/payments" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <CreditCard size={24} color="#3B82F6" />
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Milestone Payments</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Pay Advance (25%), Second (50%), and Final (25%) installments securely.
          </p>
        </Link>

        <Link to="/customer/documents" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <FolderOpen size={24} color="#8B5CF6" />
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Contracts & Documents</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Review vendor service level agreements, floor plans, and contracts.
          </p>
        </Link>
      </div>
    </div>
  );
}
