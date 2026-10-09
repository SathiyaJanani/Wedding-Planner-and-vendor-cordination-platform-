import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { 
  Store, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  Calendar, MapPin, DollarSign, CheckCircle2, Clock, AlertCircle, RefreshCw
} from 'lucide-react';

export default function SelectedVendors() {
  const toast = useToast();
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter, Search, Sort & Pagination States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Fetch Service Categories for filter dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await axios.get('/api/vendors/categories');
        if (res.data.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const fetchSelectedVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        category: category || undefined,
        booking_status: bookingStatus || undefined,
        payment_status: paymentStatus || undefined,
        date: dateFilter || undefined,
        sort_by: sortBy
      };

      const res = await axios.get('/api/bookings/selected-vendors', { params });
      if (res.data.success) {
        setVendors(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load selected vendors.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, bookingStatus, paymentStatus, dateFilter, sortBy]);

  useEffect(() => {
    fetchSelectedVendors();
  }, [fetchSelectedVendors]);

  // Handle Search Input Change with debounce/reset page
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setBookingStatus('');
    setPaymentStatus('');
    setDateFilter('');
    setSortBy('date_asc');
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Selected Vendors
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Track all arranged and booked vendor services across active wedding projects with real-time budget synchronization.
          </p>
        </div>
        <button 
          onClick={fetchSelectedVendors}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Control Panel: Search, Sort, Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          {/* Search Box */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Vendors & Weddings
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search vendor, service, couple..."
                value={search}
                onChange={handleSearchChange}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category
            </label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Booking Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Booking Status
            </label>
            <select
              className="form-input"
              value={bookingStatus}
              onChange={(e) => { setBookingStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Booking Statuses</option>
              <option value="PROPOSED">Proposed</option>
              <option value="CUSTOMER_APPROVAL">Customer Approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Payment Status
            </label>
            <select
              className="form-input"
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Payments</option>
              <option value="PAID">Paid in Full</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PENDING">Payment Pending</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Event Date
            </label>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            />
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sort Records By
            </label>
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="date_asc">Event Date (Earliest First)</option>
              <option value="date_desc">Event Date (Latest First)</option>
              <option value="amount_desc">Amount (Highest First)</option>
              <option value="amount_asc">Amount (Lowest First)</option>
              <option value="vendor_asc">Vendor Name (A-Z)</option>
              <option value="vendor_desc">Vendor Name (Z-A)</option>
              <option value="status_asc">Booking Status</option>
            </select>
          </div>
        </div>

        {/* Reset Active Filters Button */}
        {(search || category || bookingStatus || paymentStatus || dateFilter || sortBy !== 'date_asc') && (
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

      {/* Main Table Content */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : vendors.length === 0 ? (
        <EmptyState
          title="No Selected Vendors Found"
          message="No records match your current search and filter criteria. Try adjusting your parameters."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Vendor & Service</th>
                  <th>Category</th>
                  <th>Wedding & Couple</th>
                  <th>Event Date & City</th>
                  <th style={{ textAlign: 'right' }}>Agreed Amount</th>
                  <th style={{ textAlign: 'right' }}>Paid / Pending</th>
                  <th>Payment Status</th>
                  <th>Booking Status</th>
                  <th>Vendor Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => {
                  const agreed = Number(v.amount || 0);
                  const paid = Number(v.paid_amount || 0);
                  const pending = Number(v.pending_amount || (agreed - paid));

                  return (
                    <tr key={v.id}>
                      {/* Vendor & Service */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {v.vendor_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {v.service_name}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                          {v.category_name}
                        </span>
                      </td>

                      {/* Wedding & Couple */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                          {v.wedding_title || 'Wedding Project'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Couple: <strong>{v.customer_name}</strong>
                        </div>
                      </td>

                      {/* Event Date & Location */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{v.event_date ? new Date(v.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <MapPin size={12} />
                          <span>{v.location || 'Bangalore'}</span>
                        </div>
                      </td>

                      {/* Agreed Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        ₹{agreed.toLocaleString('en-IN')}
                      </td>

                      {/* Paid / Pending Breakdown */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
                          Paid: ₹{paid.toLocaleString('en-IN')}
                        </div>
                        <div style={{ color: pending > 0 ? '#ea580c' : 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Pending: ₹{pending.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td>
                        <span className={`badge ${
                          v.payment_status === 'PAID' ? 'badge-success' :
                          v.payment_status === 'PARTIAL' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {v.payment_status}
                        </span>
                      </td>

                      {/* Booking Status */}
                      <td>
                        <Badge status={v.booking_status} />
                      </td>

                      {/* Vendor Status */}
                      <td>
                        <span className={`badge ${
                          v.vendor_status === 'ACCEPTED' ? 'badge-success' :
                          v.vendor_status === 'DECLINED' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {v.vendor_status || 'CONFIRMED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            {/* Page Size Selector & Total Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>
                Showing <strong>{vendors.length}</strong> of <strong>{pagination.total}</strong> records
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Page Size:</span>
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

            {/* Previous, Next & Page Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
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
                style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
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
