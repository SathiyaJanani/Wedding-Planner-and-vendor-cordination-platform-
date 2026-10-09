import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { XCircle, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

export default function VendorDeclinedRequests() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [declinedList, setDeclinedList] = useState([]);

  useEffect(() => {
    fetchDeclined();
  }, []);

  const fetchDeclined = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendor-requests?status=DECLINED');
      if (res.data.success) {
        setDeclinedList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching declined requests:', err);
      showToast('Could not load declined requests', 'error');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Declined Requests Archive</h2>
          <Badge variant="danger">{declinedList.length} Declined</Badge>
        </div>
        <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          History of wedding booking inquiries declined with recorded reasons for transparency with planners.
        </p>
      </div>

      {declinedList.length === 0 ? (
        <EmptyState
          icon={XCircle}
          title="No Declined Requests"
          description="You haven't declined any wedding booking requests. Good record of customer availability!"
        />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Project Title</th>
                  <th>Wedding Planner</th>
                  <th>Requested Date</th>
                  <th>Offered Price</th>
                  <th>Recorded Decline Reason</th>
                  <th>Date Declined</th>
                </tr>
              </thead>
              <tbody>
                {declinedList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {item.request_code || `#REQ-${item.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.project_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.service_name || 'Service Package'}
                      </div>
                    </td>
                    <td>{item.planner_name}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {new Date(item.event_date).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>₹{parseFloat(item.proposed_price || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{
                        maxWidth: 280,
                        background: 'rgba(239, 68, 68, 0.08)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--status-danger)',
                        fontSize: '0.84rem'
                      }}>
                        "{item.decline_reason || 'Date conflict / capacity limit'}"
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {item.responded_at ? new Date(item.responded_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
