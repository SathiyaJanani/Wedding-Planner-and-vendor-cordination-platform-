import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatCustomerId, formatVendorId, formatDate } from '../../utils/formatters';
import {
  Clock, Calendar, MapPin, User, Sparkles, Search,
  ArrowUpDown, Filter, CheckCircle, ShieldCheck
} from 'lucide-react';

export default function CustomerSchedule() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  // Search, Filter, Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [sortBy, setSortBy] = useState('time_asc'); // time_asc, time_desc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/schedules/customer/active');
      if (res.data.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      showToast('Could not load wedding schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // Unique dates for Day filters
  const uniqueDates = ['ALL', ...new Set(events.map(e => e.event_date ? e.event_date.split('T')[0] : null).filter(Boolean))];

  // Filtering
  const filtered = events.filter((ev) => {
    const evDate = ev.event_date ? ev.event_date.split('T')[0] : '';
    const matchesDay = selectedDay === 'ALL' || evDate === selectedDay;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (ev.title || '').toLowerCase().includes(term) ||
      (ev.description || '').toLowerCase().includes(term) ||
      (ev.location || '').toLowerCase().includes(term) ||
      (ev.assigned_vendor_name || '').toLowerCase().includes(term);
    return matchesDay && matchesSearch;
  });

  // Sorting
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(225, 29, 72, 0.06) 100%)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Wedding Ceremony Itinerary</h2>
            {user?.customer_id && (
              <span className="id-badge id-badge-cust">{formatCustomerId(user.customer_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Chronological master itinerary of rituals, muhurtham moments, banquets, and vendor assignments coordinated by your lead planner.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="success">
            <CheckCircle size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
            {events.length} Scheduled Ceremonies
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Day Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {uniqueDates.map((dt, idx) => (
            <button
              key={dt}
              type="button"
              className={`btn btn-sm ${selectedDay === dt ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setSelectedDay(dt);
                setCurrentPage(1);
              }}
            >
              {dt === 'ALL' ? 'All Ceremonies' : `Day ${idx}: ${formatDate(dt, { month: 'short', day: 'numeric' })}`}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 230 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search ritual or venue..."
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

      {/* Grand Luxury Timeline (Continuous Spine - No broken dashed borders) */}
      {events.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem' }}>
          <EmptyState
            icon={Clock}
            title="No Scheduled Itinerary Yet"
            description="Your lead wedding planner is formulating the minute-by-minute ceremonial timeline. Confirmed ritual proceedings will appear here."
          />
        </div>
      ) : paginatedEvents.length === 0 ? (
        <div className="card" style={{ padding: '2rem' }}>
          <EmptyState
            icon={Search}
            title="No Ceremonies Found"
            description="No timeline events match your current filter criteria."
          />
        </div>
      ) : (
        <div className="luxury-timeline">
          {paginatedEvents.map((ev, idx) => {
            const hasVendor = ev.assigned_vendor_name || ev.vendor_id;

            return (
              <div key={ev.id || idx} className="timeline-item">
                <div className="timeline-card">
                  {/* Left block: Date capsule & Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: 260 }}>
                    {/* Calendar Date Block */}
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, var(--bg-subtle) 0%, rgba(225, 29, 72, 0.08) 100%)',
                      textAlign: 'center',
                      minWidth: 80,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                        {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { month: 'short' }) : 'DAY'}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
                        {ev.event_date ? new Date(ev.event_date).getDate() : idx + 1}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { weekday: 'short' }) : ''}
                      </div>
                    </div>

                    {/* Ceremony Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                          {ev.title || ev.event_title}
                        </h3>
                        <span className="timeline-time-capsule">
                          <Clock size={13} color="var(--primary)" />
                          {ev.start_time?.slice(0, 5)} - {ev.end_time?.slice(0, 5)}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {ev.description || 'Ceremonial proceedings and auspicious rituals coordinated by your lead planner.'}
                      </p>

                      {/* Meta Tags */}
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.84rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                        {ev.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={14} color="var(--primary)" />
                            Venue: <strong style={{ color: 'var(--text-main)' }}>{ev.location}</strong>
                          </span>
                        )}

                        {hasVendor && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Sparkles size={14} color="var(--accent-gold)" />
                            <span>Lead Vendor: <strong style={{ color: 'var(--text-main)' }}>{ev.assigned_vendor_name || 'Vendor Lead'}</strong></span>
                            {ev.vendor_id && (
                              <span className="id-badge id-badge-vnd">{formatVendorId(ev.vendor_id)}</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <Badge variant="success">
                      <CheckCircle size={12} style={{ marginRight: 3, verticalAlign: -1 }} /> Confirmed Slot
                    </Badge>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Planner Verified</span>
                  </div>
                </div>
              </div>
            );
          })}
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
    </div>
  );
}
