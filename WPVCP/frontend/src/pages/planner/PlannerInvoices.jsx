import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { Receipt, Eye, Printer, Download, Sparkles } from 'lucide-react';

export default function PlannerInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('/api/invoices');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = async (id) => {
    try {
      const res = await axios.get(`/api/invoices/${id}`);
      if (res.data.success) {
        setSelectedInvoice(res.data.data);
        setIsViewOpen(true);
      }
    } catch (e) {
      toast.error('Failed to load invoice details.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
          Invoices & Billing Statements
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Auto-generated digital billing receipts and tax statements for couples and vendors.
        </p>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : invoices.length === 0 ? (
          <EmptyState title="No invoices issued yet" message="Invoices are generated upon milestone payments." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Billed To</th>
                  <th>Wedding Project</th>
                  <th>Milestone Title</th>
                  <th>Invoice Amount</th>
                  <th>Billing Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {inv.invoice_number}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.recipient_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inv.recipient_email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.project_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inv.booking_code}</div>
                    </td>
                    <td>{inv.milestone_name || inv.payment_title || 'Service Deposit'}</td>
                    <td style={{ fontWeight: 800 }}>₹{Number(inv.total_amount).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.85rem' }}>{inv.created_at ? inv.created_at.slice(0, 10) : inv.due_date}</td>
                    <td><Badge status={inv.status} /></td>
                    <td>
                      <button
                        onClick={() => handleOpenInvoice(inv.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', gap: '0.3rem' }}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Viewer Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Invoice ${selectedInvoice?.invoice_number || ''}`} maxWidth="680px">
        {selectedInvoice && (
          <div style={{ padding: '1rem', background: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>
                  VOWS & VEILS
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Elite Wedding Coordination Platform</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedInvoice.invoice_number}</div>
                <Badge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Issued To:</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedInvoice.recipient_name}</div>
                <div>{selectedInvoice.recipient_email}</div>
                <div>{selectedInvoice.recipient_phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Project:</div>
                <div style={{ fontWeight: 700 }}>{selectedInvoice.project_title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Wedding Date: {selectedInvoice.wedding_date}</div>
              </div>
            </div>

            {/* Total Block */}
            <div style={{
              padding: '1.25rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Milestone Payment Settlement</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Transaction Ref: {selectedInvoice.transaction_reference || 'N/A'} ({selectedInvoice.payment_method || 'UPI'})
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
                ₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', gap: '0.4rem' }}
              >
                <Printer size={15} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
