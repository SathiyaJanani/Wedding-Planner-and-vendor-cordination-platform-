import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { FileText, ArrowRight, CheckCircle, Check, X, XCircle, Calendar, MapPin, DollarSign, Users, Sparkles, AlertCircle, Search, ArrowUpDown } from 'lucide-react';

export default function CustomerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalItems, setTotalItems] = useState(0);

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const toast = useToast();

  const [projectData, setProjectData] = useState({
    title: '',
    venue_name: '',
    venue_address: '',
    city: 'Bangalore',
    total_budget: 1000000
  });

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter, sortBy, currentPage, pageSize]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/requirements', {
        params: {
          search,
          status: statusFilter,
          sort_by: sortBy,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res.data.success) {
        setRequests(res.data.data);
        setTotalItems(res.data.total || res.data.pagination?.totalItems || res.data.data.length);
      }
    } catch (e) {
      toast.error('Failed to load customer requirements.');
    } finally {
      setLoading(false);
    }
  };

  const openConvertModal = (req) => {
    setSelectedReq(req);
    setProjectData({
      title: `${req.customer_name} & ${req.partner_name || 'Partner'} Wedding Celebration`,
      venue_name: 'The Grand Royal Palace & Convention',
      venue_address: req.location || 'Bangalore',
      city: req.location || 'Bangalore',
      total_budget: req.estimated_budget
    });
    setConvertModalOpen(true);
  };

  const openDeclineModal = (req) => {
    setSelectedReq(req);
    setDeclineReason('');
    setDeclineModalOpen(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await axios.post(`/api/requirements/${selectedReq.id}/convert`, projectData);
      if (res.data.success) {
        toast.success(`Request accepted and converted to Project ${res.data.project_code}!`);
        setConvertModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert to project.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await axios.put(`/api/requirements/${selectedReq.id}/decline`, {
        decline_reason: declineReason
      });
      if (res.data.success) {
        toast.success('Customer request declined. Customer has been notified.');
        setDeclineModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
          Customer Wedding Requests
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Review submitted requirements from couples. Accept them to convert into live projects or decline them with a response note.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer, partner, location..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '100%' }}
          >
            <option value="newest">🕒 Newest Submissions</option>
            <option value="date_asc">📅 Target Date (Soonest)</option>
            <option value="date_desc">📅 Target Date (Latest)</option>
            <option value="budget_desc">💰 Budget: High to Low</option>
            <option value="budget_asc">💰 Budget: Low to High</option>
            <option value="name_asc">🔤 Customer Name (A - Z)</option>
          </select>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Status:
          </span>
          {[
            { key: '', label: 'All Requests' },
            { key: 'SUBMITTED', label: '📥 Submitted' },
            { key: 'CONVERTED', label: '✅ Converted to Project' },
            { key: 'DRAFT', label: '📝 Draft' },
            { key: 'DECLINED', label: '❌ Declined' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`badge ${statusFilter === tab.key ? 'badge-primary' : 'badge-neutral'}`}
              style={{ cursor: 'pointer', padding: '0.4rem 0.75rem', fontSize: '0.78rem', border: 'none' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : requests.length === 0 ? (
          <EmptyState title="No customer requirements submitted yet" message="New wedding submissions from couples will appear here." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Submission ID</th>
                  <th>Customer & Partner</th>
                  <th>Target Date</th>
                  <th>Location</th>
                  <th>Estimated Budget</th>
                  <th>Required Services</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      #REQ-{r.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.customer_name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Partner: {r.partner_name || 'Not specified'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.wedding_date}</td>
                    <td>{r.location}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(r.estimated_budget).toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '240px' }}>
                        {Array.isArray(r.required_services) && r.required_services.map((s, idx) => (
                          <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge status={r.status === 'REJECTED' ? 'DECLINED' : r.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.status === 'SUBMITTED' ? (
                        <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                          <button
                            onClick={() => openConvertModal(r)}
                            className="btn btn-primary btn-sm"
                            title="Accept & Convert into Project"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Check size={14} />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => openDeclineModal(r)}
                            className="btn btn-secondary btn-sm"
                            title="Decline this customer requirement"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              color: 'var(--status-danger)',
                              borderColor: 'rgba(239, 68, 68, 0.3)'
                            }}
                          >
                            <X size={14} />
                            <span>Decline</span>
                          </button>
                        </div>
                      ) : r.status === 'CONVERTED_TO_PROJECT' ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--status-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={15} />
                          <span>Project Active</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--status-danger)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <XCircle size={15} />
                          <span>Declined</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          pageSizeOptions={[4, 8, 16, 32]}
        />
      </div>

      {/* Accept / Convert to Project Modal */}
      <Modal isOpen={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Accept & Initialize Wedding Project">
        <form onSubmit={handleConvertSubmit}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Accept this couple's requirements and establish an official wedding project, budget ledger, and draft booking record.
          </p>

          <div className="form-group">
            <label className="form-label">Project Title</label>
            <input
              type="text"
              value={projectData.title}
              onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Venue Name</label>
              <input
                type="text"
                value={projectData.venue_name}
                onChange={(e) => setProjectData({ ...projectData, venue_name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={projectData.city}
                onChange={(e) => setProjectData({ ...projectData, city: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Venue Address</label>
            <input
              type="text"
              value={projectData.venue_address}
              onChange={(e) => setProjectData({ ...projectData, venue_address: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allocated Project Budget (₹)</label>
            <input
              type="number"
              value={projectData.total_budget}
              onChange={(e) => setProjectData({ ...projectData, total_budget: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setConvertModalOpen(false)} className="btn btn-secondary" disabled={submittingAction}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submittingAction}>
              {submittingAction ? 'Accepting...' : 'Accept & Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Decline Customer Request Modal */}
      <Modal isOpen={declineModalOpen} onClose={() => setDeclineModalOpen(false)} title="Decline Customer Request">
        {selectedReq && (
          <form onSubmit={handleDeclineSubmit}>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedReq.customer_name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Target Date: {selectedReq.wedding_date} • Location: {selectedReq.location}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Decline Reason / Note for Couple (Optional)</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="E.g., Date fully booked for prime weddings, out of coverage region, or budget adjustment needed..."
                className="form-input"
                rows={4}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                This message will be included in the status notification sent to the customer.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setDeclineModalOpen(false)} className="btn btn-secondary" disabled={submittingAction}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                style={{ background: 'var(--status-danger)', color: '#fff', border: 'none' }}
                disabled={submittingAction}
              >
                {submittingAction ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
