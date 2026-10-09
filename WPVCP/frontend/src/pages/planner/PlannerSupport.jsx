import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { 
  HelpCircle, Search, Filter, RefreshCw, MessageSquare, CheckCircle, 
  Clock, AlertTriangle, ChevronLeft, ChevronRight, User, Send, ShieldAlert
} from 'lucide-react';

export default function PlannerSupport() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Selected ticket for response modal
  const [activeTicket, setActiveTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [nextStatus, setNextStatus] = useState('RESOLVED');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined
      };

      const res = await axios.get('/api/support', { params });
      if (res.data.success) {
        setTickets(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenRespond = (ticket) => {
    setActiveTicket(ticket);
    setResponseText(ticket.response || '');
    setNextStatus(ticket.status === 'OPEN' ? 'RESOLVED' : ticket.status);
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!activeTicket || !responseText.trim()) {
      toast.error('Please enter a response message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.put(`/api/support/${activeTicket.id}/respond`, {
        response: responseText.trim(),
        status: nextStatus
      });

      if (res.data.success) {
        toast.success(`Ticket #${activeTicket.id} updated and customer notified!`);
        setActiveTicket(null);
        setResponseText('');
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit response.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      const res = await axios.put(`/api/support/${ticketId}/status`, { status });
      if (res.data.success) {
        toast.success(`Ticket #${ticketId} status updated to ${status}`);
        fetchTickets();
      }
    } catch (err) {
      toast.error('Failed to update ticket status.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Support Desk Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Manage client inquiries, wedding coordination escalations, billing questions, and issue resolutions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTickets}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          {/* Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Search Inquiries
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search subject, couple, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Status
            </label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Priority
            </label>
            <select
              className="form-input"
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Category
            </label>
            <select
              className="form-input"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="BOOKING">Booking</option>
              <option value="PAYMENT">Payment & Billing</option>
              <option value="VENDOR">Vendor Issue</option>
              <option value="SCHEDULE">Schedule & Timing</option>
            </select>
          </div>
        </div>

        {(search || statusFilter || priorityFilter || categoryFilter) && (
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleResetFilters}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.82rem', color: 'var(--primary)' }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No Support Tickets Found"
          message="No customer support requests match your active filters. Open inquiries will appear here."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Ticket & Subject</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Response</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    {/* Subject */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        #{t.id} - {t.subject}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description || t.message}
                      </div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {t.customer_name || 'Client'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {t.customer_email}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {t.category || 'GENERAL'}
                      </span>
                    </td>

                    {/* Priority */}
                    <td>
                      <span className={`badge ${
                        t.priority === 'URGENT' ? 'badge-danger' :
                        t.priority === 'HIGH' ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {t.priority || 'MEDIUM'}
                      </span>
                    </td>

                    {/* Status with Inline Change */}
                    <td>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="form-input"
                        style={{
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          width: 'auto',
                          background: t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'rgba(34, 197, 94, 0.1)' :
                                      t.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: t.status === 'RESOLVED' || t.status === 'CLOSED' ? '#16a34a' :
                                 t.status === 'IN_PROGRESS' ? '#2563eb' : '#d97706',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="WAITING_FOR_CUSTOMER">WAITING</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    {/* Created Date */}
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}
                    </td>

                    {/* Resolution Status */}
                    <td>
                      {t.response ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
                          <CheckCircle size={14} />
                          <span>Answered</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ea580c', fontSize: '0.82rem' }}>
                          <Clock size={14} />
                          <span>Pending</span>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenRespond(t)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                      >
                        <MessageSquare size={13} />
                        <span>{t.response ? 'Update' : 'Respond'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-subtle)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>
                Showing <strong>{tickets.length}</strong> of <strong>{pagination.total}</strong> tickets
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Per Page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="form-input"
                  style={{ padding: '0.2rem 0.6rem', fontSize: '0.82rem', width: 'auto' }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <span style={{ fontSize: '0.88rem', fontWeight: 600, padding: '0 0.5rem' }}>
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                disabled={page >= (pagination.totalPages || 1)}
                className="btn btn-secondary btn-sm"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response / Resolution Modal */}
      {activeTicket && (
        <Modal
          isOpen={!!activeTicket}
          onClose={() => setActiveTicket(null)}
          title={`Respond to Ticket #${activeTicket.id}: ${activeTicket.subject}`}
        >
          <form onSubmit={handleSendResponse}>
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <strong>{activeTicket.customer_name} ({activeTicket.customer_email})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category / Priority:</span>
                <span>{activeTicket.category || 'GENERAL'} • <strong>{activeTicket.priority || 'MEDIUM'}</strong></span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.75rem', lineHeight: 1.5, borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
                <strong>Inquiry Message:</strong><br />
                {activeTicket.description || activeTicket.message}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Planner Concierge Response *</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Provide clear assistance, resolution details, or coordination updates..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Update Ticket Status</label>
              <select
                className="form-input"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
              >
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="WAITING_FOR_CUSTOMER">WAITING FOR CUSTOMER</option>
                <option value="RESOLVED">RESOLVED (Issue Addressed)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-block"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Send size={15} />
                <span>{submitting ? 'Sending...' : 'Dispatch Response & Notify Customer'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
