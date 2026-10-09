import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatCustomerId, formatVendorId, formatCurrency } from '../../utils/formatters';
import {
  Heart, Trash2, MapPin, Star, MessageSquare, Plus,
  Search, ArrowUpDown, ArrowRight, Store
} from 'lucide-react';

export default function CustomerWishlist() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  // Search & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // newest, rating_high, name_asc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/wishlists');
      if (res.data.success) {
        setWishlist(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
      showToast('Could not load saved wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await axios.delete(`/api/wishlists/${id}`);
      if (res.data.success) {
        showToast('Vendor removed from wishlist.', 'info');
        fetchWishlist();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove from wishlist', 'error');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // Categories
  const categories = ['ALL', ...new Set(wishlist.map(w => w.category_name).filter(Boolean))];

  // Filtering
  const filtered = wishlist.filter((item) => {
    const matchesCat = categoryFilter === 'ALL' || item.category_name === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (item.business_name || item.vendor_name || '').toLowerCase().includes(term) ||
      (item.category_name || '').toLowerCase().includes(term) ||
      (item.vendor_city || item.city || '').toLowerCase().includes(term) ||
      (item.notes || '').toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const ratingA = parseFloat(a.vendor_rating || a.rating || 5.0);
    const ratingB = parseFloat(b.vendor_rating || b.rating || 5.0);
    const nameA = (a.business_name || a.vendor_name || '').toLowerCase();
    const nameB = (b.business_name || b.vendor_name || '').toLowerCase();

    if (sortBy === 'rating_high') return ratingB - ratingA;
    if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Pagination slice
  const totalItems = sorted.length;
  const paginatedWishlist = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(225, 29, 72, 0.05) 100%)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>Wedding Inspiration Wishlist</h2>
            {user?.customer_id && (
              <span className="id-badge id-badge-cust">{formatCustomerId(user.customer_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Bookmarked artisans, decorators, venues, and photographers you would like your wedding planner to consider.
          </p>
        </div>

        <Link to="/customer/vendor-selection" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Store size={14} /> Browse More Vendors
        </Link>
      </div>

      {/* Filter and Search Bar */}
      {wishlist.length > 0 && (
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setCategoryFilter(cat);
                  setCurrentPage(1);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search saved..."
                style={{ paddingLeft: '2.4rem' }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                className="form-select"
                style={{ width: 160, fontSize: '0.86rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Recently Saved</option>
                <option value="rating_high">Highest Rated</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem' }}>
          <EmptyState
            icon={Heart}
            title="Your Wedding Wishlist is Empty"
            description="Save vendors and portfolio aesthetics you love to discuss with your dedicated wedding planner."
            actionText="Explore Curated Vendors"
            onAction={() => window.location.href = '/customer/vendor-selection'}
          />
        </div>
      ) : paginatedWishlist.length === 0 ? (
        <div className="card" style={{ padding: '2rem' }}>
          <EmptyState
            icon={Search}
            title="No Matching Saved Vendors"
            description="No wishlisted vendors match your current search criteria."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {paginatedWishlist.map((item) => {
              const vId = item.vendor_id;
              return (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Badge variant="primary">{item.category_name || 'Vendor Partner'}</Badge>
                        {vId && <span className="id-badge id-badge-vnd">{formatVendorId(vId)}</span>}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--status-danger)', padding: '0.25rem 0.45rem' }}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: 800 }}>
                      {item.business_name || item.vendor_name}
                    </h3>

                    <div style={{ display: 'flex', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={13} color="var(--primary)" /> {item.vendor_city || item.city || 'Bangalore'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#EAB308', fontWeight: 700 }}>
                        <Star size={13} fill="#EAB308" /> {item.vendor_rating || item.rating || '4.9'}
                      </span>
                    </div>

                    {item.notes && (
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Starting: <strong>{item.base_price ? formatCurrency(item.base_price) : 'Tier Rates'}</strong>
                    </span>
                    <Link to="/customer/messages" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MessageSquare size={13} /> Ask Planner
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24]}
          />
        </div>
      )}
    </div>
  );
}
