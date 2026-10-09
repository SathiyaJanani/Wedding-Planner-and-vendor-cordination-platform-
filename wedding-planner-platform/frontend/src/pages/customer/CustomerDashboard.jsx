import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  Heart, Calendar, Clock, DollarSign, Users, CheckCircle,
  ArrowRight, Sparkles, HeartHandshake, ShieldCheck, AlertCircle
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [booking, setBooking] = useState(null);
  const [budget, setBudget] = useState(null);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [projRes, bookRes, budgRes, schedRes] = await Promise.allSettled([
        axios.get('/api/projects/customer/active'),
        axios.get('/api/bookings/customer/active'),
        axios.get('/api/budgets/customer/active'),
        axios.get('/api/schedules/customer/active')
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.data.success) {
        setProject(projRes.value.data.data);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value.data.success) {
        setBooking(bookRes.value.data.data);
      }
      if (budgRes.status === 'fulfilled' && budgRes.value.data.success) {
        setBudget(budgRes.value.data.data);
      }
      if (schedRes.status === 'fulfilled' && schedRes.value.data.success) {
        setSchedule(schedRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Customer dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  // Calculate days remaining to wedding date
  const weddingDateStr = project?.wedding_date;
  let daysRemaining = null;
  if (weddingDateStr) {
    const diff = new Date(weddingDateStr) - new Date();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const vendorsArranged = booking?.services?.length || 0;
  const isAwaitingApproval = booking?.status === 'VENDOR_ARRANGED' || booking?.status === 'CUSTOMER_REVIEW';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Wedding Countdown Hero Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.15) 100%)',
        border: '1px solid var(--border-color)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {project ? project.title : `Welcome, ${user?.full_name}`}
              </span>
              {project?.status && (
                <Badge variant="primary">{project.status.replace('_', ' ')}</Badge>
              )}
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 650 }}>
              {project
                ? `Coordinating your dream celebration with dedicated lead planner ${project.planner_name || 'Assigned Lead'}.`
                : 'Submit your wedding requirements to begin your personalized planning journey.'}
            </p>
          </div>

          {weddingDateStr && (
            <div style={{
              background: 'var(--bg-secondary)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              minWidth: 160
            }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                {daysRemaining}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Days Until Wedding
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {new Date(weddingDateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>

        {/* Action Callout if planner arranged vendors waiting for customer approval */}
        {isAwaitingApproval && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid #EAB308',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={22} color="#EAB308" />
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Vendor Proposal Ready for Your Review!</strong>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Your wedding planner has finalized quotes from verified vendors. Please review and approve or request adjustments.
                </div>
              </div>
            </div>
            <Link to="/customer/vendor-selection" className="btn btn-primary btn-sm">
              Review & Approve Selection <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Wedding Budget"
          value={`₹${parseFloat(project?.estimated_budget || budget?.total_budget || 0).toLocaleString('en-IN')}`}
          subtitle={`₹${parseFloat(budget?.total_spent || 0).toLocaleString('en-IN')} committed`}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Arranged Vendors"
          value={vendorsArranged}
          subtitle="Coordinated partners"
          icon={Users}
          color="secondary"
        />
        <StatCard
          title="Booking Stage"
          value={booking?.status?.replace('_', ' ') || 'REQUIREMENTS'}
          subtitle="Wedding lifecycle"
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Ceremony Events"
          value={schedule.length}
          subtitle="Itinerary timeline"
          icon={Clock}
          color="warning"
        />
      </div>

      {/* Two Column Section: Assigned Planner & Wedding Day Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Planner Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Your Wedding Planner</h3>
              <Badge variant="success">Assigned</Badge>
            </div>

            {project?.planner_name ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 54,
                    height: 54,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800
                  }}>
                    {project.planner_name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{project.planner_name}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                      {project.agency_name || 'Vows & Veils Premier Planning'}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
                    <strong>{project.planner_experience || '8+'} Years</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Contact Phone:</span>
                    <strong>{project.planner_phone || '+91 98765 43210'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Official Email:</span>
                    <strong>{project.planner_email || 'planner@vowsandveils.com'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Once your requirements are reviewed, our concierge pairs you with a top wedding planner.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/customer/planner" className="btn btn-secondary btn-block" style={{ display: 'flex', justifyContent: 'center' }}>
              Planner Profile
            </Link>
            <Link to="/customer/messages" className="btn btn-primary btn-block" style={{ display: 'flex', justifyContent: 'center' }}>
              Send Message
            </Link>
          </div>
        </div>

        {/* Schedule Highlights */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Ceremony Timeline</h3>
              <Link to="/customer/schedule" className="btn btn-ghost btn-sm">View All</Link>
            </div>

            {schedule.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                Your itinerary will be scheduled as wedding milestones are locked in.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {schedule.slice(0, 4).map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--primary)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.location || 'Wedding Venue'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {new Date(item.event_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.start_time?.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Link to="/customer/schedule" className="btn btn-secondary btn-block" style={{ display: 'flex', justifyContent: 'center' }}>
              Open Full Wedding Itinerary
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
