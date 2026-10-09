import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { AlertCircle, Check, XCircle, Clock, Calendar, DollarSign, User } from 'lucide-react';

export default function VendorPendingRequests() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [pendingList, setPendingList] = useState([]);

  // Decline Modal
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendor-requests?status=PENDING');
      if (res.data.success) {
        setPendingList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      showToast('Could not load pending requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      setActionLoading(true);
      const res = await axios.put(`/api/vendor-requests/${id}/accept`);
      if (res.data.success) {
        showToast('Request accepted! Availability updated to BOOKED.', 'success');
        fetchPending();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    if (!declineReason.trim()) {
      showToast('A decline reason is mandatory.', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const res = await axios.put(`/api/vendor-requests/${selectedReq.id}/decline`, {
        decline_reason: declineReason
      });
      if (res.data.success) {
        showToast('Request declined and planner notified.', 'info');
        setDeclineModalOpen(false);
        setSelectedReq(null);
        setDeclineReason('');
        fetchPending();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Pending Booking Requests</h2>
            <Badge variant="warning">{pendingList.length} Action Needed</Badge>
          </div>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Respond promptly to secure wedding arrangements. Declining requires an explanation for the wedding planner.
          </p>
        </div>
      </div>

      {pendingList.length === 0 ? (
        <EmptyState
          icon={Check}
          title="No Pending Inquiries"
          description="You are currently completely up to date. You will be notified when a wedding planner sends a new engagement request."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {pendingList.map((req) => (
            <div key={req.id} className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: '4px solid #EAB308'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                    {req.request_code || `#REQ-${req.id}`}
                  </span>
                  <Badge variant="warning">Awaiting Decision</Badge>
                </div>

                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
                  {req.project_title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Requested Service: <strong>{req.service_name || 'Wedding Package'}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <Calendar size={15} color="var(--primary)" />
                    <span>
                      Date: <strong>{new Date(req.event_date).toLocaleDateString('en-IN', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                      })}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <Clock size={15} color="var(--primary)" />
                    <span>Slot: <strong>{req.start_time?.slice(0, 5)} - {req.end_time?.slice(0, 5)}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <User size={15} color="var(--primary)" />
                    <span>Planner: <strong>{req.planner_name}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <DollarSign size={15} color="var(--status-success)" />
                    <span>Offered: <strong style={{ color: 'var(--status-success)' }}>₹{parseFloat(req.proposed_price || 0).toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                {req.notes && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Notes: "{req.notes}"
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                  disabled={actionLoading}
                  onClick={() => handleAccept(req.id)}
                >
                  <Check size={16} /> Accept
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', color: 'var(--status-danger)' }}
                  disabled={actionLoading}
                  onClick={() => {
                    setSelectedReq(req);
                    setDeclineReason('');
                    setDeclineModalOpen(true);
                  }}
                >
                  <XCircle size={16} /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline Reason Modal */}
      <Modal
        isOpen={declineModalOpen}
        onClose={() => !actionLoading && setDeclineModalOpen(false)}
        title="Decline Booking Request"
      >
        <form onSubmit={handleDeclineSubmit}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--status-danger)', marginBottom: '0.25rem' }}>
              Decline {selectedReq?.request_code} ({selectedReq?.project_title})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Offered: ₹{parseFloat(selectedReq?.proposed_price || 0).toLocaleString('en-IN')} on {selectedReq?.event_date}
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
              placeholder="State clear reason (e.g. Schedule already committed, equipment under maintenance, out of service radius)..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
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
