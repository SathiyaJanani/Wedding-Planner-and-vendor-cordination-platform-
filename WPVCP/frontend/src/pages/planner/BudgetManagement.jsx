import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { 
  DollarSign, Plus, Trash2, PieChart, TrendingUp, CheckCircle, Clock, 
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Store, Layers, RefreshCw
} from 'lucide-react';

export default function BudgetManagement() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [budget, setBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'services' | 'vendors' | 'items'

  // Items search, filter, sort & pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('cost_desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Add Item Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category_id: '',
    estimated_cost: 50000,
    actual_cost: 0,
    paid_cost: 0,
    status: 'PLANNED',
    notes: ''
  });

  // Load Projects and Categories
  useEffect(() => {
    async function loadInitial() {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/vendors/categories')
        ]);
        if (pRes.data.success && pRes.data.data.length > 0) {
          setProjects(pRes.data.data);
          setSelectedProjectId(pRes.data.data[0].id);
        }
        if (cRes.data.success) {
          setCategories(cRes.data.data || []);
          if (cRes.data.data.length > 0) {
            setFormData(prev => ({ ...prev, category_id: cRes.data.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load initial budget data', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Fetch Budget for selected project
  const fetchBudget = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        category_id: categoryFilter || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy
      };

      const res = await axios.get(`/api/budgets/project/${selectedProjectId}`, { params });
      if (res.data.success) {
        setBudget(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load project budget details.');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, search, categoryFilter, statusFilter, sortBy]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!budget) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/api/budgets/items', {
        ...formData,
        budget_id: budget.id
      });
      if (res.data.success) {
        toast.success('Budget item recorded successfully!');
        setIsAddOpen(false);
        setFormData({
          item_name: '',
          category_id: categories[0]?.id || '',
          estimated_cost: 50000,
          actual_cost: 0,
          paid_cost: 0,
          status: 'PLANNED',
          notes: ''
        });
        fetchBudget();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add budget item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this budget item?')) return;
    try {
      const res = await axios.delete(`/api/budgets/items/${id}`);
      if (res.data.success) {
        toast.success('Budget item removed.');
        fetchBudget();
      }
    } catch (err) {
      toast.error('Failed to delete budget item.');
    }
  };

  const summary = budget?.summary || {
    total_budget: 0,
    allocated_amount: 0,
    paid_amount: 0,
    pending_amount: 0,
    remaining_amount: 0
  };

  // Pagination for line items
  const items = budget?.items || [];
  const totalPages = Math.ceil(items.length / limit) || 1;
  const paginatedItems = items.slice((page - 1) * limit, page * limit);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Budget Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Real-time financial tracking, service-wise expenditure, vendor settlements, and budget allocations.
          </p>
        </div>

        {/* Project Selector & Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="form-input"
            value={selectedProjectId}
            onChange={(e) => { setSelectedProjectId(e.target.value); setPage(1); }}
            style={{ fontWeight: 600, minWidth: '220px' }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title} ({p.project_code})</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>

          <button
            type="button"
            onClick={fetchBudget}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Total, Allocated, Paid, Pending, Remaining (Section 11) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {/* Total Wedding Budget */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Wedding Budget
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            ₹{Number(summary.total_budget || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Approved by Client
          </div>
        </div>

        {/* Total Allocated */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Allocated Amount
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>
            ₹{Number(summary.allocated_amount || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {summary.total_budget > 0 ? `${Math.round((summary.allocated_amount / summary.total_budget) * 100)}% committed` : 'Allocated'}
          </div>
        </div>

        {/* Total Paid */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Paid Amount
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            ₹{Number(summary.paid_amount || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Verified via MySQL Transactions
          </div>
        </div>

        {/* Pending Amount */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending Amount
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
            ₹{Number(summary.pending_amount || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Due to Vendors / Contracts
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Remaining Budget
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.35rem' }}>
            ₹{Number(summary.remaining_amount || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Available for additional services
          </div>
        </div>
      </div>

      {/* Navigation Subtabs: Service-wise, Vendor-wise, Itemized Breakdown */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: '6px 6px 0 0' }}
        >
          <Layers size={15} style={{ marginRight: '0.35rem' }} />
          Service-Wise Breakdown ({budget?.service_wise?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vendors')}
          className={`btn btn-sm ${activeTab === 'vendors' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: '6px 6px 0 0' }}
        >
          <Store size={15} style={{ marginRight: '0.35rem' }} />
          Vendor-Wise Breakdown ({budget?.vendor_wise?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`btn btn-sm ${activeTab === 'items' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ borderRadius: '6px 6px 0 0' }}
        >
          <PieChart size={15} style={{ marginRight: '0.35rem' }} />
          Line Items & Allocations ({items.length})
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          {/* 1. SERVICE-WISE BREAKDOWN (Section 11) */}
          {activeTab === 'services' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Service-Wise Budget Expenditure</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Category-level summary showing committed, disbursed, and balance funds per service.
                </p>
              </div>

              {(!budget?.service_wise || budget.service_wise.length === 0) ? (
                <EmptyState title="No Service Breakdown" message="Add line items or contract vendors to see category breakdown." />
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Wedding Service</th>
                        <th style={{ textAlign: 'right' }}>Total Allocated</th>
                        <th style={{ textAlign: 'right' }}>Amount Paid</th>
                        <th style={{ textAlign: 'right' }}>Pending Balance</th>
                        <th>Settlement Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.service_wise.map((s, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {s.service}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                            ₹{Number(s.total_amount).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                            ₹{Number(s.paid_amount).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'right', color: s.pending_amount > 0 ? '#ea580c' : 'var(--text-muted)', fontWeight: 600 }}>
                            ₹{Number(s.pending_amount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className={`badge ${
                              s.pending_amount === 0 && s.paid_amount > 0 ? 'badge-success' :
                              s.paid_amount > 0 ? 'badge-warning' : 'badge-neutral'
                            }`}>
                              {s.pending_amount === 0 && s.paid_amount > 0 ? 'Fully Paid' : s.paid_amount > 0 ? 'Partially Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. VENDOR-WISE BREAKDOWN (Section 11) */}
          {activeTab === 'vendors' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Vendor-Wise Contract Breakdown</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Direct contractor payouts, agreements, paid disbursements, and outstanding invoices.
                </p>
              </div>

              {(!budget?.vendor_wise || budget.vendor_wise.length === 0) ? (
                <EmptyState title="No Vendor Contracts" message="Contract vendors from Selected Vendors to track vendor-wise budget." />
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Vendor / Studio</th>
                        <th>Service & Category</th>
                        <th style={{ textAlign: 'right' }}>Agreed Amount</th>
                        <th style={{ textAlign: 'right' }}>Disbursed (Paid)</th>
                        <th style={{ textAlign: 'right' }}>Outstanding</th>
                        <th>Settlement Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.vendor_wise.map((v, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {v.vendor_name}
                          </td>
                          <td>
                            <div>{v.service_name}</div>
                            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{v.category}</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            ₹{Number(v.total_amount).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                            ₹{Number(v.paid_amount).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'right', color: v.pending_amount > 0 ? '#ea580c' : 'var(--text-muted)', fontWeight: 600 }}>
                            ₹{Number(v.pending_amount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span className={`badge ${
                              v.payment_status === 'FULLY_PAID' ? 'badge-success' :
                              v.payment_status === 'PARTIALLY_PAID' ? 'badge-warning' : 'badge-neutral'
                            }`}>
                              {v.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. ITEM-LEVEL ALLOCATIONS WITH PAGINATION & SEARCH (Section 11) */}
          {(activeTab === 'items' || activeTab === 'summary') && (
            <div>
              {/* Item Filters Bar */}
              <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  alignItems: 'flex-end'
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Search Items</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search item name, notes..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                      <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</label>
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

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</label>
                    <select
                      className="form-input"
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                      <option value="">All Statuses</option>
                      <option value="PLANNED">Planned</option>
                      <option value="BOOKED">Booked</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Sort By</label>
                    <select
                      className="form-input"
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    >
                      <option value="cost_desc">Cost (High to Low)</option>
                      <option value="cost_asc">Cost (Low to High)</option>
                      <option value="name_asc">Item Name (A-Z)</option>
                      <option value="paid_desc">Paid Amount (High to Low)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Itemized Budget Allocation</h3>
                </div>

                {paginatedItems.length === 0 ? (
                  <EmptyState title="No Budget Items" message="No budget items match your criteria. Click 'Add Item' to record an allocation." />
                ) : (
                  <div className="table-responsive">
                    <table className="table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Category</th>
                          <th style={{ textAlign: 'right' }}>Estimated Cost</th>
                          <th style={{ textAlign: 'right' }}>Actual Cost</th>
                          <th style={{ textAlign: 'right' }}>Paid Disbursed</th>
                          <th>Status</th>
                          <th>Notes</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedItems.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              {item.item_name}
                            </td>
                            <td>
                              <span className="badge badge-neutral" style={{ fontSize: '0.78rem' }}>
                                {item.category_name || 'General'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              ₹{Number(item.estimated_cost).toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                              ₹{Number(item.actual_cost || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                              ₹{Number(item.paid_cost || 0).toLocaleString('en-IN')}
                            </td>
                            <td>
                              <Badge status={item.status} />
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                              {item.notes || '—'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id)}
                                className="btn btn-ghost btn-sm"
                                style={{ color: '#ef4444', padding: '0.3rem' }}
                                title="Delete Line Item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.25rem',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Showing <strong>{paginatedItems.length}</strong> of <strong>{items.length}</strong> items</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span>Size:</span>
                      <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        className="form-input"
                        style={{ padding: '0.15rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="btn btn-secondary btn-sm"
                    >
                      <ChevronLeft size={15} />
                      <span>Prev</span>
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.4rem' }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="btn btn-secondary btn-sm"
                    >
                      <span>Next</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Budget Item Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Budget Allocation Item"
      >
        <form onSubmit={handleAddItem}>
          <div className="form-group">
            <label className="form-label">Service Item Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Royal Banquet Hall, Premium Catering, Drone Photography"
              value={formData.item_name}
              onChange={(e) => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Service Category *</label>
            <select
              className="form-input"
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Estimated (₹) *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.estimated_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Actual Cost (₹)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.actual_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Paid So Far (₹)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.paid_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, paid_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="PLANNED">PLANNED</option>
              <option value="BOOKED">BOOKED</option>
              <option value="PAID">PAID</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Vendor Details</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Payment terms, contract milestones, invoice references..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block"
            >
              {submitting ? 'Saving...' : 'Add Budget Allocation'}
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
