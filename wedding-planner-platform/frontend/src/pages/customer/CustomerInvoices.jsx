import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { Receipt, Download, Eye, Search, Filter, ArrowUpDown, RotateCcw, X } from 'lucide-react';

export default function CustomerInvoices() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Pagination, search & filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const searchTimer = useRef(null);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, pageSize, sortBy, statusFilter]);

  // Debounced search handler
  const handleSearchChange = (val) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setCurrentPage(1);
      fetchInvoices(val);
    }, 400);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const fetchInvoices = async (activeSearch = search) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        sort_by: sortBy
      };
      if (activeSearch && activeSearch.trim()) {
        params.search = activeSearch.trim();
      }
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await axios.get('/api/invoices', { params });
      if (res.data.success) {
        setInvoices(res.data.data || []);
        if (res.data.pagination) {
          setTotalItems(res.data.pagination.total || 0);
        } else {
          setTotalItems((res.data.data || []).length);
        }
      }
    } catch (err) {
      console.error('Error fetching customer invoices:', err);
      showToast('Could not load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFiltered = Boolean(search.trim() || statusFilter !== 'ALL' || sortBy !== 'newest');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1050, margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Invoices & Payment Receipts</h2>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Official GST tax invoices, audit trails, and confirmation receipts for all milestone transactions.
        </p>
      </div>

      {/* Control Bar: Search, Status, Sorting */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: search ? '2rem' : '0.8rem' }}
              placeholder="Search invoice # or wedding project..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{ minWidth: 160 }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
              <option value="due_date_asc">Earliest Due Date</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          {['ALL', 'PAID', 'PENDING', 'OVERDUE', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.78rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '20px',
                fontWeight: statusFilter === st ? 700 : 500
              }}
            >
              {st === 'ALL' ? 'All Invoices' : st}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Total: <strong>{totalItems}</strong> {totalItems === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : invoices.length === 0 ? (
        isFiltered ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <Receipt size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>No Matching Invoices Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.3rem 0 1rem' }}>
              No tax invoices match your active search or status filter.
            </p>
            <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No Invoices Yet"
            description="Invoices will be automatically generated as you settle milestone payments."
          />
        )
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Wedding Project</th>
                  <th>Issue Date</th>
                  <th>Total Amount</th>
                  <th>Tax Breakdown</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {inv.invoice_number || `INV-${inv.id}`}
                      </span>
                    </td>
                    <td>{inv.project_title || 'Wedding Celebration'}</td>
                    <td>
                      {new Date(inv.issue_date || inv.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{parseFloat(inv.total_amount || inv.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      GST 18%: ₹{parseFloat(inv.tax_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'OVERDUE' ? 'danger' : 'warning'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setViewModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={14} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(sz) => setPageSize(sz)}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      )}

      {/* Invoice Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Official Tax Receipt"
      >
        {selectedInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                  VOWS & VEILS WEDDING CONCIERGE
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GSTIN: 33AAACV9876Q1Z2</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{selectedInvoice.invoice_number}</div>
                <Badge variant={selectedInvoice.status === 'PAID' ? 'success' : 'warning'}>
                  {selectedInvoice.status}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Billed To:</div>
                <strong>{user?.full_name}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Date:</div>
                <strong>{new Date(selectedInvoice.issue_date || selectedInvoice.created_at).toLocaleDateString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Subtotal (Net Milestone):</span>
                <span>₹{parseFloat(selectedInvoice.subtotal || selectedInvoice.amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>GST (18%):</span>
                <span>₹{parseFloat(selectedInvoice.tax_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-color)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--status-success)'
              }}>
                <span>Total Amount Paid:</span>
                <span>₹{parseFloat(selectedInvoice.total_amount || selectedInvoice.amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={16} /> Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
