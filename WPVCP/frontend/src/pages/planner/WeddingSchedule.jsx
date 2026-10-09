import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { 
  Clock, Plus, Calendar, MapPin, User, CheckCircle, Edit2, Trash2, 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Store, RefreshCw, Eye
} from 'lucide-react';

export default function WeddingSchedule() {
  const toast = useToast();
  const [viewMode, setViewMode] = useState('master'); // 'master' | 'project'

  // Master Schedule States
  const [schedules, setSchedules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters, Search, Sort & Pagination
  const [search, setSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Add / Edit Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    wedding_project_id: '',
    event_title: '',
    event_date: '',
    start_time: '08:00:00',
    end_time: '11:00:00',
    location: '',
    description: '',
    person_in_charge: '',
    vendor_id: '',
    status: 'SCHEDULED'
  });

  // Load Projects, Vendors, Categories
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [pRes, vRes, cRes] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/vendors'),
          axios.get('/api/vendors/categories')
        ]);
        if (pRes.data.success) {
          setProjects(pRes.data.data || []);
          if (pRes.data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              wedding_project_id: pRes.data.data[0].id,
              event_date: pRes.data.data[0].wedding_date || '',
              location: pRes.data.data[0].city || 'Bangalore'
            }));
          }
        }
        if (vRes.data.success) setVendors(vRes.data.data || []);
        if (cRes.data.success) setCategories(cRes.data.data || []);
      } catch (err) {
        console.error('Failed to load initial data for schedule', err);
      }
    }
    loadInitialData();
  }, []);

  // Fetch Master Schedule
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        wedding_project_id: selectedProjectId || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        date: dateFilter || undefined,
        sort_by: sortBy
      };

      const res = await axios.get('/api/schedules', { params });
      if (res.data.success) {
        setSchedules(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load wedding schedule.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedProjectId, statusFilter, categoryFilter, dateFilter, sortBy]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.wedding_project_id || !formData.event_title || !formData.event_date) {
      toast.error('Please fill in wedding project, event title, and date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('/api/schedules', formData);
      if (res.data.success) {
        toast.success('Itinerary event scheduled successfully!');
        setIsAddOpen(false);
        setFormData({
          wedding_project_id: projects[0]?.id || '',
          event_title: '',
          event_date: projects[0]?.wedding_date || '',
          start_time: '08:00:00',
          end_time: '11:00:00',
          location: '',
          description: '',
          person_in_charge: '',
          vendor_id: '',
          status: 'SCHEDULED'
        });
        fetchSchedules();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create schedule item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`/api/schedules/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Event status marked as ${newStatus}`);
        fetchSchedules();
      }
    } catch (err) {
      toast.error('Failed to update event status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled event?')) return;
    try {
      const res = await axios.delete(`/api/schedules/${id}`);
      if (res.data.success) {
        toast.success('Event removed from schedule.');
        fetchSchedules();
      }
    } catch (err) {
      toast.error('Failed to delete schedule item.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedProjectId('');
    setStatusFilter('');
    setCategoryFilter('');
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
            Wedding Schedule & Itinerary
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Coordinate wedding timelines, vendor call-times, ceremony stages, and live execution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Add Event</span>
          </button>

          <button 
            type="button"
            onClick={fetchSchedules}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Search, Filter, Sort Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          {/* Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Schedule
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search ceremony, couple, vendor..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Wedding Project Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Wedding Project
            </label>
            <select
              className="form-input"
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); setPage(1); }}
            >
              <option value="">All Wedding Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Event Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status
            </label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Service Category
            </label>
            <select
              className="form-input"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
              Sort Events By
            </label>
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="date_asc">Event Date (Earliest First)</option>
              <option value="date_desc">Event Date (Latest First)</option>
              <option value="customer_asc">Customer (A-Z)</option>
              <option value="vendor_asc">Vendor (A-Z)</option>
              <option value="service_asc">Event Title (A-Z)</option>
            </select>
          </div>
        </div>

        {(search || selectedProjectId || statusFilter || categoryFilter || dateFilter || sortBy !== 'date_asc') && (
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

      {/* Main Table: Section 10 Requirements */}
      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No Scheduled Events Found"
          message="No itinerary items match your selected filters. Click 'Add Event' above to schedule a wedding timeline event."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Event & Time</th>
                  <th>Wedding & Customer</th>
                  <th>Vendor & Service</th>
                  <th>Location</th>
                  <th>Person In Charge</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr key={item.id}>
                    {/* Event & Time */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        {item.event_title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <Calendar size={12} />
                        <span>{item.event_date ? new Date(item.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                        <span>•</span>
                        <Clock size={12} />
                        <span>{item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</span>
                      </div>
                    </td>

                    {/* Wedding & Customer */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                        {item.wedding_title || 'Wedding Project'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Couple: <strong>{item.customer_name}</strong>
                      </div>
                    </td>

                    {/* Vendor & Service */}
                    <td>
                      {item.vendor_name ? (
                        <>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {item.vendor_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            <span className="badge badge-neutral" style={{ padding: '0.1rem 0.4rem', fontSize: '0.72rem' }}>
                              {item.vendor_category || 'Service'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Internal / Planner Coordinated
                        </span>
                      )}
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>{item.location || 'Venue'}</span>
                      </div>
                    </td>

                    {/* Person In Charge */}
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {item.person_in_charge || 'Lead Planner'}
                      </div>
                    </td>

                    {/* Status with Quick Toggle */}
                    <td>
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="form-input"
                        style={{
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          width: 'auto',
                          background: item.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' :
                                      item.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.1)' :
                                      item.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-subtle)',
                          color: item.status === 'COMPLETED' ? '#16a34a' :
                                 item.status === 'IN_PROGRESS' ? '#2563eb' :
                                 item.status === 'CANCELLED' ? '#dc2626' : 'var(--text-main)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444', padding: '0.3rem' }}
                        title="Delete Event"
                      >
                        <Trash2 size={15} />
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
                Showing <strong>{schedules.length}</strong> of <strong>{pagination.total}</strong> itinerary events
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

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Wedding Timeline Event"
      >
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Wedding Project *</label>
            <select
              className="form-input"
              value={formData.wedding_project_id}
              onChange={(e) => {
                const pId = e.target.value;
                const proj = projects.find(p => p.id === parseInt(pId));
                setFormData(prev => ({
                  ...prev,
                  wedding_project_id: pId,
                  event_date: proj?.wedding_date || prev.event_date,
                  location: proj?.city || prev.location
                }));
              }}
              required
            >
              <option value="">Select Wedding Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title} ({p.project_code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Event / Activity Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sangeet Ceremony, Baraat Arrival, Photography Session"
              value={formData.event_title}
              onChange={(e) => setFormData(prev => ({ ...prev, event_title: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Location / Hall</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Main Ballroom, Lawn Pavilion"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Assigned</label>
              <select
                className="form-input"
                value={formData.vendor_id}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor_id: e.target.value }))}
              >
                <option value="">None / Internal Coordination</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.business_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Person In Charge</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Lead Planner, Vendor Rep, Bride's Brother"
              value={formData.person_in_charge}
              onChange={(e) => setFormData(prev => ({ ...prev, person_in_charge: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Detailed instructions, cue times, and equipment checklist..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block"
            >
              {submitting ? 'Scheduling...' : 'Save Scheduled Event'}
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
