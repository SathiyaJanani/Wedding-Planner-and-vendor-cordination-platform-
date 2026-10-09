import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { 
  Users, Calendar, Mail, Phone, Heart, Sparkles, User, Search, 
  Filter, ArrowUpDown, ChevronLeft, ChevronRight, Store, MapPin, DollarSign, RefreshCw
} from 'lucide-react';

export default function VendorCustomers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort & Pagination States
  const [search, setSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchConnectedCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        booking_status: bookingStatus || undefined,
        wedding_date: weddingDate || undefined,
        service: serviceFilter.trim() || undefined,
        sort_by: sortBy
      };

      const res = await axios.get('/api/vendors/my-customers', { params });
      if (res.data.success) {
        setCustomers(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load connected clients.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, bookingStatus, weddingDate, serviceFilter, sortBy]);

  useEffect(() => {
    fetchConnectedCustomers();
  }, [fetchConnectedCustomers]);

  const handleResetFilters = () => {
    setSearch('');
    setBookingStatus('');
    setWeddingDate('');
    setServiceFilter('');
    setSortBy('date_asc');
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Connected Wedding Clients
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Couples whose wedding projects feature your accepted or contracted services, coordinated through the lead planner.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConnectedCustomers}
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          {/* Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Search Clients
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search couple, project..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Booking Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Booking Status
            </label>
            <select
              className="form-input"
              value={bookingStatus}
              onChange={(e) => { setBookingStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Engagements</option>
              <option value="CONFIRMED">Confirmed Booking</option>
              <option value="REQUESTED">Pending Request</option>
              <option value="CUSTOMER_APPROVAL">Customer Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Service Filter
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Photography, Catering..."
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            />
          </div>

          {/* Date Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Wedding Date
            </label>
            <input
              type="date"
              className="form-input"
              value={weddingDate}
              onChange={(e) => { setWeddingDate(e.target.value); setPage(1); }}
            />
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Sort Clients
            </label>
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="date_asc">Wedding Date (Earliest First)</option>
              <option value="date_desc">Wedding Date (Latest First)</option>
              <option value="customer_asc">Couple Name (A-Z)</option>
              <option value="customer_desc">Couple Name (Z-A)</option>
              <option value="status_asc">Booking Status</option>
            </select>
          </div>
        </div>

        {(search || bookingStatus || weddingDate || serviceFilter || sortBy !== 'date_asc') && (
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

      {/* Main Roster Table */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No Connected Clients Found"
          message="No clients match your filter criteria. When wedding planners contract or send you requests, connected couples will appear here."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Couple / Customer</th>
                  <th>Wedding Celebration</th>
                  <th>Assigned Service</th>
                  <th>Event Date & City</th>
                  <th>Lead Planner</th>
                  <th style={{ textAlign: 'right' }}>Contract Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, idx) => (
                  <tr key={idx}>
                    {/* Couple */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary) 0%, #D4AF37 100%)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          flexShrink: 0
                        }}>
                          {c.customer_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                            {c.customer_name}
                          </div>
                          {c.partner_name && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              & {c.partner_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Wedding Project */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {c.project_title || 'Wedding Project'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Code: {c.project_code || 'WP-CONFIRMED'}
                      </div>
                    </td>

                    {/* Service Package */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        {c.service_name || 'Artisan Service'}
                      </div>
                    </td>

                    {/* Event Date & Location */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{c.wedding_date ? new Date(c.wedding_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <MapPin size={12} />
                        <span>{c.city || 'Bangalore'}</span>
                      </div>
                    </td>

                    {/* Lead Planner */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {c.planner_name || 'Lead Coordinator'}
                      </div>
                    </td>

                    {/* Contract Amount */}
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      ₹{Number(c.agreed_price || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td>
                      <Badge status={c.booking_status || 'CONFIRMED'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
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
                Showing <strong>{customers.length}</strong> of <strong>{pagination.total}</strong> connected clients
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
    </div>
  );
}
