import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { CheckSquare, Calendar, Clock, DollarSign, User, ShieldCheck } from 'lucide-react';

export default function VendorAcceptedBookings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [acceptedList, setAcceptedList] = useState([]);

  useEffect(() => {
    fetchAccepted();
  }, []);

  const fetchAccepted = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendor-requests?status=ACCEPTED');
      if (res.data.success) {
        setAcceptedList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching accepted bookings:', err);
      showToast('Could not load accepted bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  const totalValue = acceptedList.reduce((acc, curr) => acc + (parseFloat(curr.proposed_price) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Accepted & Confirmed Bookings</h2>
            <Badge variant="success">{acceptedList.length} Engagements</Badge>
          </div>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Requests you have confirmed. The wedding planner arranges these into customer proposals and contracts.
          </p>
        </div>

        <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <DollarSign size={22} color="var(--status-success)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Booked Volume</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--status-success)' }}>
              ₹{totalValue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {acceptedList.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Accepted Bookings Yet"
          description="When you accept booking inquiries from wedding planners, they will appear here as confirmed commitments."
        />
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Wedding Project</th>
                  <th>Planner</th>
                  <th>Wedding Date</th>
                  <th>Hours</th>
                  <th>Service Contract</th>
                  <th>Agreed Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {acceptedList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        {item.request_code || `#REQ-${item.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.project_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Client: {item.customer_name || 'Wedding Couple'}
                      </div>
                    </td>
                    <td>{item.planner_name}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {new Date(item.event_date).toLocaleDateString('en-IN', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>{item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}</td>
                    <td>{item.service_name || 'All-Inclusive Package'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>
                        ₹{parseFloat(item.proposed_price || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <Badge variant="success">
                        <ShieldCheck size={13} style={{ marginRight: 3, verticalAlign: -2 }} /> Confirmed
                      </Badge>
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
