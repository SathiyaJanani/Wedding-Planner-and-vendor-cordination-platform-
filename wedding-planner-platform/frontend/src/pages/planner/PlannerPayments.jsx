import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { CreditCard, DollarSign, CheckCircle, Clock, Search, ArrowUpDown } from 'lucide-react';

export default function PlannerPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('due_date_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const toast = useToast();

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, search, sortBy, currentPage, pageSize]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/payments', {
        params: {
          status: statusFilter,
          search,
          sort_by: sortBy,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res.data.success) {
        setPayments(res.data.data);
        setTotalItems(res.data.total || res.data.pagination?.totalItems || res.data.data.length);
      }
    } catch (e) {
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
          Milestone Payments & Escrow Ledger
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Track advance retainers, mid-term vendor lock-ins, and final settlement receipts.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by code, customer, project, milestone..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '100%' }}
          >
            <option value="due_date_asc">📅 Due Date (Soonest)</option>
            <option value="due_date_desc">📅 Due Date (Latest)</option>
            <option value="amount_desc">💰 Amount: High to Low</option>
            <option value="amount_asc">💰 Amount: Low to High</option>
            <option value="newest">🕒 Newest Added</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Status:
          </span>
          {[
            { key: '', label: 'All Payments' },
            { key: 'SUCCESS', label: '✅ Verified Payments' },
            { key: 'PENDING', label: '⏳ Pending Settlements' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : payments.length === 0 ? (
          <EmptyState title="No payments found" message="Processed client milestone payments will appear here." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Payment Code</th>
                  <th>Wedding Project</th>
                  <th>Customer</th>
                  <th>Milestone Title</th>
                  <th>Amount (₹)</th>
                  <th>Transaction Ref</th>
                  <th>Method</th>
                  <th>Due / Paid Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {p.payment_code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.project_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.project_code}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.customer_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.milestone_name}</div>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      {p.transaction_reference ? (
                        <code style={{ fontSize: '0.78rem', background: 'var(--bg-subtle)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                          {p.transaction_reference}
                        </code>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unprocessed</span>
                      )}
                    </td>
                    <td>
                      {p.payment_method ? (
                        <span className="badge badge-neutral">{p.payment_method.replace('MOCK_', '')}</span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{p.paid_at ? p.paid_at.slice(0, 10) : p.due_date}</td>
                    <td><Badge status={p.status} /></td>
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
          onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}
