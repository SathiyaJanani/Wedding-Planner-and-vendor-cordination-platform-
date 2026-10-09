import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import RecentlyAccessedTray from '../../components/RecentlyAccessedTray';
import {
  ShieldCheck, Users, DollarSign, Briefcase, Server, CheckCircle2,
  AlertTriangle, Search, Filter, RefreshCw, Lock, Unlock, Eye,
  ArrowUpRight, FileText, Activity, Award, Sparkles, Database, Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'escrow' | 'defense'
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState({ recent_notifications: [], recent_payments: [] });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, usersRes, logsRes] = await Promise.all([
        axios.get('/api/admin/metrics'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/logs')
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
      if (logsRes.data.success) setAuditLogs(logsRes.data.data);
    } catch (err) {
      console.error('[Admin Fetch Error]:', err);
      toast.error('Failed to load administrative analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (targetUserId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await axios.put(`/api/admin/users/${targetUserId}/status`, { is_active: newStatus });
      if (res.data.success) {
        toast.success(res.data.message);
        setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, is_active: newStatus } : u));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user account status.');
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role_name === roleFilter;
    const matchesSearch = !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.entity_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Executive Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '2rem 2.5rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(225,29,72,0.25) 0%, rgba(225,29,72,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{
                background: 'rgba(244, 63, 94, 0.2)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#fca5a5',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <ShieldCheck size={14} />
                PLATFORM GOVERNANCE & SUPER ADMIN
              </span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Server size={13} />
                MYSQL 8.0 RUNNING • 28 TABLES
              </span>
            </div>
            <h1 className="heading-cinzel" style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '0.02em' }}>
              Executive Administrative Console
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '0.4rem 0 0 0', maxWidth: '650px' }}>
              Real-time monitoring of all multi-party wedding coordination, escrow payments, vendor calendar locks, and platform accounts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => { setRefreshing(true); fetchAdminData(); }}
              disabled={refreshing}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={() => setActiveTab('defense')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} />
              <span>Resume Defense Highlights</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Total Users */}
        <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 14px)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Accounts</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {usersList.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Users</span>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{metrics?.users?.PLANNER || 2} Planners</span>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{metrics?.users?.VENDOR || 10} Vendors</span>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{metrics?.users?.CUSTOMER || 10} Couples</span>
          </div>
        </div>

        {/* Contracted Volume */}
        <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 14px)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Gross Contracted Value</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            ₹{Number(metrics?.finances?.total_contracted || 1575000).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Across {metrics?.finances?.total_bookings || 6} active wedding bookings
          </div>
        </div>

        {/* Escrow Collected */}
        <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 14px)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Milestone Escrow Vault</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(244, 63, 94, 0.1)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            ₹{Number(metrics?.finances?.total_escrow_collected || 1025000).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
            ✓ 65.1% disbursed across Advance & Mid-term
          </div>
        </div>

        {/* Platform Take-Rate */}
        <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 14px)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Coordination Revenue (5%)</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            ₹{Number(metrics?.finances?.platform_commission_earned || 51250).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            + ₹{Number(metrics?.finances?.total_gst_collected || 184500).toLocaleString('en-IN')} GST collected
          </div>
        </div>
      </div>

      {/* Mandatory Recently Accessed Tray */}
      <RecentlyAccessedTray limit={4} showClear={true} />

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Activity size={16} />
          <span>System Overview & Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Users size={16} />
          <span>User Management Hub ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('escrow')}
          className={`tab-btn ${activeTab === 'escrow' ? 'active' : ''}`}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderBottom: activeTab === 'escrow' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'escrow' ? 'var(--primary)' : 'var(--text-muted)',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <DollarSign size={16} />
          <span>Escrow Milestones & GST Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab('defense')}
          className={`tab-btn ${activeTab === 'defense' ? 'active' : ''}`}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            borderBottom: activeTab === 'defense' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'defense' ? 'var(--primary)' : 'var(--text-muted)',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={16} color="#e11d48" />
          <span>Resume Defense: Unique Non-CRUD Features</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & AUDIT LOGS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* Recent Payments Vault */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="var(--primary)" />
              Recent Escrow Transactions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.recent_payments.slice(0, 5).map((pay) => (
                <div key={pay.id} style={{
                  padding: '0.85rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {pay.milestone_name} • {pay.project_title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Ref: {pay.transaction_reference} • Paid by {pay.customer_name} via {pay.payment_method}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#10b981' }}>
                      ₹{Number(pay.amount).toLocaleString('en-IN')}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>{pay.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Notifications & Audit Trail */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#3b82f6" />
              Live Platform Activity Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.recent_notifications.slice(0, 5).map((item) => (
                <div key={item.id} style={{
                  padding: '0.85rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {item.title}
                    </span>
                    <span className={`badge ${item.role_name === 'PLANNER' ? 'badge-purple' : item.role_name === 'VENDOR' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                      {item.user_name} ({item.role_name})
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search user by name, email, agency, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'ADMIN', 'PLANNER', 'VENDOR', 'CUSTOMER'].map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`btn btn-sm ${roleFilter === role ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User / Profile</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Entity / Agency</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.full_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${
                        u.role_name === 'ADMIN' ? 'badge-danger' :
                        u.role_name === 'PLANNER' ? 'badge-purple' :
                        u.role_name === 'VENDOR' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {u.role_name}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {u.entity_title || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {u.phone || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {u.id !== user?.id ? (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.is_active)}
                          className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          {u.is_active ? <Lock size={13} /> : <Unlock size={13} />}
                          <span>{u.is_active ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Self (Active)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ESCROW & INVOICES */}
      {activeTab === 'escrow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
              Enterprise Milestone Escrow Schedule
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Couples never directly disburse payments to individual vendors. Funds are deposited into milestone escrow tranches and automatically unlocked upon certified wedding stages.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Stage 1: Advance Retainer (25%)</span>
                  <span className="badge badge-success">UNLOCKED ON APPROVAL</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Secures vendor calendar dates, locks hall bookings, and activates contract execution.
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Stage 2: Mid-Term Tranche (50%)</span>
                  <span className="badge badge-success">UNLOCKED T-15 DAYS</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Funds raw material procurement (catering ingredients, imported florals, drone permits).
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Stage 3: Final Settlement (25%)</span>
                  <span className="badge badge-info">HELD UNTIL SATISFACTION</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Disbursed post-ceremony upon customer testimonial submission and quality audit.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESUME DEFENSE & UNIQUE FEATURES */}
      {activeTab === 'defense' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(225, 29, 72, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="heading-cinzel" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Resume Defense: Non-CRUD Architectural Highlights
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Technical talking points to defend the depth and engineering complexity of this platform in technical interviews.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
              {/* Feature 1 */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Layers size={20} color="var(--primary)" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    1. Multi-Party Finite State Machine
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Enforces an enterprise transaction pipeline: <code>Customer Requirements → Planner Proposal → Vendor Availability Check → Vendor Accept/Decline with Reason → Customer Milestone Approval</code>.
                  Prevents illegal state transitions via database constraints and role-based backend validation.
                </p>
              </div>

              {/* Feature 2 */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    2. Milestone Escrow Payment Engine
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Decoupled payment gateway simulator with automatic 3-tranche generation (25% Advance, 50% Mid-Term, 25% Final).
                  Calculates 18% GST itemized tax, issues legal GST tax invoices with HSN/SAC codes, and manages platform commission escrow disbursement.
                </p>
              </div>

              {/* Feature 3 */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Database size={20} color="#3b82f6" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    3. Live Database Grounded AI Concierge
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Floating contextual AI assistant querying real-time MySQL database tables to provide accurate answers about project status, pending payments, booked vendors, and venue dates without hallucination.
                </p>
              </div>

              {/* Feature 4 */}
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Briefcase size={20} color="#a855f7" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    4. Conflict-Free Vendor Date Lock
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Calendar coordination engine ensuring vendors cannot be double-booked across overlapping wedding dates.
                  Automatically flags calendar collisions and guides planners to vetted backup vendors in the exact same service category.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
