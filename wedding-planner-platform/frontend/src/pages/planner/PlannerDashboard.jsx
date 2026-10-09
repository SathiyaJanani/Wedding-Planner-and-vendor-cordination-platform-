import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import {
  Users, HeartHandshake, Send, CheckSquare, Clock, DollarSign,
  AlertCircle, ArrowRight, Calendar, Store, CreditCard
} from 'lucide-react';

export default function PlannerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/reports');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={6} />;

  const kpis = data?.kpis || {};
  const upcomingWeddings = data?.upcoming_weddings || [];

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Wedding Coordination Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Live enterprise analytics, vendor response pipelines, and upcoming nuptial milestones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/planner/projects" className="btn btn-primary btn-sm">
            <HeartHandshake size={16} />
            <span>Manage Projects</span>
          </Link>
          <Link to="/planner/vendors" className="btn btn-secondary btn-sm">
            <Store size={16} />
            <span>Vendor Categories</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Customers"
          value={kpis.total_customers || 0}
          subtitle="Couples registered"
          icon={Users}
          color="#3b82f6"
        />
        <StatCard
          title="Active Weddings"
          value={kpis.active_weddings || 0}
          subtitle="Under coordination"
          icon={HeartHandshake}
          color="#e11d48"
        />
        <StatCard
          title="Pending Requests"
          value={kpis.pending_requests || 0}
          subtitle="Awaiting vendor response"
          icon={Send}
          color="#f59e0b"
        />
        <StatCard
          title="Confirmed Bookings"
          value={kpis.confirmed_bookings || 0}
          subtitle="Advance payments received"
          icon={CheckSquare}
          color="#10b981"
        />
      </div>

      {/* Financial Overview Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div className="stat-label">Total Contracted Value</div>
          <div className="stat-val" style={{ color: 'var(--text-main)', fontSize: '1.75rem' }}>
            ₹{Number(kpis.total_contract_value || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Across all active wedding projects
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Total Revenue Collected</div>
          <div className="stat-val" style={{ color: 'var(--status-success)', fontSize: '1.75rem' }}>
            ₹{Number(kpis.total_revenue_collected || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Verified via milestone payment gateway
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Pending Milestones</div>
          <div className="stat-val" style={{ color: 'var(--status-warning)', fontSize: '1.75rem' }}>
            ₹{Number(kpis.pending_payments_amount || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Scheduled for second and final settlements
          </div>
        </div>
      </div>

      {/* Upcoming Weddings Section */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary)" />
            <h2 className="card-title">Upcoming Weddings in Pipeline</h2>
          </div>
          <Link to="/planner/projects" className="btn btn-secondary btn-sm">
            <span>View All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {upcomingWeddings.length === 0 ? (
          <EmptyState title="No upcoming weddings found" message="Create wedding projects from customer requirements." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Wedding Title</th>
                  <th>Customer</th>
                  <th>Wedding Date</th>
                  <th>Location</th>
                  <th>Target Budget</th>
                  <th>Project Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingWeddings.map(w => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>{w.project_code}</td>
                    <td style={{ fontWeight: 600 }}>{w.title}</td>
                    <td>{w.customer_name}</td>
                    <td>{w.wedding_date}</td>
                    <td>{w.city}</td>
                    <td>₹{Number(w.total_budget).toLocaleString('en-IN')}</td>
                    <td><Badge status={w.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Distribution Grid */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Curated Vendor Network Capacity</h2>
          <Link to="/planner/vendors" className="btn btn-secondary btn-sm">
            <span>Browse Directory</span>
          </Link>
        </div>
        <div className="grid-4">
          {(data?.category_distribution || []).map((cat, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
              <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                {cat.vendor_count} vendors
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
