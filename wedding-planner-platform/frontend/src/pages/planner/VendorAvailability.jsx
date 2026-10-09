import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import {
  CalendarCheck, Calendar, Clock, Store, CheckCircle, AlertTriangle, XCircle, Search, ShieldCheck
} from 'lucide-react';

export default function VendorAvailability() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [checkDate, setCheckDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('21:00:00');

  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedVendorId) {
      fetchVendorCalendar(selectedVendorId);
    }
  }, [selectedVendorId]);

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/api/vendors');
      if (res.data.success && res.data.data.length > 0) {
        setVendors(res.data.data);
        setSelectedVendorId(res.data.data[0].id);
      }
    } catch (e) {
      toast.error('Failed to load vendors list.');
    }
  };

  const fetchVendorCalendar = async (vId) => {
    try {
      const res = await axios.get(`/api/vendors/${vId}/availability`);
      if (res.data.success) {
        setCalendarEvents(res.data.data);
      }
    } catch (e) {
      // quiet
    }
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!selectedVendorId || !checkDate) {
      toast.error('Please select a vendor and date.');
      return;
    }

    setChecking(true);
    setCheckResult(null);

    try {
      const res = await axios.get(
        `/api/vendors/${selectedVendorId}/availability/check?date=${checkDate}&start_time=${startTime}&end_time=${endTime}`
      );
      if (res.data.success) {
        setCheckResult(res.data);
        if (res.data.available) {
          toast.success(`Vendor is AVAILABLE on ${checkDate}!`);
        } else {
          toast.error(`Vendor is ${res.data.status} on ${checkDate}.`);
        }
      }
    } catch (err) {
      toast.error('Failed to query availability.');
    } finally {
      setChecking(false);
    }
  };

  const selectedVendor = vendors.find(v => v.id === parseInt(selectedVendorId, 10));

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
          Vendor Availability Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Database-level verification checking existing bookings, reservations, and schedules to prevent double bookings.
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Verification Query Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarCheck size={20} color="var(--primary)" />
            <span>Check Date & Time Availability</span>
          </h3>

          <form onSubmit={handleCheckAvailability}>
            <div className="form-group">
              <label className="form-label">Select Vendor</label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="form-select"
                required
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.business_name} ({v.category_name} - {v.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Wedding / Event Date</label>
              <input
                type="date"
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={checking}
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop: '0.5rem' }}
            >
              <ShieldCheck size={18} />
              <span>{checking ? 'Querying Database Locks...' : 'Verify Availability'}</span>
            </button>
          </form>

          {/* Result Banner */}
          {checkResult && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${checkResult.available ? 'var(--status-success)' : 'var(--status-danger)'}`,
              background: checkResult.available ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              {checkResult.available ? (
                <CheckCircle size={24} color="var(--status-success)" />
              ) : (
                <AlertTriangle size={24} color="var(--status-danger)" />
              )}
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: checkResult.available ? 'var(--status-success)' : 'var(--status-danger)'
                }}>
                  STATUS: {checkResult.status}
                </div>
                <div style={{ fontSize: '0.88rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>
                  {checkResult.message}
                </div>
                {checkResult.available && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Safe to dispatch booking request. This slot will be temporarily reserved.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected Vendor Profile & Calendar Log */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Vendor Calendar Status</h3>
          {selectedVendor ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedVendor.business_name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selectedVendor.category_name} • {selectedVendor.city}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedVendor.price_range}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)' }}>★ {selectedVendor.rating} ({selectedVendor.total_reviews} reviews)</div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Blocked or Reserved Dates in Database:</h4>
              {calendarEvents.length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No explicit calendar exclusions found. Dates default to AVAILABLE unless booked.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {calendarEvents.map(evt => (
                    <div key={evt.id} style={{
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{evt.date}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{evt.reason || 'Not specified'}</div>
                      </div>
                      <Badge status={evt.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Select a vendor from the left to view calendar entries.</p>
          )}
        </div>
      </div>
    </div>
  );
}
