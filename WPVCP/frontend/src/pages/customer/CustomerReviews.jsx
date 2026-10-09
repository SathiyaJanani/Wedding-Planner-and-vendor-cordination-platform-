import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Star, Plus, MessageSquare, HeartHandshake, CheckCircle } from 'lucide-react';

export default function CustomerReviews() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [booking, setBooking] = useState(null);

  // Review modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review_text: '',
    target_type: 'PLANNER', // 'PLANNER' or 'VENDOR'
    vendor_id: ''
  });

  useEffect(() => {
    fetchReviewsAndBooking();
  }, []);

  const fetchReviewsAndBooking = async () => {
    try {
      setLoading(true);
      const [revRes, bookRes] = await Promise.allSettled([
        axios.get('/api/reviews'),
        axios.get('/api/bookings/customer/active')
      ]);

      if (revRes.status === 'fulfilled' && revRes.value.data.success) {
        setReviews(revRes.value.data.data || []);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value.data.success) {
        setBooking(bookRes.value.data.data || null);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      showToast('Could not load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.review_text.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        wedding_project_id: booking?.wedding_project_id || null,
        booking_id: booking?.id || null,
        rating: reviewForm.rating,
        review_text: reviewForm.review_text.trim(),
        planner_id: reviewForm.target_type === 'PLANNER' ? (booking?.planner_id || null) : null,
        vendor_id: reviewForm.target_type === 'VENDOR' ? reviewForm.vendor_id : null
      };

      const res = await axios.post('/api/reviews', payload);
      if (res.data.success) {
        showToast('Review published successfully! Thank you for your feedback.', 'success');
        setModalOpen(false);
        setReviewForm({
          rating: 5,
          review_text: '',
          target_type: 'PLANNER',
          vendor_id: ''
        });
        fetchReviewsAndBooking();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  const services = booking?.services || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Reviews & Testimonials</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Rate and share your wedding celebration experience for your planner and vendor partners.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Write a Review
        </button>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Submitted Yet"
          description="Have you experienced exceptional service from your wedding planner or vendor team? Share your story!"
          actionText="Write First Review"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reviews.map((rev) => (
            <div key={rev.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {rev.vendor_business_name ? `Review for Vendor: ${rev.vendor_business_name}` : `Review for Planner: ${rev.planner_agency_name || 'Wedding Planner'}`}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Project: {rev.project_title || 'Wedding Celebration'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ color: '#EAB308', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '2px' }}>
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(rev.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                "{rev.comment || rev.review_text}"
              </p>

              {rev.response_text && (
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: '4px solid var(--primary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  marginTop: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                    Partner Response:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{rev.response_text}"
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title="Submit a Wedding Review"
      >
        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Review Target *</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="target_type"
                  checked={reviewForm.target_type === 'PLANNER'}
                  onChange={() => setReviewForm({ ...reviewForm, target_type: 'PLANNER', vendor_id: '' })}
                />
                Lead Wedding Planner
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="target_type"
                  checked={reviewForm.target_type === 'VENDOR'}
                  onChange={() => setReviewForm({ ...reviewForm, target_type: 'VENDOR' })}
                />
                Arranged Vendor Partner
              </label>
            </div>
          </div>

          {reviewForm.target_type === 'VENDOR' && (
            <div className="form-group">
              <label className="form-label">Select Vendor *</label>
              <select
                className="form-control"
                required
                value={reviewForm.vendor_id}
                onChange={(e) => setReviewForm({ ...reviewForm, vendor_id: e.target.value })}
              >
                <option value="">Select an arranged vendor</option>
                {services.map((s, idx) => (
                  <option key={s.vendor_id || idx} value={s.vendor_id}>
                    {s.vendor_name || s.business_name} ({s.category_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Star Rating (1 to 5) *</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '2rem',
                    color: star <= reviewForm.rating ? '#EAB308' : 'var(--border-color)',
                    padding: 0
                  }}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: '1rem', fontWeight: 700, marginLeft: 8 }}>
                {reviewForm.rating} / 5 Stars
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Review & Experience *</label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="Highlight their punctuality, hospitality, creative execution, and overall dedication to making your wedding unforgettable..."
              value={reviewForm.review_text}
              onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
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
              disabled={submitting || !reviewForm.review_text.trim()}
            >
              {submitting ? 'Submitting...' : 'Publish Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
