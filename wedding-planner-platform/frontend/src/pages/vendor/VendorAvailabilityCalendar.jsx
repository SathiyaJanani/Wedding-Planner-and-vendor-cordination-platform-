import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VendorAvailabilityCalendar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);
  const [slots, setSlots] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slotForm, setSlotForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '22:00',
    status: 'AVAILABLE',
    reason: ''
  });

  // Filter state
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    fetchVendorAndSlots();
  }, []);

  const fetchVendorAndSlots = async () => {
    try {
      setLoading(true);
      const profRes = await axios.get('/api/vendors/profile/me');
      if (profRes.data.success && profRes.data.data) {
        const vId = profRes.data.data.id;
        setVendorId(vId);

        const slotRes = await axios.get(`/api/vendors/${vId}/availability`);
        if (slotRes.data.success) {
          setSlots(slotRes.data.data || []);
        }
      }
    } catch (err) {
      console.error('Error loading availability calendar:', err);
      showToast('Could not load availability records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!vendorId) return;

    try {
      setSaving(true);
      const res = await axios.post(`/api/vendors/${vendorId}/availability`, {
        date: slotForm.date,
        start_time: slotForm.start_time ? `${slotForm.start_time}:00` : '08:00:00',
        end_time: slotForm.end_time ? `${slotForm.end_time}:00` : '22:00:00',
        status: slotForm.status,
        reason: slotForm.reason
      });

      if (res.data.success) {
        showToast('Availability updated successfully!', 'success');
        setModalOpen(false);
        // Refresh
        const slotRes = await axios.get(`/api/vendors/${vendorId}/availability`);
        if (slotRes.data.success) {
          setSlots(slotRes.data.data || []);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save slot', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // Filter slots for current selected month
  const filteredSlots = slots.filter(s => s.date?.startsWith(filterMonth));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success">Available</Badge>;
      case 'BOOKED':
        return <Badge variant="primary">Booked</Badge>;
      case 'RESERVED':
        return <Badge variant="warning">Reserved / Pending</Badge>;
      case 'UNAVAILABLE':
      default:
        return <Badge variant="danger">Blocked / Unavailable</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Vendor Availability Calendar</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Mark your dates available, block personal time off, or monitor dates booked by wedding projects.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="month"
            className="form-control"
            style={{ width: 170 }}
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
          <button
            onClick={() => {
              setSlotForm({
                date: new Date().toISOString().split('T')[0],
                start_time: '08:00',
                end_time: '22:00',
                status: 'AVAILABLE',
                reason: ''
              });
              setModalOpen(true);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Update / Block Date
          </button>
        </div>
      </div>

      {/* Legend Card */}
      <div className="card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Availability Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--status-success)' }}></span>
          <strong>Available:</strong> Open for wedding proposals
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></span>
          <strong>Booked:</strong> Confirmed wedding project locked
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#EAB308' }}></span>
          <strong>Reserved:</strong> Pending request awaiting reply
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--status-danger)' }}></span>
          <strong>Blocked:</strong> Unavailable / Leave
        </div>
      </div>

      {/* Calendar Slots Grid / Table */}
      <div className="card">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 700 }}>
          Scheduled Dates for {new Date(`${filterMonth}-01`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </h3>

        {filteredSlots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <CalendarIcon size={38} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No custom blocked or booked dates recorded for this month.</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>By default, all dates are considered open for inquiries unless explicitly marked unavailable.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Event / Calendar Date</th>
                  <th>Time Hours</th>
                  <th>Status</th>
                  <th>Notes & Reasons</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot) => (
                  <tr key={slot.id || slot.date}>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(slot.date).toLocaleDateString('en-IN', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Clock size={14} />
                        {slot.start_time?.slice(0, 5) || '08:00'} - {slot.end_time?.slice(0, 5) || '22:00'}
                      </span>
                    </td>
                    <td>{getStatusBadge(slot.status)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {slot.reason || slot.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update / Set Availability Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Set Date Availability or Block Out"
      >
        <form onSubmit={handleSaveSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Select Date *</label>
            <input
              type="date"
              className="form-control"
              required
              value={slotForm.date}
              onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              className="form-control"
              value={slotForm.status}
              onChange={(e) => setSlotForm({ ...slotForm, status: e.target.value })}
            >
              <option value="AVAILABLE">AVAILABLE - Open for Inquiries</option>
              <option value="UNAVAILABLE">UNAVAILABLE - Block Date (Personal / Fully Booked)</option>
              <option value="BOOKED">BOOKED - Direct Wedding Booking</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control"
                value={slotForm.start_time}
                onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-control"
                value={slotForm.end_time}
                onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Event Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Wedding shoot in Udaipur, Studio maintenance, Personal vacation"
              value={slotForm.reason}
              onChange={(e) => setSlotForm({ ...slotForm, reason: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
