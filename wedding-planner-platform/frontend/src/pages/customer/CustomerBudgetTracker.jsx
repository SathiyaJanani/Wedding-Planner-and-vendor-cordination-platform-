import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { DollarSign, PieChart, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Layers } from 'lucide-react';

export default function CustomerBudgetTracker() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/budgets/customer/active');
      if (res.data.success) {
        setBudgetData(res.data.data || null);
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
      toast.error('Could not load budget data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  const summary = budgetData?.summary || {};
  const totalBudget = parseFloat(summary.total_budget || budgetData?.total_budget || 1500000);
  const totalAllocated = parseFloat(summary.allocated_amount || budgetData?.allocated_amount || 0);
  const totalPaid = parseFloat(summary.paid_amount || summary.spent_amount || budgetData?.spent_amount || 0);
  const totalPending = parseFloat(summary.pending_amount || Math.max(0, totalAllocated - totalPaid));
  const remainingBudget = parseFloat(summary.remaining_amount || Math.max(0, totalBudget - totalPaid));

  const percentUsed = totalBudget > 0 ? Math.min(100, Math.round((totalPaid / totalBudget) * 100)) : 0;
  const percentAllocated = totalBudget > 0 ? Math.min(100, Math.round((totalAllocated / totalBudget) * 100)) : 0;

  const serviceWise = budgetData?.service_wise || [];
  const items = budgetData?.items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 1040, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-cinzel" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
            Wedding Budget Tracker
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time financial status synchronized automatically whenever milestone payments are recorded.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBudget}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* SECTION 21: 5 KPI Cards (Total Budget, Total Allocated, Total Paid, Total Pending, Remaining Budget) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        {/* Total Wedding Budget */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Wedding Budget
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.35rem' }}>
            ₹{totalBudget.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Agreed Financial Target
          </div>
        </div>

        {/* Total Allocated */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Allocated
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>
            ₹{totalAllocated.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {percentAllocated}% committed
          </div>
        </div>

        {/* Total Paid */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Paid
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {percentUsed}% disbursed
          </div>
        </div>

        {/* Total Pending */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Pending
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.35rem' }}>
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Due across milestones
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Remaining Budget
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.35rem' }}>
            ₹{remainingBudget.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Surplus contingency
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Paid Disbursement Progress</span>
          <span style={{ fontWeight: 800, color: percentUsed > 90 ? 'var(--status-danger)' : 'var(--primary)' }}>
            {percentUsed}% Paid of Total Budget
          </span>
        </div>
        <div style={{
          width: '100%',
          height: 12,
          borderRadius: 6,
          background: 'var(--bg-subtle)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentUsed}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary) 0%, #22c55e 100%)',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* SECTION 21: Service Breakdown Table (Service | Total | Paid | Pending) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Service-Wise Budget Breakdown
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Live amounts calculated directly from confirmed contracts and completed payments.
          </p>
        </div>

        {serviceWise.length === 0 ? (
          <EmptyState
            title="No Service Allocations Yet"
            message="Your lead wedding planner is arranging vendors. As vendors are confirmed, the category financial breakdown will update automatically."
          />
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Service</th>
                  <th style={{ textAlign: 'right' }}>Total Contracted</th>
                  <th style={{ textAlign: 'right' }}>Paid Amount</th>
                  <th style={{ textAlign: 'right' }}>Pending Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {serviceWise.map((s, idx) => {
                  const total = Number(s.total_amount || 0);
                  const paid = Number(s.paid_amount || 0);
                  const pending = Number(s.pending_amount || Math.max(0, total - paid));

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        {s.service}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{total.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                        ₹{paid.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', color: pending > 0 ? '#ea580c' : 'var(--text-muted)', fontWeight: 600 }}>
                        ₹{pending.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${
                          pending === 0 && paid > 0 ? 'badge-success' :
                          paid > 0 ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {pending === 0 && paid > 0 ? 'Fully Paid' : paid > 0 ? 'Partially Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Itemized Category Allocations Table */}
      {items.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <h3 style={{ margin: '0', fontSize: '1.15rem', fontWeight: 700 }}>Planner Detailed Allocations</h3>
          </div>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Category / Item</th>
                  <th style={{ textAlign: 'right' }}>Estimated</th>
                  <th style={{ textAlign: 'right' }}>Actual / Contracted</th>
                  <th style={{ textAlign: 'right' }}>Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const est = parseFloat(item.estimated_cost || 0);
                  const act = parseFloat(item.actual_cost || est);
                  const pd = parseFloat(item.paid_cost || 0);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.item_name}</div>
                        {item.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.notes}</div>}
                      </td>
                      <td style={{ textAlign: 'right' }}>₹{est.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{act.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>₹{pd.toLocaleString('en-IN')}</td>
                      <td>
                        <Badge status={item.status || 'PLANNED'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
