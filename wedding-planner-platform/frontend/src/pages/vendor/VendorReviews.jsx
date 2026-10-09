import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Star, MessageSquare, Reply, User, Calendar, CheckCircle } from 'lucide-react';

export default function VendorReviews() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reviews/vendor/my-reviews');
      if (res.data.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      showToast('Could not load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReview) return;

    try {
      setSubmitting(true);
      const res = await axios.put(`/api/reviews/${selectedReview.id}/respond`, {
        response_text: replyText.trim()
      });

      if (res.data.success) {
        showToast('Reply published successfully!', 'success');
        setReplyModalOpen(false);
        setSelectedReview(null);
        setReplyText('');
        fetchReviews();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit response', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.1) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Customer Reviews & Ratings</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Direct feedback from wedding couples for completed ceremonies. Responding builds trust and credibility.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EAB308' }}>
            ★ {avgRating}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Overall Score</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{reviews.length} Verified Reviews</div>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Yet"
          description="Customer testimonials will appear here once booked couples complete their wedding services."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reviews.map((rev) => (
            <div key={rev.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    {rev.customer_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{rev.customer_name || 'Wedding Couple'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Project: {rev.project_title || 'Wedding Ceremony'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#EAB308', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '2px' }}>
                    {'★'.repeat(rev.rating || 5)}
                    {'☆'.repeat(5 - (rev.rating || 5))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-main)', margin: '0.5rem 0 1rem 0' }}>
                "{rev.comment || 'Exceptional wedding service delivered with premier punctuality and craftsmanship.'}"
              </p>

              {/* Vendor Response Section */}
              {rev.response_text ? (
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: '4px solid var(--primary)',
                  padding: '0.85rem 1rem',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  marginTop: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                    Your Response:
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    "{rev.response_text}"
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setSelectedReview(rev);
                      setReplyText('');
                      setReplyModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Reply size={14} /> Respond to Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Modal
        isOpen={replyModalOpen}
        onClose={() => !submitting && setReplyModalOpen(false)}
        title="Reply to Customer Review"
      >
        <form onSubmit={handleReplySubmit}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Review from {selectedReview?.customer_name}</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              "{selectedReview?.comment}"
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Your Public Response *</label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="e.g. Thank you so much! It was an absolute honor to be part of your special wedding celebration..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={submitting}
              onClick={() => setReplyModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? 'Publishing...' : 'Publish Response'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
