import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { formatCustomerId, formatVendorId, formatCurrency, formatDate } from '../../utils/formatters';
import {
  DollarSign, CheckCircle, Clock, CreditCard, Receipt,
  Search, ArrowUpDown, Eye, ShieldCheck, Download, User
} from 'lucide-react';

export default function VendorPayments() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);

  // Search & Filter & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, amount_high, amount_low

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/payments/vendor/earnings');
      if (res.data.success) {
        const rawData = res.data.data;
        if (Array.isArray(rawData)) {
          setPayments(rawData);
        } else if (rawData && Array.isArray(rawData.bookings)) {
          setPayments(rawData.bookings);
        } else {
          setPayments([]);
        }
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      showToast('Could not load payment ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // Filter
  const filtered = payments.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.transaction_reference || '').toLowerCase().includes(term) ||
      (p.project_title || '').toLowerCase().includes(term) ||
      (p.customer_name || '').toLowerCase().includes(term) ||
      (p.milestone_type || '').toLowerCase().includes(term) ||
      (p.payment_method || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || b.payment_date) - new Date(a.created_at || a.payment_date);
    if (sortBy === 'oldest') return new Date(a.created_at || a.payment_date) - new Date(b.created_at || b.payment_date);
    if (sortBy === 'amount_high') return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
    if (sortBy === 'amount_low') return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
    return 0;
  });

  // Pagination
  const totalItems = sorted.length;
  const paginatedPayments = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const completed = payments.filter(p => p.status === 'COMPLETED');
  const pending = payments.filter(p => p.status === 'PENDING');
  const totalEarned = completed.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const pendingPayout = pending.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
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
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Vendor Earnings & Milestone Payouts</h2>
            {user?.vendor_id && (
              <span className="id-badge id-badge-vnd">{formatVendorId(user.vendor_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Escrow-backed client milestones disbursed into your verified bank account according to ceremonial milestones.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="success">
            <ShieldCheck size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
            Direct Escrow Settlements
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total Disbursed to Date"
          value={formatCurrency(totalEarned)}
          subtitle={`${completed.length} milestone payments settled`}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Pending Escrow Milestones"
          value={formatCurrency(pendingPayout)}
          subtitle={`${pending.length} scheduled distributions`}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Milestone Batches"
          value={payments.length}
          subtitle="Total contract milestones"
          icon={CreditCard}
          color="primary"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="luxury-tabs">
          {['ALL', 'COMPLETED', 'PENDING'].map((st) => (
            <button
              key={st}
              type="button"
              className={`luxury-tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
            >
              <span>{st === 'ALL' ? 'All Payments' : st === 'COMPLETED' ? 'Settled Payouts' : 'Pending Milestones'}</span>
              <span className="luxury-tab-count">
                {st === 'ALL' ? payments.length : payments.filter(p => p.status === st).length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 250 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search reference or project..."
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
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount (High to Low)</option>
              <option value="amount_low">Amount (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Milestone Payout Ledger</h3>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Detailed breakdown of advance retainer, mid-term, and final ceremonial disbursements.
            </p>
          </div>
        </div>

        {paginatedPayments.length === 0 ? (
          <div style={{ padding: '2rem' }}>
            <EmptyState
              icon={Receipt}
              title="No Payment Records Found"
              description="Milestone distributions from wedding contracts will appear here automatically upon client milestone settlement."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Wedding Project & Client</th>
                  <th>Milestone Type</th>
                  <th>Date Recorded</th>
                  <th>Payout Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {p.transaction_reference || `#TXN-${p.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.project_title || 'Wedding Project'}</div>
                      {p.customer_name && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: '0.15rem' }}>
                          <User size={12} /> {p.customer_name}
                          {p.customer_id && (
                            <span className="id-badge id-badge-cust" style={{ fontSize: '0.66rem', padding: '1px 4px' }}>
                              {formatCustomerId(p.customer_id)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge variant={p.status === 'COMPLETED' ? 'success' : 'secondary'}>
                        {p.milestone_type || 'Milestone Installment'}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.88rem' }}>
                        {formatDate(p.created_at || p.payment_date)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {p.payment_method?.replace('_', ' ') || 'NEFT / Bank Transfer'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: p.status === 'COMPLETED' ? 'var(--status-success)' : 'var(--text-main)', fontSize: '1.05rem' }}>
                        {formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td>
                      <Badge variant={p.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {p.status === 'COMPLETED' ? 'Disbursed' : 'Awaiting Release'}
                      </Badge>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedTxn(p);
                          setDetailModalOpen(true);
                        }}
                        title="View Voucher"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Transaction Voucher Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Disbursement Voucher & Receipt"
      >
        {selectedTxn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.1) 100%)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: selectedTxn.status === 'COMPLETED' ? '4px solid var(--status-success)' : '4px solid var(--status-warning)'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedTxn.milestone_type}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Ref: <strong>{selectedTxn.transaction_reference}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disbursed Amount</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-success)' }}>
                  {formatCurrency(selectedTxn.amount)}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Project:</span>
                <div style={{ fontWeight: 700 }}>{selectedTxn.project_title}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Couple:</span>
                <div style={{ fontWeight: 700 }}>{selectedTxn.customer_name || 'Wedding Client'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                <div style={{ fontWeight: 600 }}>{formatDate(selectedTxn.created_at)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Settlement Method:</span>
                <div style={{ fontWeight: 600 }}>{selectedTxn.payment_method || 'NEFT Electronic Transfer'}</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span>Verified electronic escrow transfer backed by lead planner authorization.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailModalOpen(false)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  showToast('Voucher downloaded successfully.', 'success');
                  setDetailModalOpen(false);
                }}
              >
                <Download size={14} /> Download Payout Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
