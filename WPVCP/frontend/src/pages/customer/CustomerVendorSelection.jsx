import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useRecentlyAccessed } from '../../context/RecentlyAccessedContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatCustomerId, formatVendorId, formatCurrency } from '../../utils/formatters';
import {
  CheckSquare, Check, CheckCircle, XCircle, ArrowRight, DollarSign, Store, Sparkles,
  AlertCircle, Heart, Star, MapPin, Search, ArrowUpDown, Eye, ShieldCheck,
  Calendar, Phone, Mail, Award, Plus, Trash2, Users, Layers
} from 'lucide-react';
import WeddingHallMap from '../../components/WeddingHallMap';

export default function CustomerVendorSelection() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { trackRecent } = useRecentlyAccessed();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [allPartnerVendors, setAllPartnerVendors] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistMap, setWishlistMap] = useState({}); // vendor_id -> wishlist item id
  const [actionLoading, setActionLoading] = useState(false);

  // Active View Tab: 'browse' (Browse All Partner Vendors) | 'lineup' (My Wedding Lineup)
  const [viewTab, setViewTab] = useState('browse');
  const [allCategories, setAllCategories] = useState([]);

  // Search, Filter, Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating_high'); // rating_high, price_low, price_high, name_asc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Request change modal
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');

  // Vendor Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);

  // Approve Confirm Modal
  const [approveConfirmModalOpen, setApproveConfirmModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [bookingRes, wishlistRes, vendorRes, catRes] = await Promise.all([
        axios.get('/api/bookings/customer/active').catch(() => ({ data: { data: null } })),
        axios.get('/api/wishlists').catch(() => ({ data: { data: [] } })),
        axios.get('/api/vendors?limit=100').catch(() => ({ data: { data: [] } })),
        axios.get('/api/vendors/categories').catch(() => ({ data: { data: [] } }))
      ]);

      if (bookingRes.data?.success && bookingRes.data?.data) {
        setBooking(bookingRes.data.data);
      }

      if (wishlistRes.data?.success) {
        const items = wishlistRes.data.data || [];
        const ids = new Set(items.map(w => w.vendor_id));
        const mapping = {};
        items.forEach(w => { if (w.vendor_id) mapping[w.vendor_id] = w.id; });
        setWishlistIds(ids);
        setWishlistMap(mapping);
      }

      if (vendorRes.data?.success) {
        const list = Array.isArray(vendorRes.data.data) ? vendorRes.data.data : [];
        setAllPartnerVendors(list);
      }

      if (catRes.data?.success && Array.isArray(catRes.data.data)) {
        setAllCategories(catRes.data.data);
      }

    } catch (err) {
      console.error('Error loading vendor selection data:', err);
      showToast('Could not load arranged vendor proposal', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Direct Vendor Selection by Customer
  const handleSelectVendor = async (vendor) => {
    const vId = vendor.vendor_id || vendor.id;
    if (!vId) return;

    try {
      setActionLoading(true);
      const res = await axios.post('/api/bookings/customer/select-vendor', {
        vendor_id: vId,
        agreed_price: vendor.base_price || 25000
      });

      if (res.data.success) {
        showToast(res.data.message || `Selected "${vendor.business_name || vendor.vendor_name}" for your wedding!`, 'success');
        // Refresh booking data
        const bRes = await axios.get('/api/bookings/customer/active').catch(() => ({ data: { data: null } }));
        if (bRes.data?.success && bRes.data?.data) {
          setBooking(bRes.data.data);
        }
        // Auto-switch to lineup tab so user immediately sees their wedding team
        setViewTab('lineup');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to select vendor', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove vendor from customer wedding booking
  const handleRemoveVendor = async (vendor) => {
    const vId = vendor.vendor_id || vendor.id;
    const existingService = booking?.services?.find(s => s.vendor_id === vId);
    const sId = existingService?.id || (vendor.vendor_id ? vendor.id : null);

    const vendorName = vendor.business_name || vendor.vendor_name || 'this vendor';
    if (!window.confirm(`Remove "${vendorName}" from your wedding team?`)) return;

    try {
      setActionLoading(true);
      const res = await axios.post('/api/bookings/customer/remove-vendor', {
        vendor_id: vId,
        service_id: sId
      });

      if (res.data.success) {
        showToast('Vendor removed from your wedding team.', 'info');
        const bRes = await axios.get('/api/bookings/customer/active').catch(() => ({ data: { data: null } }));
        if (bRes.data?.success && bRes.data?.data) {
          setBooking(bRes.data.data);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove vendor', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleWishlist = async (vendor) => {
    const vId = vendor.vendor_id || vendor.id;
    if (!vId) return;

    try {
      if (wishlistIds.has(vId)) {
        const wId = wishlistMap[vId];
        if (wId) {
          await axios.delete(`/api/wishlists/${wId}`);
          const newSet = new Set(wishlistIds);
          newSet.delete(vId);
          setWishlistIds(newSet);
          showToast(`Removed "${vendor.vendor_name || vendor.business_name}" from your Wishlist.`, 'info');
        }
      } else {
        const res = await axios.post('/api/wishlists', {
          vendor_id: vId,
          notes: 'Saved from wedding vendor selection directory'
        });
        if (res.data.success) {
          const newSet = new Set(wishlistIds);
          newSet.add(vId);
          setWishlistIds(newSet);
          if (res.data.wishlist_id) {
            setWishlistMap(prev => ({ ...prev, [vId]: res.data.wishlist_id }));
          }
          showToast(`Added "${vendor.vendor_name || vendor.business_name}" to your Wishlist!`, 'success');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  const handleApprove = async () => {
    if (!booking?.id) return;
    try {
      setActionLoading(true);
      const res = await axios.put(`/api/bookings/${booking.id}/approve`);
      if (res.data.success) {
        showToast('Vendor arrangement approved! Milestone payment schedules generated. Redirecting...', 'success');
        setApproveConfirmModalOpen(false);
        setTimeout(() => {
          navigate('/customer/payments');
        }, 1200);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve selection', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeSubmit = async (e) => {
    e.preventDefault();
    if (!booking?.id || !changeNotes.trim()) return;

    try {
      setActionLoading(true);
      const res = await axios.put(`/api/bookings/${booking.id}/request-change`, {
        change_notes: changeNotes.trim()
      });
      if (res.data.success) {
        showToast('Change request dispatched to your wedding planner!', 'info');
        setChangeModalOpen(false);
        setChangeNotes('');
        fetchInitialData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request changes', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  // Active Lineup Vendors
  const lineupVendors = Array.isArray(booking?.services) ? booking.services : [];
  const selectedVendorIds = new Set(lineupVendors.map(v => v.vendor_id));

  // Determine list of vendors to display based on viewTab
  const rawList = viewTab === 'lineup' ? lineupVendors : allPartnerVendors;

  // Extract unique categories for filter
  const categoryNamesFromDb = allCategories.map(c => c.name);
  const categories = ['ALL', ...new Set([...categoryNamesFromDb, ...rawList.map(v => v.category_name)].filter(Boolean))];

  // Filtering
  const filtered = rawList.filter((v) => {
    const matchesCat = categoryFilter === 'ALL' || v.category_name === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (v.vendor_name || v.business_name || '').toLowerCase().includes(term) ||
      (v.category_name || '').toLowerCase().includes(term) ||
      (v.service_name || '').toLowerCase().includes(term) ||
      (v.city || v.vendor_city || '').toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const priceA = parseFloat(a.price || a.agreed_price || a.base_price || 0);
    const priceB = parseFloat(b.price || b.agreed_price || b.base_price || 0);
    const ratingA = parseFloat(a.vendor_rating || a.rating || 5.0);
    const ratingB = parseFloat(b.vendor_rating || b.rating || 5.0);
    const nameA = (a.vendor_name || a.business_name || '').toLowerCase();
    const nameB = (b.vendor_name || b.business_name || '').toLowerCase();

    if (sortBy === 'rating_high') return ratingB - ratingA;
    if (sortBy === 'price_low') return priceA - priceB;
    if (sortBy === 'price_high') return priceB - priceA;
    if (sortBy === 'name_asc') return nameA.localeCompare(nameB);
    return 0;
  });

  // Pagination slice
  const totalItems = sorted.length;
  const paginatedVendors = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalAmount = parseFloat(booking?.total_amount || 0);
  const isApproved = booking && ['CUSTOMER_APPROVED', 'PARTIALLY_PAID', 'CONFIRMED', 'FULLY_PAID'].includes(booking.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(225, 29, 72, 0.05) 100%)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>
              Wedding Vendor Selection & Lineup
            </h2>
            {booking && (
              <Badge variant={isApproved ? 'success' : 'warning'}>
                {booking.status?.replace('_', ' ')}
              </Badge>
            )}
            {user?.customer_id && (
              <span className="id-badge id-badge-cust">{formatCustomerId(user.customer_id)}</span>
            )}
          </div>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {viewTab === 'lineup'
              ? `Review your wedding artisan lineup (${lineupVendors.length} selected). Approve the team or browse partner vendors to add replacements.`
              : 'Browse verified partner venues, photographers, caterers, and decorators. Add favorites directly to your wedding team.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <Link
            to="/customer/wishlist"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Heart size={15} color="var(--primary)" fill="var(--primary)" />
            <span>Wishlist ({wishlistIds.size})</span>
          </Link>

          {totalAmount > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consolidated Total</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>
                {formatCurrency(totalAmount)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dual-View Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '0.25rem',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => { setViewTab('lineup'); setCurrentPage(1); setCategoryFilter('ALL'); }}
          className={`btn ${viewTab === 'lineup' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <Sparkles size={16} />
          <span>My Wedding Lineup</span>
          <span style={{
            background: viewTab === 'lineup' ? '#fff' : 'var(--primary)',
            color: viewTab === 'lineup' ? 'var(--primary)' : '#fff',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: 800
          }}>
            {lineupVendors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setViewTab('browse'); setCurrentPage(1); setCategoryFilter('ALL'); }}
          className={`btn ${viewTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
        >
          <Store size={16} />
          <span>Browse All Partner Vendors</span>
          <span style={{
            background: viewTab === 'browse' ? '#fff' : 'var(--bg-subtle)',
            color: viewTab === 'browse' ? 'var(--primary)' : 'var(--text-main)',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '0.75rem',
            fontWeight: 800
          }}>
            {allPartnerVendors.length}
          </span>
        </button>
      </div>

      {/* Decision Banner (Shown in Lineup Tab when vendors present and not yet approved) */}
      {viewTab === 'lineup' && lineupVendors.length > 0 && !isApproved && (
        <div style={{
          padding: '1.35rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(225, 29, 72, 0.08) 100%)',
          border: '1.5px solid #EAB308',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary)" />
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                Step 3: Approval Needed to Lock In Your Vendor Team
              </div>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              Are you happy with this arranged vendor lineup ({lineupVendors.length} services)? Click <strong>"Approve Vendor Team (OK)"</strong> to lock vendor dates and generate your 3 milestone payment installments.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setChangeModalOpen(true)}
              disabled={actionLoading}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--status-danger)' }}
            >
              <XCircle size={16} /> Request Changes
            </button>
            <button
              type="button"
              onClick={() => setApproveConfirmModalOpen(true)}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.6rem', fontWeight: 700 }}
            >
              <Check size={18} /> Approve Vendor Team (OK)
            </button>
          </div>
        </div>
      )}

      {/* Approved Status Banner */}
      {viewTab === 'lineup' && isApproved && (
        <div style={{
          padding: '1.1rem 1.5rem',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid var(--status-success)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={22} color="var(--status-success)" />
            <div>
              <strong style={{ fontSize: '1rem' }}>Vendor Arrangement Approved!</strong>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Your ceremony vendor lineup is locked. Track your 3 milestone installments on the Payments portal.
              </div>
            </div>
          </div>
          <Link to="/customer/payments" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Open Milestone Payments <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Category Pill Filters */}
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

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search vendor or city..."
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
              style={{ width: 180, fontSize: '0.86rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating_high">Top Rated (★ 5.0)</option>
              <option value="price_low">Price (Low to High)</option>
              <option value="price_high">Price (High to Low)</option>
              <option value="name_asc">Name (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State for Lineup Tab if no vendors added yet */}
      {viewTab === 'lineup' && lineupVendors.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <EmptyState
            icon={Store}
            title="No Vendors in Your Wedding Lineup Yet"
            description="Your planner has not yet assigned vendors, or you haven't selected any partner services yet. Browse our verified partner directory to pick your dream photographers, caterers, and decorators."
          />
          <button
            type="button"
            onClick={() => setViewTab('browse')}
            className="btn btn-primary"
            style={{ margin: '1.25rem auto 0', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            <span>Browse Directory & Select Vendors</span>
          </button>
        </div>
      ) : paginatedVendors.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem' }}>
          <EmptyState
            icon={Store}
            title="No Vendors Match Your Filters"
            description="Try selecting another category or clearing your search term."
          />
        </div>
      ) : (
        /* Vendor Cards Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {paginatedVendors.map((item, idx) => {
            const vId = item.vendor_id || item.id;
            const isWishlisted = wishlistIds.has(vId);
            const isSelected = selectedVendorIds.has(vId);
            const vendorPrice = parseFloat(item.price || item.agreed_price || item.base_price || 0);

            return (
              <div key={item.id || idx} className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                borderTop: isSelected ? '3px solid var(--status-success)' : '3px solid var(--primary)',
                background: isSelected ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-surface)'
              }}>
                <div>
                  {/* Top Bar: Category, ID & Wishlist */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <Badge variant="primary">{item.category_name || 'Wedding Partner'}</Badge>
                      {vId && <span className="id-badge id-badge-vnd">{formatVendorId(vId)}</span>}
                      {isSelected && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: 'var(--status-success)',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          fontWeight: 700
                        }}>
                          ✓ In Lineup
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{
                        color: isWishlisted ? 'var(--primary)' : 'var(--text-muted)',
                        padding: '0.3rem 0.5rem'
                      }}
                      onClick={() => handleToggleWishlist(item)}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={18} fill={isWishlisted ? 'var(--primary)' : 'none'} />
                    </button>
                  </div>

                  {/* Vendor Name & Rating */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 800 }}>
                      {item.vendor_name || item.business_name}
                    </h3>
                    <span style={{ fontSize: '0.88rem', color: '#EAB308', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Star size={14} fill="#EAB308" /> {item.vendor_rating || item.rating || '5.0'}
                    </span>
                  </div>

                  {/* Service Package */}
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    Service: <strong style={{ color: 'var(--text-main)' }}>{item.service_name || `${item.category_name || 'Wedding'} Package`}</strong>
                  </div>

                  {/* Quick Meta */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.84rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>Base: <strong>{item.vendor_city || item.city || 'Bangalore'}</strong></span>
                    </div>
                    {item.experience_years && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Award size={13} color="var(--primary)" />
                        <span>Experience: <strong>{item.experience_years}+ Years</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Rate & Actions */}
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                    marginBottom: '0.85rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {viewTab === 'lineup' ? 'Contract Rate:' : 'Estimated Rate:'}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-success)' }}>
                      {formatCurrency(vendorPrice)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isSelected ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, color: 'var(--status-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        disabled={actionLoading}
                        onClick={() => handleRemoveVendor(item)}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        disabled={actionLoading}
                        onClick={() => handleSelectVendor(item)}
                      >
                        <Plus size={14} /> Select for Wedding
                      </button>
                    )}

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedVendorDetail(item);
                        setDetailModalOpen(true);
                        if (trackRecent) {
                          trackRecent({
                            id: `vnd-${item.vendor_id || item.id}`,
                            type: 'VENDOR',
                            title: item.vendor_name || item.business_name || 'Wedding Partner',
                            subtitle: item.category_name || 'Vendor Specialty',
                            path: '/customer/vendor-selection',
                            icon: 'Store'
                          });
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                      title="View full vendor dossier"
                    >
                      <Eye size={14} /> Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {paginatedVendors.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[6, 12, 24]}
        />
      )}

      {/* Vendor Profile Dossier Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Artisan Wedding Vendor Dossier"
      >
        {selectedVendorDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(225, 29, 72, 0.08) 100%)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                    {selectedVendorDetail.vendor_name || selectedVendorDetail.business_name}
                  </h3>
                  <span className="id-badge id-badge-vnd">
                    {formatVendorId(selectedVendorDetail.vendor_id || selectedVendorDetail.id)}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                  Category: {selectedVendorDetail.category_name}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Rate</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-success)' }}>
                  {formatCurrency(selectedVendorDetail.price || selectedVendorDetail.agreed_price || selectedVendorDetail.base_price)}
                </div>
              </div>
            </div>

            {/* Highlights Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              background: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>City Base:</span>
                <div style={{ fontWeight: 700 }}>{selectedVendorDetail.vendor_city || selectedVendorDetail.city || 'Bangalore'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Rating:</span>
                <div style={{ fontWeight: 700, color: '#EAB308' }}>★ {selectedVendorDetail.vendor_rating || selectedVendorDetail.rating || '5.0'} / 5.0</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Service Included:</span>
                <div style={{ fontWeight: 700 }}>{selectedVendorDetail.service_name || 'Bespoke Package'}</div>
              </div>
            </div>

            {/* Description / Bio */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Specialities & Description</label>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, background: 'var(--bg-surface)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {selectedVendorDetail.description || 'Dedicated luxury wedding vendor recognized for ceremonial punctuality, bespoke aesthetic design, and high-touch couple coordination.'}
              </p>
            </div>

            {/* Google Map Section - Strictly Wedding Hall / Venue Only */}
            <WeddingHallMap vendor={selectedVendorDetail} title="Wedding Hall Location" />

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleToggleWishlist(selectedVendorDetail)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Heart size={16} fill={wishlistIds.has(selectedVendorDetail.vendor_id || selectedVendorDetail.id) ? 'var(--primary)' : 'none'} color="var(--primary)" />
                <span>{wishlistIds.has(selectedVendorDetail.vendor_id || selectedVendorDetail.id) ? 'Wishlisted' : 'Save to Wishlist'}</span>
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedVendorIds.has(selectedVendorDetail.vendor_id || selectedVendorDetail.id) ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ color: 'var(--status-danger)' }}
                    onClick={() => {
                      handleRemoveVendor(selectedVendorDetail);
                      setDetailModalOpen(false);
                    }}
                  >
                    Remove from Lineup
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      handleSelectVendor(selectedVendorDetail);
                      setDetailModalOpen(false);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Plus size={16} /> Select for Wedding
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={approveConfirmModalOpen}
        onClose={() => !actionLoading && setApproveConfirmModalOpen(false)}
        title="Approve Arranged Vendor Team"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--status-success)', marginBottom: '0.35rem' }}>
              Lock in Arranged Vendors & Schedule Milestones
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              By confirming your approval, you are locking in this curated vendor team for your wedding project ({formatCurrency(totalAmount)}).
              <br /><br />
              This will automatically generate your <strong>3-Stage Milestone Payment Schedule</strong> (Advance Retainer, Mid-Term, and Final Settlement).
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={actionLoading}
              onClick={() => setApproveConfirmModalOpen(false)}
            >
              Review More
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={actionLoading}
              onClick={handleApprove}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Check size={16} /> {actionLoading ? 'Approving...' : 'Confirm Approval (OK)'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Request Change Modal */}
      <Modal
        isOpen={changeModalOpen}
        onClose={() => !actionLoading && setChangeModalOpen(false)}
        title="Request Vendor Substitutions"
      >
        <form onSubmit={handleChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Let your lead planner know which vendor category or artist you would like adjusted, and specify your replacement preferences or budget constraints.
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Substitution Notes *</label>
            <textarea
              className="form-control"
              rows={4}
              required
              placeholder="e.g., We would like an alternate photography team specializing in candid cinematic video, or a venue with outdoor lawn capacity."
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={actionLoading}
              onClick={() => setChangeModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading || !changeNotes.trim()}
              style={{ background: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}
            >
              {actionLoading ? 'Submitting...' : 'Send Substitution Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
