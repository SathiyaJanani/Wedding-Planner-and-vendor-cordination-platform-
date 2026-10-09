import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { HelpCircle, Plus, Send, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function CustomerSupport() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    message: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/support');
      if (res.data.success) {
        setTickets(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      showToast('Could not load support requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) return;

    try {
      setSubmitting(true);
      const res = await axios.post('/api/support', ticketForm);
      if (res.data.success) {
        showToast('Support ticket dispatched to concierge team!', 'success');
        setModalOpen(false);
        setTicketForm({
          subject: '',
          category: 'GENERAL',
          priority: 'MEDIUM',
          message: ''
        });
        fetchTickets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Concierge Support & Helpdesk</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Get prompt assistance with billing, date adjustments, or concierge planning queries.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Open New Inquiry
        </button>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No Active Support Tickets"
          description="Need help with payment receipts, vendor coordination, or account settings? Our concierge is ready 24/7."
          actionText="Raise a Support Request"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {tickets.map((t) => (
            <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.subject}</span>
                    <Badge variant={t.status === 'RESOLVED' ? 'success' : t.status === 'IN_PROGRESS' ? 'warning' : 'primary'}>
                      {t.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Ticket #{t.ticket_number} • Category: {t.category} • Priority: {t.priority}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(t.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                {t.message}
              </p>

              {t.resolution_notes && (
                <div style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderLeft: '4px solid var(--status-success)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  fontSize: '0.86rem'
                }}>
                  <strong style={{ color: 'var(--status-success)' }}>Concierge Resolution:</strong> {t.resolution_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title="Create Support Ticket"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Subject / Issue Summary *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Question regarding Advance milestone payment invoice"
              value={ticketForm.subject}
              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
              >
                <option value="GENERAL">General Inquiry</option>
                <option value="BILLING">Billing & Payments</option>
                <option value="PLANNER_COORDINATION">Planner Coordination</option>
                <option value="VENDOR_ISSUE">Vendor Services</option>
                <option value="TECHNICAL">Platform & Technical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High (Urgent Wedding Event)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="Provide all context so the support concierge can resolve your query expeditiously..."
              value={ticketForm.message}
              onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={submitting}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
