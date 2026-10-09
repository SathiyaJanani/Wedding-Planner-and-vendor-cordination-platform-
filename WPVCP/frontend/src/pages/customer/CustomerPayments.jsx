import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatCustomerId, formatCurrency, formatDate } from '../../utils/formatters';
import {
  CreditCard, CheckCircle, Clock, DollarSign, ShieldCheck,
  Smartphone, Building, Lock, ArrowRight, Search, ArrowUpDown
} from 'lucide-react';

export default function CustomerPayments() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Payment method form state
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NET_BANKING'
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('890');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/payments/customer/my-payments');
      if (res.data.success) {
        setPayments(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      showToast('Could not load payment milestones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (payment) => {
    setSelectedPayment(payment);
    setSimulateFailure(false);
    setPayModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedPayment) return;

    try {
      setProcessing(true);
      const payload = {
        payment_id: selectedPayment.id,
        payment_method: paymentMethod === 'UPI' ? 'MOCK_UPI' : paymentMethod === 'CARD' ? 'MOCK_CARD' : 'MOCK_NETBANKING',
        upi_id: upiId,
        card_number: cardNumber.replace(/\s+/g, ''),
        simulate_failure: simulateFailure
      };

      const res = await axios.post('/api/payments/process', payload);
      if (res.data.success) {
        showToast(`Payment processed successfully! Ref: ${res.data.transaction_reference}`, 'success');
        setPayModalOpen(false);
        setSelectedPayment(null);
        fetchPayments();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment processing failed. You can retry payment.', 'error');
      fetchPayments();
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  const completed = payments.filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED');
  const pending = payments.filter(p => p.status === 'PENDING');
  const totalPaid = completed.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalPending = pending.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(225, 29, 72, 0.05) 100%)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Milestone Payment Schedule</h2>
            {user?.customer_id && (
              <span className="id-badge id-badge-cust">{formatCustomerId(user.customer_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Escrow-backed wedding disbursements structured in 3 clear installments for transparency and safety.
          </p>
        </div>

        <Badge variant="success">
          <ShieldCheck size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
          Escrow Protected
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          title="Total Paid to Date"
          value={`₹${totalPaid.toLocaleString('en-IN')}`}
          subtitle={`${completed.length} milestones settled`}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Pending Commitments"
          value={`₹${totalPending.toLocaleString('en-IN')}`}
          subtitle={`${pending.length} remaining payments`}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Installment Structure"
          value="25% • 50% • 25%"
          subtitle="Advance • Mid • Final"
          icon={CreditCard}
          color="primary"
        />
      </div>

      {/* Payments Milestones Cards */}
      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Milestones Generated Yet"
          description="Milestone payments are automatically scheduled as soon as you approve the arranged vendor team proposal."
          actionText="View Vendor Selection"
          onAction={() => window.location.href = '/customer/vendor-selection'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {payments.map((p, idx) => {
            const isCompleted = p.status === 'SUCCESS' || p.status === 'COMPLETED';
            return (
              <div key={p.id} className="card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                borderLeft: isCompleted ? '5px solid var(--status-success)' : '5px solid var(--primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 260 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(201, 149, 107, 0.15)',
                    color: isCompleted ? 'var(--status-success)' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isCompleted ? <ShieldCheck size={26} /> : <CreditCard size={24} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                        {p.milestone_name || p.title}
                      </h3>
                      <Badge variant={isCompleted ? 'success' : 'warning'}>
                        {isCompleted ? 'Paid & Confirmed' : 'Payment Due'}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Code: <strong style={{ color: 'var(--text-main)' }}>{p.payment_code || `#PAY-${p.id}`}</strong>
                      {p.due_date && (
                        <span> • Due: {new Date(p.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Installment Amount</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isCompleted ? 'var(--status-success)' : 'var(--text-main)' }}>
                      ₹{parseFloat(p.amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {isCompleted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--status-success)', fontWeight: 600, fontSize: '0.88rem' }}>
                      <CheckCircle size={16} /> Settled
                    </div>
                  ) : (
                    <button
                      onClick={() => openPayModal(p)}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem' }}
                    >
                      <Lock size={15} /> Pay Milestone
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Gateway Simulator Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => !processing && setPayModalOpen(false)}
        title="MOCK PAYMENT SYSTEM — Milestone Settlement"
      >
        <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {selectedPayment && (
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(201, 149, 107, 0.12) 100%)',
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedPayment.milestone_name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Ref: {selectedPayment.payment_code}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total to Pay</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{parseFloat(selectedPayment.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="form-label" style={{ fontWeight: 600 }}>Select Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`btn ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0.75rem 0.5rem' }}
              >
                <Smartphone size={20} />
                <span style={{ fontSize: '0.82rem' }}>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`btn ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0.75rem 0.5rem' }}
              >
                <CreditCard size={20} />
                <span style={{ fontSize: '0.82rem' }}>Credit/Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`btn ${paymentMethod === 'NET_BANKING' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0.75rem 0.5rem' }}
              >
                <Building size={20} />
                <span style={{ fontSize: '0.82rem' }}>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Conditional Input Fields */}
          {paymentMethod === 'UPI' && (
            <div className="form-group">
              <label className="form-label">UPI ID / VPA *</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="username@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Instant verification via BHIM, Google Pay, PhonePe, or Paytm UPI.
              </small>
            </div>
          )}

          {paymentMethod === 'CARD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Card Number *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Valid Thru *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/YY"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV / CVC *</label>
                  <input
                    type="password"
                    className="form-control"
                    maxLength={4}
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'NET_BANKING' && (
            <div className="form-group">
              <label className="form-label">Select Bank *</label>
              <select className="form-control" defaultValue="HDFC">
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="AXIS">Axis Bank</option>
                <option value="KOTAK">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          <div style={{
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: '8px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <input
              type="checkbox"
              id="simulateFailure"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="simulateFailure" style={{ fontSize: '0.82rem', color: '#c2410c', margin: 0, cursor: 'pointer' }}>
              <strong>Simulate Bank Decline (Failure Workflow):</strong> Check this to test PAYMENT_FAILED state, error alert, and retry capability without funds disbursed.
            </label>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            padding: '0.25rem 0'
          }}>
            <Lock size={14} color="var(--status-success)" />
            <span>Clearly Labeled <strong>MOCK PAYMENT SYSTEM</strong> for full-stack end-to-end evaluation.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={processing}
              onClick={() => setPayModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={processing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.75rem' }}
            >
              <ShieldCheck size={16} />
              {processing ? 'Processing Payment...' : `Confirm Pay ₹${parseFloat(selectedPayment?.amount || 0).toLocaleString('en-IN')}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
