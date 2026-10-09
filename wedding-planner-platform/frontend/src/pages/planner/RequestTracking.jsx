import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import {
  ListOrdered, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, Store, Search
} from 'lucide-react';

export default function RequestTracking() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`/api/vendor-requests?status=${statusFilter}`);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load tracked requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleArrange = async (reqId) => {
    try {
      const res = await axios.post('/api/vendor-requests/arrange', { request_id: reqId });
      if (res.data.success) {
        toast.success('Vendor successfully arranged! Customer notified for approval.');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to arrange vendor.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
          Vendor Request Tracking & Replacement Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Real-time tracking of vendor acceptance, decline explanations, and fast-track replacement workflows.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All Requests' },
          { key: 'PENDING', label: '⏳ Pending Response' },
          { key: 'ACCEPTED', label: '✅ Accepted by Vendor' },
          { key: 'DECLINED', label: '❌ Declined Requests' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`btn btn-sm ${statusFilter === tab.key ? 'btn-primary' : 'btn-secondary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : requests.length === 0 ? (
          <EmptyState title="No requests match this filter" message="All vendor coordination requests will be monitored here." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request Code</th>
                  <th>Vendor Brand</th>
                  <th>Category</th>
                  <th>Wedding Project</th>
                  <th>Offer Price</th>
                  <th>Status & Response Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {r.request_code}
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.business_name}</td>
                    <td><span className="badge badge-neutral">{r.category_name}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.project_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Date: {r.event_date}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{Number(r.proposed_price).toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <Badge status={r.status} />
                        {r.status === 'DECLINED' && (
                          <div style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--status-danger-bg)',
                            color: 'var(--status-danger)',
                            fontSize: '0.78rem',
                            lineHeight: 1.4,
                            maxWidth: '280px'
                          }}>
                            <strong>Reason:</strong> {r.decline_reason || 'Unavailable for this time window'}
                          </div>
                        )}
                        {r.status === 'ACCEPTED' && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--status-success)', fontWeight: 600 }}>
                            Ready to Arrange in Proposal
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {r.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => handleArrange(r.id)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'flex', gap: '0.3rem' }}
                        >
                          <span>Arrange in Project</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : r.status === 'DECLINED' ? (
                        <button
                          onClick={() => navigate('/planner/vendors')}
                          className="btn btn-gold btn-sm"
                          style={{ display: 'flex', gap: '0.3rem' }}
                        >
                          <Store size={14} />
                          <span>Find Replacement</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Awaiting reply</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
