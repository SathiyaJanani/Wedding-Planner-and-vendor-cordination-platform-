import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import RecentlyAccessedTray from '../../components/RecentlyAccessedTray';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  Calendar, CheckCircle, Clock, DollarSign, Star, AlertCircle,
  ArrowRight, XCircle, Check, Send, Store
} from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Decline Modal State
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profRes, reqRes, schedRes, revRes] = await Promise.allSettled([
        axios.get('/api/vendors/profile/me'),
        axios.get('/api/vendor-requests'),
        axios.get('/api/schedules/my-schedule'),
        axios.get('/api/reviews/vendor/my-reviews')
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.data.success) {
        setProfile(profRes.value.data.data);
      }
      if (reqRes.status === 'fulfilled' && reqRes.value.data.success) {
        setRequests(reqRes.value.data.data || []);
      }
      if (schedRes.status === 'fulfilled' && schedRes.value.data.success) {
        setSchedule(schedRes.value.data.data || []);
      }
      if (revRes.status === 'fulfilled' && revRes.value.data.success) {
        setReviews(revRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error loading vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (reqId) => {
    try {
      setActionLoading(true);
      const res = await axios.put(`/api/vendor-requests/${reqId}/accept`);
      if (res.data.success) {
        showToast('Booking request accepted successfully!', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    if (!declineReason.trim()) {
      showToast('Please provide a reason for declining.', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const res = await axios.put(`/api/vendor-requests/${selectedRequest.id}/decline`, {
        decline_reason: declineReason
      });
      if (res.data.success) {
        showToast('Request declined with reason recorded.', 'info');
        setDeclineModalOpen(false);
        setSelectedRequest(null);
        setDeclineReason('');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const acceptedRequests = requests.filter(r => r.status === 'ACCEPTED');
  const totalEarnings = acceptedRequests.reduce((sum, r) => sum + (parseFloat(r.proposed_price) || 0), 0);
  const avgRating = profile?.rating || (reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner / Welcome Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.12) 100%)',
        border: '1px solid var(--border-color)',
        padding: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {profile?.business_name || user?.full_name}
              </span>
              <Badge variant="primary">{profile?.category_name || 'Vendor Partner'}</Badge>
              {profile?.is_verified && <Badge variant="success">Verified Partner</Badge>}
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Welcome to your Vendor Portal. Respond to planner requests, manage availability, and track your wedding bookings.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/vendor/availability" className="btn btn-secondary btn-sm">
              <Calendar size={16} /> Manage Availability
            </Link>
            <Link to="/vendor/pending-requests" className="btn btn-primary btn-sm">
              <AlertCircle size={16} /> Pending Requests ({pendingRequests.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Recently Accessed Section */}
      <RecentlyAccessedTray limit={4} />

      {/* KPI Cards */}
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting your response"
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Accepted Bookings"
          value={acceptedRequests.length}
          subtitle="Confirmed engagements"
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Projected Earnings"
          value={`₹${totalEarnings.toLocaleString('en-IN')}`}
          subtitle="From accepted contracts"
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Average Rating"
          value={`★ ${avgRating}`}
          subtitle={`${reviews.length} customer reviews`}
          icon={Star}
          color="secondary"
        />
      </div>

      {/* Main Section: Actionable Pending Requests */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Action Required: Pending Requests</h3>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Review proposed dates and budget. Accept to lock slot or decline with mandatory feedback.
            </p>
          </div>
          <Link to="/vendor/pending-requests" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="All Caught Up!"
            description="You have no pending booking requests from wedding planners right now."
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Wedding Project</th>
                  <th>Planner</th>
                  <th>Event Date</th>
                  <th>Time Slot</th>
                  <th>Offered Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.slice(0, 5).map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {req.request_code || `#REQ-${req.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.project_title || 'Wedding Celebration'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {req.service_name || 'Package Service'}
                      </div>
                    </td>
                    <td>{req.planner_name || 'Official Planner'}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(req.event_date).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>{req.start_time?.slice(0, 5)} - {req.end_time?.slice(0, 5)}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                        ₹{parseFloat(req.proposed_price || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading}
                          onClick={() => handleAccept(req.id)}
                          title="Accept Request"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={actionLoading}
                          onClick={() => {
                            setSelectedRequest(req);
                            setDeclineReason('');
                            setDeclineModalOpen(true);
                          }}
                          title="Decline with Reason"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--status-danger)' }}
                        >
                          <XCircle size={14} /> Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Layout: Upcoming Schedule & Recent Reviews */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Engagements */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Upcoming Engagements</h4>
            <Link to="/vendor/schedule" className="btn btn-ghost btn-sm">Full Calendar</Link>
          </div>
          {acceptedRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
              No confirmed bookings on your schedule yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {acceptedRequests.slice(0, 4).map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.project_title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Planner: {item.planner_name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {new Date(item.event_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Reviews Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Client Testimonials</h4>
            <Link to="/vendor/reviews" className="btn btn-ghost btn-sm">All Reviews</Link>
          </div>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
              No reviews received yet. Deliver great events to build your reputation!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev.id} style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rev.customer_name || 'Couple'}</span>
                    <span style={{ color: '#EAB308', fontWeight: 700, fontSize: '0.85rem' }}>
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Decline Reason Modal */}
      <Modal
        isOpen={declineModalOpen}
        onClose={() => !actionLoading && setDeclineModalOpen(false)}
        title="Decline Booking Request"
      >
        <form onSubmit={handleDeclineSubmit}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--status-danger)', marginBottom: '0.25rem' }}>
              Declining: {selectedRequest?.request_code} ({selectedRequest?.project_title})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Date: {selectedRequest?.event_date} | Offered: ₹{parseFloat(selectedRequest?.proposed_price || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Reason for Declining <span style={{ color: 'var(--status-danger)' }}>* (Mandatory)</span>
            </label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="e.g., Already scheduled for an off-site wedding, team capacity reached, or conflict with event timings..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              This explanation will be recorded and shared with the wedding planner so they can arrange an alternative.
            </small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={actionLoading}
              onClick={() => setDeclineModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading || !declineReason.trim()}
              style={{ background: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}
            >
              {actionLoading ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
