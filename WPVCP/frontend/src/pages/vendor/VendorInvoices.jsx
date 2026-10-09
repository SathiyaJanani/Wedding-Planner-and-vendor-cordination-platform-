import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Receipt, Download, Eye, FileText, CheckCircle } from 'lucide-react';

export default function VendorInvoices() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/invoices');
      if (res.data.success) {
        setInvoices(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      showToast('Could not load billing invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Vendor Billing Statements & Invoices</h2>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Official tax receipts and invoices generated for wedding booking transactions.
        </p>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Invoices Available"
          description="Invoices will be automatically generated upon payment confirmations and milestones."
        />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Project Reference</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Tax (GST)</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                    <td>{inv.project_title || 'Wedding Project'}</td>
                    <td>
                      {new Date(inv.issue_date || inv.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td>
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        ₹{parseFloat(inv.total_amount || inv.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>₹{parseFloat(inv.tax_amount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>
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
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Official Tax Invoice Statement"
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
                  VOWS & VEILS PLATFORM
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
                <div style={{ color: 'var(--text-muted)' }}>Billed For Project:</div>
                <strong>{selectedInvoice.project_title}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Date Issued:</div>
                <strong>{new Date(selectedInvoice.issue_date || selectedInvoice.created_at).toLocaleDateString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Subtotal (Net Service Fee):</span>
                <span>₹{parseFloat(selectedInvoice.subtotal || selectedInvoice.amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Goods & Services Tax (GST 18%):</span>
                <span>₹{parseFloat(selectedInvoice.tax_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-color)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--primary)'
              }}>
                <span>Total Disbursed:</span>
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
                onClick={() => {
                  window.print();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={16} /> Print / Download
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
