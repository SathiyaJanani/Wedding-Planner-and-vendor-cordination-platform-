import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import {
  ListOrdered, CheckCircle2, Clock, DollarSign, Users,
  HeartHandshake, Sparkles, ArrowRight, ShieldCheck, Store, RefreshCw, CreditCard
} from 'lucide-react';

export default function CustomerBookingStatus() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchLifecycle();
  }, []);

  const fetchLifecycle = async () => {
    try {
      setLoading(true);
      const [projRes, bookRes, payRes] = await Promise.allSettled([
        axios.get('/api/projects/customer/active'),
        axios.get('/api/bookings/customer/active'),
        axios.get('/api/payments/customer/my-payments')
      ]);

      if (projRes.status === 'fulfilled' && projRes.value.data.success) {
        setProject(projRes.value.data.data);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value.data.success) {
        setBooking(bookRes.value.data.data);
      }
      if (payRes.status === 'fulfilled' && payRes.value.data.success) {
        setPayments(payRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error loading booking status:', err);
      toast.error('Could not load booking status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  // Determine stage states
  const hasSubmittedReq = true;
  const hasProject = !!project;
  const hasArrangedVendors = booking && booking.services && booking.services.length > 0;
  const isCustomerApproved = booking && ['CUSTOMER_APPROVED', 'PARTIALLY_PAID', 'CONFIRMED', 'FULLY_PAID'].includes(booking.status);
  const hasAdvancePaid = payments.some(p => p.milestone_name === 'Advance' && p.status === 'COMPLETED');
  const isFullyPaid = payments.length > 0 && payments.every(p => p.status === 'COMPLETED');

  const steps = [
    {
      title: '1. Requirements Submitted',
      desc: 'Guest count, target dates, customs & budget submitted',
      isComplete: hasSubmittedReq,
      isActive: !hasProject
    },
    {
      title: '2. Planner Paired & Project Created',
      desc: project ? `Project "${project.title}" led by ${project.planner_name}` : 'Awaiting planner allocation',
      isComplete: hasProject,
      isActive: hasProject && !hasArrangedVendors
    },
    {
      title: '3. Vendor Availability Checked & Requested',
      desc: 'Planner checks real-time dates and negotiates with verified vendors',
      isComplete: hasArrangedVendors,
      isActive: hasArrangedVendors && !isCustomerApproved
    },
    {
      title: '4. Couple Approval of Vendor Team',
      desc: isCustomerApproved ? 'Arranged vendors approved by you' : 'Action needed: Review and approve quotes',
      isComplete: isCustomerApproved,
      isActive: isCustomerApproved && !hasAdvancePaid,
      actionLink: !isCustomerApproved && hasArrangedVendors ? '/customer/vendor-selection' : null,
      actionText: 'Review Selection'
    },
    {
      title: '5. Advance Milestone Paid (25%)',
      desc: hasAdvancePaid ? 'Advance retainer received. Vendor dates locked!' : 'Advance payment secures vendor contracts',
      isComplete: hasAdvancePaid,
      isActive: hasAdvancePaid && !isFullyPaid,
      actionLink: isCustomerApproved && !hasAdvancePaid ? '/customer/payments' : null,
      actionText: 'Pay Advance'
    },
    {
      title: '6. Wedding Execution & Final Settlement',
      desc: isFullyPaid ? 'All milestones fulfilled. Celebration ready!' : 'Mid-term and final milestone disbursements',
      isComplete: isFullyPaid,
      isActive: false
    }
  ];

  // Calculate totals from contracted services
  const services = booking?.services || [];
  const totalAgreed = services.reduce((sum, s) => sum + Number(s.agreed_price || 0), 0);
  const totalPaid = services.reduce((sum, s) => sum + Number(s.paid_amount || 0), 0);
  const totalPending = Math.max(0, totalAgreed - totalPaid);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 1040, margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.12) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="heading-cinzel" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
              Wedding Booking Status
            </h1>
            <Badge status={booking?.status || 'ACTIVE'} />
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Follow your wedding progress from vendor arrangements to payment milestones and service completion.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', textAlign: 'right' }}>
          {booking && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Reference</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>
                {booking.booking_code || `#BKG-${booking.id}`}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={fetchLifecycle}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SECTION 17: Service-Wise Amounts Breakdown Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Contracted Services & Payment Breakdown
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Exact MySQL-synchronized financial summary for each arranged service vendor.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Total: </span>
              <strong>₹{totalAgreed.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Paid: </span>
              <strong style={{ color: '#16a34a' }}>₹{totalPaid.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Pending: </span>
              <strong style={{ color: totalPending > 0 ? '#ea580c' : 'var(--text-muted)' }}>₹{totalPending.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        {services.length === 0 ? (
          <EmptyState
            title="No Services Contracted Yet"
            message="Your lead wedding planner is arranging vendors. Once arranged, service-wise quotes and payment details will appear here."
          />
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Vendor / Studio</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  <th style={{ textAlign: 'right' }}>Amount Pending</th>
                  <th>Payment Status</th>
                  <th>Booking Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => {
                  const agreed = Number(s.agreed_price || 0);
                  const paid = Number(s.paid_amount || 0);
                  const pending = Math.max(0, agreed - paid);
                  const payStatus = paid >= agreed ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';

                  return (
                    <tr key={s.id}>
                      {/* Service */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                          {s.category_name || s.service_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {s.service_name}
                        </div>
                      </td>

                      {/* Vendor */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                          {s.business_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {s.vendor_city || 'Bangalore'}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{agreed.toLocaleString('en-IN')}
                      </td>

                      {/* Amount Paid */}
                      <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>
                        ₹{paid.toLocaleString('en-IN')}
                      </td>

                      {/* Amount Pending */}
                      <td style={{ textAlign: 'right', color: pending > 0 ? '#ea580c' : 'var(--text-muted)', fontWeight: 600 }}>
                        ₹{pending.toLocaleString('en-IN')}
                      </td>

                      {/* Payment Status */}
                      <td>
                        <span className={`badge ${
                          payStatus === 'PAID' ? 'badge-success' :
                          payStatus === 'PARTIAL' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {payStatus}
                        </span>
                      </td>

                      {/* Booking Status */}
                      <td>
                        <Badge status={s.status || booking.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick Payment Link if Pending */}
        {totalPending > 0 && (
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Outstanding milestone balance: <strong style={{ color: '#ea580c' }}>₹{totalPending.toLocaleString('en-IN')}</strong>. Payments immediately update booking status and your Budget Tracker.
            </div>
            <Link
              to="/customer/payments"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CreditCard size={15} />
              <span>Make Milestone Payment</span>
            </Link>
          </div>
        )}
      </div>

      {/* Interactive Step-by-Step Progress */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', fontWeight: 800 }}>
          Coordination Milestones
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative' }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              position: 'relative'
            }}>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: 17,
                  top: 36,
                  bottom: -22,
                  width: 2,
                  background: step.isComplete ? '#10b981' : 'var(--border)',
                  zIndex: 1
                }} />
              )}

              {/* Status Circle */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: step.isComplete ? '#10b981' : step.isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                color: step.isComplete || step.isActive ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: step.isComplete || step.isActive ? 'none' : '2px solid var(--border)',
                zIndex: 2,
                flexShrink: 0
              }}>
                {step.isComplete ? <CheckCircle2 size={20} /> : idx + 1}
              </div>

              {/* Step Info */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: step.isComplete ? 'var(--text-main)' : step.isActive ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {step.title}
                  </h4>
                  {step.isComplete && <span className="badge badge-success">Completed</span>}
                  {step.isActive && <span className="badge badge-warning">In Progress</span>}
                </div>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  {step.desc}
                </p>

                {step.actionLink && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <Link to={step.actionLink} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {step.actionText} <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
