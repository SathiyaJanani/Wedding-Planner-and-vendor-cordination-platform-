import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import {
  BarChart3, DollarSign, TrendingUp, Users, HeartHandshake, CheckSquare, Star, Clock,
  Calendar, Printer, Filter, Send, ArrowUpRight, CheckCircle, XCircle, AlertCircle,
  Download, Search, ArrowUpDown, Tag
} from 'lucide-react';

export default function ReportsPage() {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, bookings, requests
  const [vendorTab, setVendorTab] = useState('engagements'); // engagements, requests, reviews, lifetime
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorPageSize, setVendorPageSize] = useState(5);
  const toast = useToast();

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async (overridePeriod = period, overrideStart = customStart, overrideEnd = customEnd) => {
    try {
      setLoading(true);
      let url = `/api/reports?period=${overridePeriod}`;
      if (overridePeriod === 'custom') {
        url += `&startDate=${overrideStart}&endDate=${overrideEnd}`;
      }
      const res = await axios.get(url);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      toast.error('Please specify both start and end dates.');
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      toast.error('Start date cannot be after end date.');
      return;
    }
    fetchReportData('custom', customStart, customEnd);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !data) return <LoadingSkeleton rows={8} />;

  // Calculate percentage ratios for vendor requests
  const periodReqs = data?.period_kpis?.period_vendor_requests || 0;
  const acceptedReqs = data?.period_kpis?.period_accepted_requests || 0;
  const pendingReqs = data?.period_kpis?.period_pending_requests || 0;
  const declinedReqs = data?.period_kpis?.period_declined_requests || 0;

  const acceptedPct = periodReqs > 0 ? Math.round((acceptedReqs / periodReqs) * 100) : 0;
  const pendingPct = periodReqs > 0 ? Math.round((pendingReqs / periodReqs) * 100) : 0;
  const declinedPct = periodReqs > 0 ? Math.round((declinedReqs / periodReqs) * 100) : 0;

  // Max value for visual bar chart calculation
  const maxTrendVal = Math.max(
    ...(data?.monthly_trends || []).map(t => Number(t.revenue_collected || t.booking_value || 0)),
    1
  );

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={20} />
            </div>
            <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', margin: 0 }}>
              Performance Reports & Business Intelligence
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            {role === 'PLANNER'
              ? `Real-time financial analytics, booking pipeline, and vendor performance filtered by time period.`
              : `Aggregated metrics and performance insights.`}
          </p>
        </div>

        {(role === 'PLANNER' || role === 'VENDOR') && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {role === 'VENDOR' && (
              <button
                onClick={() => {
                  const items = data?.period_engagements || [];
                  if (items.length === 0) {
                    toast.info('No engagements to export in this period.');
                    return;
                  }
                  const headers = ['Booking Code', 'Project Title', 'Couple Name', 'Phone', 'Event Date', 'Agreed Price', 'Status'];
                  const rows = items.map(i => [
                    i.booking_code,
                    `"${(i.project_title || '').replace(/"/g, '""')}"`,
                    `"${(i.customer_name || '').replace(/"/g, '""')}"`,
                    i.customer_phone,
                    i.wedding_date,
                    i.agreed_price,
                    i.status
                  ]);
                  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `Vendor_Report_${data.startDate}_to_${data.endDate}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}
                title="Export report data as CSV"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}
              title="Print or save as PDF"
            >
              <Printer size={16} />
              <span>Print / Export PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* TIMEFRAME SELECTOR (For both PLANNER and VENDOR) */}
      {(role === 'PLANNER' || role === 'VENDOR') && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} color="var(--primary)" />
                <span>Report Timeframe:</span>
              </span>

              <div style={{ display: 'inline-flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                <button
                  onClick={() => setPeriod('weekly')}
                  className={`btn btn-sm ${period === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                >
                  Weekly (Last 7 Days)
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`btn btn-sm ${period === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                >
                  Monthly (Last 30 Days)
                </button>
                <button
                  onClick={() => setPeriod('yearly')}
                  className={`btn btn-sm ${period === 'yearly' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                >
                  Yearly (Year to Date)
                </button>
                <button
                  onClick={() => setPeriod('custom')}
                  className={`btn btn-sm ${period === 'custom' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                >
                  Custom Range
                </button>
              </div>
            </div>

            {/* Active Date Span Indicator */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Viewing: <strong style={{ color: 'var(--primary)' }}>{data?.startDate}</strong> to <strong style={{ color: 'var(--primary)' }}>{data?.endDate}</strong>
            </div>
          </div>

          {/* Custom Date Range Picker Form (Shown when custom is selected) */}
          {period === 'custom' && (
            <form onSubmit={handleApplyCustomDate} style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="form-input"
                  style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.55rem 1.25rem' }}>
                <Filter size={15} />
                <span>Generate Custom Report</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* PLANNER VIEW */}
      {role === 'PLANNER' && (
        <div>

          {/* Period KPI Summary Cards */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <StatCard
              title="Period Revenue Collected"
              value={`₹${Number(data?.period_kpis?.period_revenue_collected || 0).toLocaleString('en-IN')}`}
              subtitle={`Contract Value: ₹${Number(data?.period_kpis?.period_contract_value || 0).toLocaleString('en-IN')}`}
              icon={DollarSign}
              color="#10b981"
            />
            <StatCard
              title="Period Bookings"
              value={data?.period_kpis?.period_bookings || 0}
              subtitle="Active coordinated weddings"
              icon={CheckSquare}
              color="#8b5cf6"
            />
            <StatCard
              title="New Customers"
              value={data?.period_kpis?.period_customers || 0}
              subtitle="Couples registered in period"
              icon={Users}
              color="#3b82f6"
            />
            <StatCard
              title="Vendor Requests"
              value={periodReqs}
              subtitle={`${acceptedReqs} Accepted (${acceptedPct}%)`}
              icon={Send}
              color="#e11d48"
            />
          </div>

          {/* Graphical Trends & Vendor Pipeline Section */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {/* Visual Revenue & Bookings Trend Chart */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="card-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                  {period === 'weekly' ? 'Daily Bookings Trend' : period === 'yearly' ? 'Monthly Revenue Trend' : 'Periodic Revenue Distribution'}
                </h3>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                  {data?.monthly_trends?.length || 0} Data Points
                </span>
              </div>

              {(data?.monthly_trends || []).length === 0 ? (
                <EmptyState title="No trend records in this range" message="New bookings created during this timeframe will appear on this chart." />
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'flex-end' }}>
                  {/* Bars visual representation */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.75rem',
                    height: '180px',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--border)',
                    overflowX: 'auto'
                  }}>
                    {data.monthly_trends.map((t, idx) => {
                      const val = Number(t.revenue_collected || t.booking_value || 0);
                      const heightPct = Math.max(12, Math.min(100, Math.round((val / maxTrendVal) * 100)));
                      return (
                        <div key={idx} style={{
                          flex: 1,
                          minWidth: '42px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem',
                          height: '100%',
                          justifyContent: 'flex-end'
                        }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
                          </div>
                          <div
                            title={`${t.label}: ₹${val.toLocaleString('en-IN')} (${t.total_bookings} bookings)`}
                            style={{
                              width: '100%',
                              maxWidth: '36px',
                              height: `${heightPct}%`,
                              background: 'linear-gradient(180deg, var(--primary) 0%, rgba(197, 160, 89, 0.5) 100%)',
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s ease'
                            }}
                          />
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {t.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Total Period Bookings: <strong>{data.monthly_trends.reduce((acc, curr) => acc + curr.total_bookings, 0)} weddings</strong></span>
                    <span>Total Period Value: <strong>₹{data.monthly_trends.reduce((acc, curr) => acc + Number(curr.booking_value || 0), 0).toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Request Pipeline Efficiency */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>
                Vendor Request Coordination Pipeline
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Visual Ratio Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>Resolution Breakdown:</span>
                    <span style={{ color: 'var(--text-muted)' }}>{periodReqs} Total Dispatched</span>
                  </div>
                  <div style={{ height: '14px', background: 'var(--bg-subtle)', borderRadius: '7px', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: `${acceptedPct}%`, background: 'var(--status-success)', transition: 'width 0.3s ease' }} title={`Accepted: ${acceptedPct}%`} />
                    <div style={{ width: `${pendingPct}%`, background: 'var(--status-warning)', transition: 'width 0.3s ease' }} title={`Pending: ${pendingPct}%`} />
                    <div style={{ width: `${declinedPct}%`, background: 'var(--status-danger)', transition: 'width 0.3s ease' }} title={`Declined: ${declinedPct}%`} />
                  </div>
                </div>

                {/* Pipeline Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} color="var(--status-success)" />
                      <span style={{ fontSize: '0.88rem' }}>Accepted Vendor Bookings</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: 'var(--status-success)', fontSize: '0.95rem' }}>{acceptedReqs}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>({acceptedPct}%)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} color="var(--status-warning)" />
                      <span style={{ fontSize: '0.88rem' }}>Pending Vendor Responses</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: 'var(--status-warning)', fontSize: '0.95rem' }}>{pendingReqs}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>({pendingPct}%)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <XCircle size={16} color="var(--status-danger)" />
                      <span style={{ fontSize: '0.88rem' }}>Declined Requests (Need Alternate)</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: 'var(--status-danger)', fontSize: '0.95rem' }}>{declinedReqs}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>({declinedPct}%)</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Tip: Use the Vendor Requests portal to review any pending vendor responses or arrange replacement suppliers for declined dates.
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution for this Period */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
              Specialty Category Distribution in this Period
            </h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Verified Partners</th>
                    <th>Requests in Period</th>
                    <th>Accepted Engagement Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.category_distribution || []).map((c, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td>{c.vendor_count} verified</td>
                      <td>
                        <span className="badge badge-neutral">{c.request_count} requests</span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ₹{Number(c.accepted_amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Period Records Tabs */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`btn btn-sm ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Period Bookings ({data?.period_bookings?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Period Vendor Requests ({data?.period_requests?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('lifetime')}
                  className={`btn btn-sm ${activeTab === 'lifetime' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Lifetime Cumulative Overview
                </button>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Detailed Audit Log for {data?.startDate} to {data?.endDate}
              </div>
            </div>

            {/* Bookings Table */}
            {activeTab === 'bookings' && (
              <div>
                {(data?.period_bookings || []).length === 0 ? (
                  <EmptyState title="No bookings registered in this period" message="Select a wider date range or create new bookings." />
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Booking Code</th>
                          <th>Wedding Project</th>
                          <th>Couple</th>
                          <th>Event Date</th>
                          <th>Total Amount</th>
                          <th>Paid Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.period_bookings.map(b => (
                          <tr key={b.id}>
                            <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                              {b.booking_code}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{b.project_title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.project_code}</div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{b.customer_name}</td>
                            <td>{b.wedding_date}</td>
                            <td style={{ fontWeight: 700 }}>₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                            <td style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                              ₹{Number(b.paid_amount).toLocaleString('en-IN')}
                            </td>
                            <td><Badge status={b.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Vendor Requests Table */}
            {activeTab === 'requests' && (
              <div>
                {(data?.period_requests || []).length === 0 ? (
                  <EmptyState title="No vendor requests dispatched in this period" message="Select a wider timeframe or dispatch new vendor requests." />
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Request Code</th>
                          <th>Project</th>
                          <th>Vendor Brand</th>
                          <th>Category</th>
                          <th>Event Date</th>
                          <th>Fee (₹)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.period_requests.map(r => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                              {r.request_code}
                            </td>
                            <td>{r.project_title}</td>
                            <td style={{ fontWeight: 700 }}>{r.business_name}</td>
                            <td><span className="badge badge-neutral">{r.category_name}</span></td>
                            <td style={{ fontWeight: 600 }}>{r.event_date}</td>
                            <td style={{ fontWeight: 700 }}>₹{Number(r.proposed_price).toLocaleString('en-IN')}</td>
                            <td>
                              <Badge status={r.status} />
                              {r.decline_reason && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--status-danger)', marginTop: '0.2rem' }}>
                                  {r.decline_reason}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Lifetime Overview */}
            {activeTab === 'lifetime' && (
              <div className="grid-3" style={{ padding: '0.5rem 0' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All-Time Registered Couples</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.3rem', color: 'var(--text-main)' }}>
                    {data?.lifetime_kpis?.total_customers || 0}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All-Time Active Weddings</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.3rem', color: '#e11d48' }}>
                    {data?.lifetime_kpis?.active_weddings || 0}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All-Time Revenue Collected</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.3rem', color: '#10b981' }}>
                    ₹{Number(data?.lifetime_kpis?.total_revenue_collected || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VENDOR VIEW */}
      {role === 'VENDOR' && (
        <div>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <StatCard title="New Requests" value={data?.kpis?.new_requests || 0} icon={Clock} color="#f59e0b" />
            <StatCard title="Accepted Engagements" value={data?.kpis?.confirmed_engagements || 0} icon={CheckSquare} color="#10b981" />
            <StatCard title="Contracted Revenue" value={`₹${Number(data?.kpis?.total_contracted_earnings || 0).toLocaleString('en-IN')}`} icon={DollarSign} color="#e11d48" />
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Upcoming Contracted Engagements</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Wedding Project</th>
                    <th>Wedding Date</th>
                    <th>Venue</th>
                    <th>Customer Contact</th>
                    <th>Agreed Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.upcoming_engagements || []).map((e, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{e.project_title}</td>
                      <td style={{ fontWeight: 600 }}>{e.wedding_date}</td>
                      <td>{e.venue_name || e.city}</td>
                      <td>{e.customer_name} ({e.customer_phone})</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(e.agreed_price).toLocaleString('en-IN')}</td>
                      <td><Badge status={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER VIEW */}
      {role === 'CUSTOMER' && (
        <div>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <StatCard title="Days to Wedding" value={data?.days_remaining ?? '—'} subtitle="Countdown to the big day" icon={Clock} color="#e11d48" />
            <StatCard title="Arranged Vendors" value={data?.arranged_vendors?.length || 0} subtitle="Services locked" icon={CheckSquare} color="#10b981" />
            <StatCard title="Planning Progress" value={`${data?.progress_percentage || 0}%`} subtitle="Completed milestones" icon={TrendingUp} color="#3b82f6" />
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Coordinated Vendor Packages</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vendor Studio</th>
                    <th>Category</th>
                    <th>Service Scope</th>
                    <th>Agreed Rate</th>
                    <th>Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.arranged_vendors || []).map((v, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{v.business_name}</td>
                      <td><span className="badge badge-neutral">{v.category_name}</span></td>
                      <td>{v.service_name}</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(v.agreed_price).toLocaleString('en-IN')}</td>
                      <td><Badge status={v.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
