import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatCustomerId, formatVendorId, formatDate } from '../../utils/formatters';
import {
  Clock, Calendar, MapPin, User, CheckCircle, Search,
  ArrowUpDown, Filter, ShieldCheck, Plus
} from 'lucide-react';

export default function VendorSchedule() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time_asc');

  // Add Schedule Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    event_title: '',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '14:00',
    location: '',
    description: '',
    person_in_charge: '',
    status: 'SCHEDULED'
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchVendorSchedule();
  }, []);

  const fetchVendorSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/schedules/vendor/my-schedule');
      if (res.data.success) {
        setScheduleEvents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      showToast('Could not load wedding schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.event_title || !scheduleForm.event_date) return;

    try {
      setSavingSchedule(true);
      const res = await axios.post('/api/schedules', {
        ...scheduleForm,
        start_time: scheduleForm.start_time ? `${scheduleForm.start_time}:00` : '10:00:00',
        end_time: scheduleForm.end_time ? `${scheduleForm.end_time}:00` : '14:00:00'
      });
      if (res.data.success) {
        showToast('Schedule event added successfully!', 'success');
        setAddModalOpen(false);
        setScheduleForm({
          event_title: '',
          event_date: new Date().toISOString().split('T')[0],
          start_time: '10:00',
          end_time: '14:00',
          location: '',
          description: '',
          person_in_charge: '',
          status: 'SCHEDULED'
        });
        fetchVendorSchedule();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add schedule event', 'error');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // Filter
  const filtered = scheduleEvents.filter((ev) => {
    const matchesMonth = !filterMonth || ev.event_date?.startsWith(filterMonth);
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (ev.title || '').toLowerCase().includes(term) ||
      (ev.project_title || '').toLowerCase().includes(term) ||
      (ev.customer_name || '').toLowerCase().includes(term) ||
      (ev.location || '').toLowerCase().includes(term);
    return matchesMonth && matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const timeA = `${a.event_date || ''} ${a.start_time || ''}`;
    const timeB = `${b.event_date || ''} ${b.start_time || ''}`;
    if (sortBy === 'time_desc') return timeB.localeCompare(timeA);
    return timeA.localeCompare(timeB);
  });

  // Pagination
  const totalItems = sorted.length;
  const paginatedEvents = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(217, 119, 6, 0.05) 100%)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Vendor Wedding Day Schedule</h2>
            {user?.vendor_id && (
              <span className="id-badge id-badge-vnd">{formatVendorId(user.vendor_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Master ceremonial timeline for confirmed weddings curated by lead wedding planners.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="success">
            <CheckCircle size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
            {scheduleEvents.length} Active Engagements
          </Badge>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="month"
            className="form-control"
            style={{ width: 170 }}
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setCurrentPage(1);
            }}
          />
          {filterMonth && (
            <button
              type="button"
              onClick={() => setFilterMonth('')}
              className="btn btn-secondary btn-sm"
            >
              Reset Month
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search ceremony or couple..."
              style={{ paddingLeft: '2.4rem' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 170, fontSize: '0.86rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="time_asc">Earliest to Latest</option>
              <option value="time_desc">Latest to Earliest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Luxury Timeline */}
      {scheduleEvents.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem' }}>
          <EmptyState
            icon={Clock}
            title="No Scheduled Engagements"
            description="You currently have no scheduled wedding day itineraries mapped to your vendor account."
          />
        </div>
      ) : paginatedEvents.length === 0 ? (
        <div className="card" style={{ padding: '2rem' }}>
          <EmptyState
            icon={Search}
            title="No Events Found"
            description="No scheduled wedding itineraries match your current search or month filter."
          />
        </div>
      ) : (
        <div className="luxury-timeline">
          {paginatedEvents.map((item, idx) => (
            <div key={item.id || idx} className="timeline-item">
              <div className="timeline-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: 260 }}>
                  {/* Calendar Date Block */}
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--bg-subtle) 0%, rgba(217, 119, 6, 0.08) 100%)',
                    textAlign: 'center',
                    minWidth: 85,
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
                      {new Date(item.event_date).toLocaleDateString('en-IN', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {new Date(item.event_date).getDate()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(item.event_date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{item.title}</h3>
                      <Badge variant="primary">{item.project_title || 'Wedding Project'}</Badge>
                      <span className="timeline-time-capsule">
                        <Clock size={13} color="var(--primary)" />
                        {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {item.description || 'Deliver scheduled ceremonial services as coordinated with the lead wedding planner.'}
                    </p>

                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.84rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                      {item.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={14} color="var(--primary)" />
                          Venue: <strong style={{ color: 'var(--text-main)' }}>{item.location}</strong>
                        </span>
                      )}

                      {item.customer_name && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <User size={14} color="var(--primary)" />
                          <span>Couple: <strong style={{ color: 'var(--text-main)' }}>{item.customer_name}</strong></span>
                          {item.customer_id && (
                            <span className="id-badge id-badge-cust">{formatCustomerId(item.customer_id)}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <Badge variant="success">Confirmed Slot</Badge>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Planner Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[8, 16, 24]}
      />

      {/* Add Schedule Event Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => !savingSchedule && setAddModalOpen(false)}
        title="Add Vendor Schedule Event"
      >
        <form onSubmit={handleAddScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Ceremony / Event Title *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Bridal Photography Session, Welcome Dinner Service"
              value={scheduleForm.event_title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, event_title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={scheduleForm.event_date}
                onChange={(e) => setScheduleForm({ ...scheduleForm, event_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                className="form-control"
                required
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                className="form-control"
                required
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Location / Hall Venue</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Grand Ballroom, Mandap Lawn"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Person In Charge</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Lead Cameraman, Banquet Captain"
                value={scheduleForm.person_in_charge}
                onChange={(e) => setScheduleForm({ ...scheduleForm, person_in_charge: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Milestones</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Ceremonial details, equipment setup notes, or service checklist..."
              value={scheduleForm.description}
              onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={savingSchedule}
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingSchedule || !scheduleForm.event_title || !scheduleForm.event_date}
            >
              {savingSchedule ? 'Adding...' : 'Add Schedule Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
