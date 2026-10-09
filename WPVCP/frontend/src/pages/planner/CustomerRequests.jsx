import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { FileText, ArrowRight, CheckCircle, Check, X, XCircle, Calendar, MapPin, DollarSign, Users, Sparkles, AlertCircle, Search, ArrowUpDown, ShieldCheck } from 'lucide-react';

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

  const [verifyingId, setVerifyingId] = useState(null);

  const handleVerifyRequirement = async (id) => {
    try {
      setVerifyingId(id);
      const res = await axios.put(`/api/requirements/${id}/verify`);
      if (res.data.success) {
        toast.success(res.data.message || 'Requirements successfully verified and synced to project!');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify requirements.');
    } finally {
      setVerifyingId(null);
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
            { key: 'RESENT', label: '🔄 Resent' },
            { key: 'PENDING_VERIFICATION', label: '⚠️ Needs Decision (Accept/Decline)' },
            { key: 'SUBMITTED', label: '📥 Submitted' },
            { key: 'CONVERTED_TO_PROJECT', label: '✅ Active Projects' },
            { key: 'DRAFT', label: '📝 Drafts' },
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

      {/* Prominent Decision Block for Pending Customer Modifications & Resent Requests */}
      {requests.filter(r => r.verification_status === 'PENDING_PLANNER_VERIFICATION' || r.verification_status === 'RESENT' || r.status === 'RESENT').length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.85rem'
          }}>
            <ShieldCheck size={20} color="#b45309" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#92400e' }}>
              Pending Customer Change & Resent Requests (Review & Decision Required)
            </h3>
            <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>
              {requests.filter(r => r.verification_status === 'PENDING_PLANNER_VERIFICATION' || r.verification_status === 'RESENT' || r.status === 'RESENT').length} Awaiting Decision
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.filter(r => r.verification_status === 'PENDING_PLANNER_VERIFICATION' || r.verification_status === 'RESENT' || r.status === 'RESENT').map(pendingReq => (
              <div
                key={pendingReq.id}
                style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '2px solid #f59e0b',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.16)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid rgba(245, 158, 11, 0.35)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      background: '#f59e0b',
                      color: '#fff',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <AlertCircle size={14} /> ACTION REQUIRED
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: '#92400e' }}>
                      {pendingReq.customer_name} {pendingReq.partner_name ? `& ${pendingReq.partner_name}` : ''}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#b45309', fontFamily: 'monospace', fontWeight: 700 }}>
                      (#REQ-{pendingReq.id})
                    </span>
                    {pendingReq.project_code && (
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                        Project: {pendingReq.project_code}
                      </span>
                    )}
                  </div>

                  {/* Accept & Decline Buttons */}
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (pendingReq.wedding_project_id) {
                          handleVerifyRequirement(pendingReq.id);
                        } else {
                          openConvertModal(pendingReq);
                        }
                      }}
                      disabled={verifyingId === pendingReq.id}
                      className="btn btn-primary"
                      style={{
                        background: '#10b981',
                        borderColor: '#059669',
                        color: '#fff',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 1.15rem',
                        fontSize: '0.9rem'
                      }}
                      title="Accept customer modifications and sync to project"
                    >
                      <Check size={16} />
                      <span>{verifyingId === pendingReq.id ? 'Accepting...' : 'Accept Changes'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeclineModal(pendingReq)}
                      className="btn btn-secondary"
                      style={{
                        background: '#fff',
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 1.15rem',
                        fontSize: '0.9rem'
                      }}
                      title="Decline changes with an explanation note"
                    >
                      <X size={16} />
                      <span>Decline Changes</span>
                    </button>
                  </div>
                </div>

                {/* Change Breakdown Highlight Box */}
                <div style={{
                  background: '#fff',
                  border: '1.5px solid rgba(245, 158, 11, 0.45)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} color="#d97706" />
                    <span>WHAT CHANGED (MODIFICATIONS SUBMITTED BY COUPLE):</span>
                  </div>

                  <div style={{
                    fontSize: '0.95rem',
                    color: '#1f2937',
                    fontWeight: 700,
                    lineHeight: 1.5,
                    background: 'rgba(254, 243, 199, 0.4)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    {pendingReq.change_summary || `Customer updated wedding specifications (Destination: "${pendingReq.location}", Date: ${pendingReq.wedding_date}, Budget: ₹${Number(pendingReq.estimated_budget || 0).toLocaleString('en-IN')})`}
                  </div>

                  {/* Summary Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.85rem',
                    paddingTop: '0.5rem',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>📍 Updated Destination:</span>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem', marginTop: '0.15rem' }}>
                        {pendingReq.location}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>📅 Target Date:</span>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.15rem' }}>
                        {pendingReq.wedding_date}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>💰 Estimated Budget:</span>
                      <div style={{ fontWeight: 800, color: 'var(--status-success)', fontSize: '0.95rem', marginTop: '0.15rem' }}>
                        ₹{Number(pendingReq.estimated_budget).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>👥 Target Guests:</span>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.15rem' }}>
                        {pendingReq.guest_count} attendees
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <th>Status & Verification</th>
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
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>{r.location}</span>
                      </div>
                      {r.change_summary && (
                        <div style={{
                          marginTop: '0.4rem',
                          fontSize: '0.76rem',
                          color: '#b45309',
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          borderRadius: '4px',
                          padding: '0.35rem 0.5rem',
                          lineHeight: '1.3'
                        }}>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.15rem' }}>
                            <AlertCircle size={12} color="#b45309" />
                            <span>Requirement Change:</span>
                          </div>
                          <div>{r.change_summary}</div>
                        </div>
                      )}
                    </td>
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
                      {r.status === 'RESENT' || r.verification_status === 'RESENT' ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.78rem', background: '#f59e0b', color: '#fff', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          🔄 Resent
                        </span>
                      ) : (
                        <Badge status={r.status === 'REJECTED' ? 'DECLINED' : r.status} />
                      )}
                      {r.verification_status === 'PENDING_PLANNER_VERIFICATION' && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', fontWeight: 700 }}>
                            <AlertCircle size={12} /> Pending Decision
                          </span>
                        </div>
                      )}
                      {r.verification_status === 'VERIFIED' && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            ✓ Verified & Synced
                          </span>
                        </div>
                      )}
                      {r.verification_status === 'DECLINED' && (
                        <div style={{ marginTop: '0.35rem' }}>
                          <span className="badge badge-danger" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <X size={11} /> Changes Declined
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {(r.verification_status === 'PENDING_PLANNER_VERIFICATION' || r.verification_status === 'RESENT' || r.status === 'RESENT') ? (
                        <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              if (r.wedding_project_id) {
                                handleVerifyRequirement(r.id);
                              } else {
                                openConvertModal(r);
                              }
                            }}
                            disabled={verifyingId === r.id}
                            className="btn btn-primary btn-sm"
                            title={r.wedding_project_id ? "Accept Location / Requirements Changes" : "Accept & Initialize Wedding Project"}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
                          >
                            <Check size={14} />
                            <span>{verifyingId === r.id ? 'Accepting...' : 'Accept'}</span>
                          </button>
                          <button
                            onClick={() => openDeclineModal(r)}
                            className="btn btn-secondary btn-sm"
                            title="Decline this change"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              color: 'var(--status-danger)',
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              fontWeight: 700
                            }}
                          >
                            <X size={14} />
                            <span>Decline</span>
                          </button>
                        </div>
                      ) : r.status === 'SUBMITTED' ? (
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
              {selectedReq.change_summary && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.45rem 0.65rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  color: '#b91c1c'
                }}>
                  <strong>Requested Change:</strong> {selectedReq.change_summary}
                </div>
              )}
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
