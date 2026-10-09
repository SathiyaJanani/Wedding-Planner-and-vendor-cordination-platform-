import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { Send, Plus, Search, Calendar, Store, DollarSign, Clock, CheckCircle, Check, X, XCircle, AlertCircle, ArrowUpDown } from 'lucide-react';

export default function VendorRequests() {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isSendOpen, setIsSendOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();
  const location = useLocation();

  const [formData, setFormData] = useState({
    wedding_project_id: '',
    vendor_id: '',
    event_date: '',
    start_time: '09:00:00',
    end_time: '21:00:00',
    proposed_price: '',
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchProjectsAndVendors();
  }, [search, statusFilter, sortBy, currentPage, pageSize]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendor-requests', {
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
      toast.error('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsAndVendors = async () => {
    try {
      const [pRes, vRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/vendors')
      ]);
      if (pRes.data.success) {
        setProjects(pRes.data.data);
        if (pRes.data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            wedding_project_id: prev.wedding_project_id || pRes.data.data[0].id,
            event_date: prev.event_date || pRes.data.data[0].wedding_date
          }));
        }
      }
      if (vRes.data.success) {
        setVendors(vRes.data.data);
        // Check if preselected from location.state
        const preselectedVendorId = location.state?.vendor_id;
        const targetVendor = preselectedVendorId
          ? vRes.data.data.find(v => v.id === preselectedVendorId)
          : vRes.data.data[0];

        if (targetVendor) {
          setFormData(prev => ({
            ...prev,
            vendor_id: targetVendor.id,
            proposed_price: targetVendor.base_price
          }));
        }

        if (preselectedVendorId) {
          setIsSendOpen(true);
        }
      }
    } catch (e) {
      // quiet
    }
  };

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await axios.post('/api/vendor-requests', formData);
      if (res.data.success) {
        toast.success(`Request ${res.data.request_code} dispatched to vendor!`);
        setIsSendOpen(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch vendor request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async (reqItem) => {
    if (!window.confirm(`Confirm acceptance for Request ${reqItem.request_code} (${reqItem.business_name})? This will reserve the vendor date.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await axios.put(`/api/vendor-requests/${reqItem.id}/accept`);
      if (res.data.success) {
        toast.success(`Vendor request ${reqItem.request_code} accepted successfully!`);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept vendor request.');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeclineModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setDeclineReason('');
    setDeclineModalOpen(true);
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    if (!declineReason.trim()) {
      toast.error('Please specify a decline reason.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await axios.put(`/api/vendor-requests/${selectedRequest.id}/decline`, {
        decline_reason: declineReason.trim()
      });
      if (res.data.success) {
        toast.success(`Vendor request ${selectedRequest.request_code} declined.`);
        setDeclineModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline vendor request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Vendor Booking Requests
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Dispatch formal coordination requests to verified vendors, review responses, and manage acceptance or declines.
          </p>
        </div>

        <button onClick={() => setIsSendOpen(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
          <Send size={18} />
          <span>Send New Vendor Request</span>
        </button>
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
              placeholder="Search by code, vendor, project, service..."
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
            <option value="newest">🕒 Newest Requests</option>
            <option value="event_date_asc">📅 Event Date (Soonest)</option>
            <option value="event_date_desc">📅 Event Date (Latest)</option>
            <option value="price_desc">💰 Price: High to Low</option>
            <option value="price_asc">💰 Price: Low to High</option>
          </select>
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Status:
          </span>
          {[
            { key: '', label: 'All Requests' },
            { key: 'PENDING', label: '⏳ Pending' },
            { key: 'ACCEPTED', label: '✅ Accepted' },
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

      {/* Requests Table */}
      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : requests.length === 0 ? (
          <EmptyState title="No vendor requests dispatched yet" message="Create your first vendor request using the button above." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request Code</th>
                  <th>Wedding Project</th>
                  <th>Vendor Brand</th>
                  <th>Category</th>
                  <th>Event Date</th>
                  <th>Proposed Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {r.request_code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.project_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.project_code}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.business_name}</td>
                    <td><span className="badge badge-neutral">{r.category_name}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.event_date}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(r.proposed_price).toLocaleString('en-IN')}</td>
                    <td>
                      <div>
                        <Badge status={r.status} />
                        {r.status === 'DECLINED' && r.decline_reason && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--status-danger)', marginTop: '0.2rem', maxWidth: '160px' }} title={r.decline_reason}>
                            Note: {r.decline_reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleAcceptRequest(r)}
                            className="btn btn-primary btn-sm"
                            title="Accept Vendor Request"
                            disabled={actionLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Check size={14} />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => openDeclineModal(r)}
                            className="btn btn-secondary btn-sm"
                            title="Decline Vendor Request"
                            disabled={actionLoading}
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
                      ) : r.status === 'ACCEPTED' ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--status-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={15} />
                          <span>Accepted</span>
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
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Send Vendor Request Modal */}
      <Modal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} title="Dispatch Vendor Request">
        <form onSubmit={handleSendSubmit}>
          <div className="form-group">
            <label className="form-label">Wedding Project</label>
            <select
              value={formData.wedding_project_id}
              onChange={(e) => {
                const p = projects.find(pr => pr.id === parseInt(e.target.value, 10));
                setFormData({
                  ...formData,
                  wedding_project_id: e.target.value,
                  event_date: p ? p.wedding_date : formData.event_date
                });
              }}
              className="form-select"
              required
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.project_code}) - {p.wedding_date}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Vendor</label>
            <select
              value={formData.vendor_id}
              onChange={(e) => {
                const v = vendors.find(vend => vend.id === parseInt(e.target.value, 10));
                setFormData({
                  ...formData,
                  vendor_id: e.target.value,
                  proposed_price: v ? v.base_price : formData.proposed_price
                });
              }}
              className="form-select"
              required
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.business_name} ({v.category_name} - Base: ₹{Number(v.base_price).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Event Date</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Proposed Total Fee (₹)</label>
            <input
              type="number"
              value={formData.proposed_price}
              onChange={(e) => setFormData({ ...formData, proposed_price: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Coordination Notes / Special Instructions</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="E.g. Traditional setup requested by 7:00 AM sharp, requires crew of 4..."
              className="form-input"
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsSendOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Dispatching...' : 'Dispatch Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Decline Vendor Request Modal */}
      <Modal isOpen={declineModalOpen} onClose={() => setDeclineModalOpen(false)} title="Decline Vendor Request">
        {selectedRequest && (
          <form onSubmit={handleDeclineSubmit}>
            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedRequest.business_name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Request: {selectedRequest.request_code} • Project: {selectedRequest.project_title} • Date: {selectedRequest.event_date}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Declining (Mandatory)</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="E.g., Vendor unavailable for given timings, replacement vendor chosen, client budget revised..."
                className="form-input"
                rows={3}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setDeclineModalOpen(false)} className="btn btn-secondary" disabled={actionLoading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                style={{ background: 'var(--status-danger)', color: '#fff', border: 'none' }}
                disabled={actionLoading}
              >
                {actionLoading ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
