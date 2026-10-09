import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatCustomerId, formatVendorId, formatCurrency, formatDate } from '../../utils/formatters';
import {
  Send, Check, XCircle, Clock, Search, Filter, ArrowUpDown,
  Eye, Calendar, User, DollarSign, MapPin, Sparkles
} from 'lucide-react';

export default function VendorBookingRequests() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  
  // Tab Filter from URL or default 'ALL'
  const initialStatus = searchParams.get('status') || 'ALL';
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount_high, amount_low, date_asc

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Decline Modal State
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeDetailReq, setActiveDetailReq] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus && ['ALL', 'PENDING', 'ACCEPTED', 'DECLINED'].includes(urlStatus)) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams]);

  const handleTabChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    if (newStatus === 'ALL') {
      searchParams.delete('status');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ status: newStatus });
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendor-requests');
      if (res.data.success) {
        setRequests(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      showToast('Could not load booking requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (reqId) => {
    if (!window.confirm('Accept this wedding booking request? This locks the ceremonial date in your schedule.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await axios.put(`/api/vendor-requests/${reqId}/accept`);
      if (res.data.success) {
        showToast('Booking request accepted successfully! Slot locked in your calendar.', 'success');
        if (detailModalOpen) setDetailModalOpen(false);
        fetchRequests();
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
      showToast('A decline reason is mandatory.', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const res = await axios.put(`/api/vendor-requests/${selectedRequest.id}/decline`, {
        decline_reason: declineReason.trim()
      });
      if (res.data.success) {
        showToast('Request declined and lead wedding planner notified.', 'info');
        setDeclineModalOpen(false);
        setSelectedRequest(null);
        setDeclineReason('');
        if (detailModalOpen) setDetailModalOpen(false);
        fetchRequests();
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

  // Filter logic
  const filtered = requests.filter(r => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (r.project_title || '').toLowerCase().includes(term) ||
      (r.planner_name || '').toLowerCase().includes(term) ||
      (r.customer_name || '').toLowerCase().includes(term) ||
      (r.service_name || '').toLowerCase().includes(term) ||
      (r.request_code || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || b.event_date) - new Date(a.created_at || a.event_date);
    if (sortBy === 'oldest') return new Date(a.created_at || a.event_date) - new Date(b.created_at || b.event_date);
    if (sortBy === 'amount_high') return parseFloat(b.proposed_price || 0) - parseFloat(a.proposed_price || 0);
    if (sortBy === 'amount_low') return parseFloat(a.proposed_price || 0) - parseFloat(b.proposed_price || 0);
    if (sortBy === 'date_asc') return new Date(a.event_date) - new Date(b.event_date);
    return 0;
  });

  // Pagination slice
  const totalItems = sorted.length;
  const paginatedRequests = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Response</Badge>;
      case 'ACCEPTED':
        return <Badge variant="success">Accepted</Badge>;
      case 'DECLINED':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const acceptedCount = requests.filter(r => r.status === 'ACCEPTED').length;
  const declinedCount = requests.filter(r => r.status === 'DECLINED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Vendor Booking Requests</h2>
            {user?.vendor_id && (
              <span className="id-badge id-badge-vnd">{formatVendorId(user.vendor_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage incoming ceremony inquiries, review event timelines, lock dates, and monitor confirmed contracts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Awaiting Action</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-warning)' }}>{pendingCount}</div>
          </div>
          <div style={{ background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Confirmed</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-success)' }}>{acceptedCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search / Sort Controls Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Luxury Tabs */}
        <div className="luxury-tabs">
          <button
            type="button"
            className={`luxury-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => handleTabChange('ALL')}
          >
            <span>All Requests</span>
            <span className="luxury-tab-count">{requests.length}</span>
          </button>

          <button
            type="button"
            className={`luxury-tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => handleTabChange('PENDING')}
          >
            <span>Pending Requests</span>
            {pendingCount > 0 && <span className="luxury-tab-count">{pendingCount}</span>}
          </button>

          <button
            type="button"
            className={`luxury-tab-btn ${statusFilter === 'ACCEPTED' ? 'active' : ''}`}
            onClick={() => handleTabChange('ACCEPTED')}
          >
            <span>Accepted Bookings</span>
            <span className="luxury-tab-count">{acceptedCount}</span>
          </button>

          <button
            type="button"
            className={`luxury-tab-btn ${statusFilter === 'DECLINED' ? 'active' : ''}`}
            onClick={() => handleTabChange('DECLINED')}
          >
            <span>Declined Requests</span>
            <span className="luxury-tab-count">{declinedCount}</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search project, couple, code..."
              style={{ paddingLeft: '2.4rem' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 170, fontSize: '0.86rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest Requests</option>
              <option value="oldest">Oldest Requests</option>
              <option value="date_asc">Event Date (Upcoming)</option>
              <option value="amount_high">Offered Amount (High to Low)</option>
              <option value="amount_low">Offered Amount (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card" style={{ padding: 0 }}>
        {paginatedRequests.length === 0 ? (
          <div style={{ padding: '2rem' }}>
            <EmptyState
              icon={Send}
              title="No Requests Found"
              description={`There are no wedding booking requests in "${statusFilter}" matching your search.`}
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request / Code</th>
                  <th>Wedding Project & Couple</th>
                  <th>Planner Lead</th>
                  <th>Event Date & Slot</th>
                  <th>Offered Payout</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {req.request_code || `#REQ-${req.id}`}
                        </span>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Created: {formatDate(req.created_at)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{req.project_title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <User size={13} />
                        <span>{req.customer_name || 'Wedding Couple'}</span>
                        {req.customer_id && (
                          <span className="id-badge id-badge-cust" style={{ fontSize: '0.68rem', padding: '1px 4px' }}>
                            {formatCustomerId(req.customer_id)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '0.15rem' }}>
                        Service: {req.service_name || 'Wedding Ceremony Package'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{req.planner_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{req.planner_agency}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} color="var(--primary)" />
                        {formatDate(req.event_date)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: '0.15rem' }}>
                        <Clock size={12} />
                        {req.start_time?.slice(0, 5)} - {req.end_time?.slice(0, 5)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--status-success)', fontSize: '1.05rem' }}>
                        {formatCurrency(req.proposed_price)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Contract Rate</div>
                    </td>

                    <td>{getStatusBadge(req.status)}</td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setActiveDetailReq(req);
                            setDetailModalOpen(true);
                          }}
                          title="View Request Dossier"
                        >
                          <Eye size={14} /> View
                        </button>

                        {req.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={actionLoading}
                              onClick={() => handleAccept(req.id)}
                              title="Accept Booking Request"
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={actionLoading}
                              onClick={() => {
                                setSelectedRequest(req);
                                setDeclineReason('');
                                setDeclineModalOpen(true);
                              }}
                              title="Decline Booking Request"
                              style={{ color: 'var(--status-danger)' }}
                            >
                              <XCircle size={14} /> Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Request Dossier Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Wedding Booking Request Dossier"
      >
        {activeDetailReq && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(225, 29, 72, 0.08) 100%)',
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{activeDetailReq.project_title}</h3>
                  {getStatusBadge(activeDetailReq.status)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Reference: <strong>{activeDetailReq.request_code}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offered Contract Value</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-success)' }}>
                  {formatCurrency(activeDetailReq.proposed_price)}
                </div>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Ceremony Date:</span>
                <div style={{ fontWeight: 700 }}>{formatDate(activeDetailReq.event_date)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Required Service Slot:</span>
                <div style={{ fontWeight: 700 }}>{activeDetailReq.start_time?.slice(0, 5)} - {activeDetailReq.end_time?.slice(0, 5)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Wedding Couple:</span>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {activeDetailReq.customer_name || 'Client Couple'}
                  {activeDetailReq.customer_id && (
                    <span className="id-badge id-badge-cust">{formatCustomerId(activeDetailReq.customer_id)}</span>
                  )}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Coordinating Planner:</span>
                <div style={{ fontWeight: 700 }}>{activeDetailReq.planner_name} ({activeDetailReq.planner_agency})</div>
              </div>
            </div>

            {/* Special Instructions & Notes */}
            {activeDetailReq.notes && (
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Ceremony Notes & Planner Instructions:</label>
                <div style={{
                  padding: '0.9rem 1rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.6
                }}>
                  "{activeDetailReq.notes}"
                </div>
              </div>
            )}

            {/* Decline reason if declined */}
            {activeDetailReq.status === 'DECLINED' && activeDetailReq.decline_reason && (
              <div style={{
                padding: '0.85rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--status-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                color: 'var(--status-danger)'
              }}>
                <strong>Recorded Decline Reason:</strong> {activeDetailReq.decline_reason}
              </div>
            )}

            {/* Footer Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetailModalOpen(false)}
              >
                Close
              </button>

              {activeDetailReq.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={actionLoading}
                    onClick={() => {
                      setSelectedRequest(activeDetailReq);
                      setDeclineReason('');
                      setDeclineModalOpen(true);
                    }}
                    style={{ color: 'var(--status-danger)' }}
                  >
                    <XCircle size={16} /> Decline Request
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={actionLoading}
                    onClick={() => handleAccept(activeDetailReq.id)}
                  >
                    <Check size={16} /> Accept & Lock Slot
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Mandatory Decline Reason Modal */}
      <Modal
        isOpen={declineModalOpen}
        onClose={() => !actionLoading && setDeclineModalOpen(false)}
        title="Decline Booking Request"
      >
        <form onSubmit={handleDeclineSubmit}>
          <div style={{ marginBottom: '1rem', padding: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--status-danger)', marginBottom: '0.25rem' }}>
              Decline {selectedRequest?.request_code} ({selectedRequest?.project_title})
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Date: {formatDate(selectedRequest?.event_date)} | Offered: {formatCurrency(selectedRequest?.proposed_price)}
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
              placeholder="e.g., Conflict with previous booking, venue beyond operational radius, or ceremony scope unavailable..."
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
              {actionLoading ? 'Submitting...' : 'Confirm Decline'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
