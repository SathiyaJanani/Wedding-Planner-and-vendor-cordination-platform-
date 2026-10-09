import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import {
  Store, Search, Star, MapPin, DollarSign, Calendar, Eye, Send, Sparkles,
  Utensils, Camera, Music, Building, Palette, Award, CheckCircle, Tag, ArrowUpDown
} from 'lucide-react';

export default function VendorDirectory() {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [search, selectedCategory, selectedCity, sortBy, currentPage, pageSize]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/vendors/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (e) {
      // quiet
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendors', {
        params: {
          search,
          category_id: selectedCategory,
          city: selectedCity,
          sort_by: sortBy,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res.data.success) {
        setVendors(res.data.data);
        setTotalItems(res.data.total || res.data.pagination?.totalItems || res.data.data.length);
      }
    } catch (e) {
      toast.error('Failed to load vendors.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVendor = async (id) => {
    try {
      const res = await axios.get(`/api/vendors/${id}`);
      if (res.data.success) {
        setSelectedVendor(res.data.data);
        setIsDetailOpen(true);
      }
    } catch (e) {
      toast.error('Failed to load vendor details.');
    }
  };

  // Helper icon for categories
  const getCategoryIcon = (catName = '') => {
    const name = catName.toLowerCase();
    if (name.includes('cater') || name.includes('food')) return Utensils;
    if (name.includes('photo') || name.includes('cinema') || name.includes('video')) return Camera;
    if (name.includes('decor') || name.includes('floral') || name.includes('theme')) return Sparkles;
    if (name.includes('music') || name.includes('dj') || name.includes('band')) return Music;
    if (name.includes('venue') || name.includes('hall') || name.includes('mandap')) return Building;
    if (name.includes('makeup') || name.includes('mehendi') || name.includes('style')) return Palette;
    return Tag;
  };

  // Group vendors under category sections
  const groupedVendors = categories.map(cat => {
    const catVendors = vendors.filter(v => v.category_id === cat.id || (v.category_name && v.category_name.toLowerCase() === cat.name.toLowerCase()));
    return {
      ...cat,
      vendors: catVendors
    };
  }).filter(group => {
    if (selectedCategory) {
      return String(group.id) === String(selectedCategory);
    }
    // Show categories that have matching vendors
    return group.vendors.length > 0;
  });

  // Check if there are any vendors not matched to categories
  const matchedVendorIds = new Set();
  groupedVendors.forEach(g => g.vendors.forEach(v => matchedVendorIds.add(v.id)));
  const unassignedVendors = vendors.filter(v => !matchedVendorIds.has(v.id));

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Store size={20} />
            </div>
            <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', margin: 0 }}>
              Vendor Categories
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Browse and coordinate verified wedding partners categorized by specialty — Catering, Decoration, Photography, Venues, and more.
          </p>
        </div>

        <button
          onClick={() => navigate('/planner/vendor-requests')}
          className="btn btn-primary"
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <Send size={16} />
          <span>Dispatch Vendor Request</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'center', marginBottom: '1rem' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by vendor, specialty, city..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '100%' }}
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* City */}
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '100%' }}
          >
            <option value="">All Cities</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Pune">Pune</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '100%' }}
          >
            <option value="rating_desc">⭐ Highest Rated</option>
            <option value="price_asc">₹ Price: Low to High</option>
            <option value="price_desc">₹ Price: High to Low</option>
            <option value="name_asc">🔤 Name (A - Z)</option>
            <option value="newest">🕒 Newest First</option>
          </select>
        </div>

        {/* Quick Filter Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Filter by Category:
          </span>
          <button
            onClick={() => setSelectedCategory('')}
            className={`badge ${selectedCategory === '' ? 'badge-primary' : 'badge-neutral'}`}
            style={{ cursor: 'pointer', padding: '0.4rem 0.75rem', fontSize: '0.78rem', border: 'none' }}
          >
            All Categories ({vendors.length})
          </button>
          {categories.map(cat => {
            const count = vendors.filter(v => v.category_id === cat.id || (v.category_name && v.category_name.toLowerCase() === cat.name.toLowerCase())).length;
            const isSelected = String(selectedCategory) === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? '' : String(cat.id))}
                className={`badge ${isSelected ? 'badge-primary' : 'badge-neutral'}`}
                style={{
                  cursor: 'pointer',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.78rem',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: isSelected ? '#fff' : 'var(--text-main)'
                }}
              >
                {cat.name} {count > 0 && <span style={{ opacity: 0.8, marginLeft: '0.25rem' }}>({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vendors Organized by Category Headings */}
      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : groupedVendors.length === 0 && unassignedVendors.length === 0 ? (
        <EmptyState
          title="No vendors found"
          message={search ? `No vendors match "${search}". Try clearing search keywords or category filters.` : 'No vendors currently registered in this category.'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {groupedVendors.map(group => {
            const CatIcon = getCategoryIcon(group.name);
            return (
              <section key={group.id} style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* Category Section Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem',
                  borderBottom: '2px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CatIcon size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {group.name}
                        </h2>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                          {group.vendors.length} {group.vendors.length === 1 ? 'Vendor' : 'Vendors'}
                        </span>
                      </div>
                      {group.description && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.2rem', marginBottom: 0 }}>
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Specialty Service Category
                  </span>
                </div>

                {/* Vendors Grid for this Category */}
                <div className="grid-3">
                  {group.vendors.map(v => (
                    <div
                      key={v.id}
                      className="card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                            {v.category_name || group.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                            <Star size={15} fill="currentColor" />
                            <span>{v.rating}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({v.total_reviews})</span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                          {v.business_name}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <MapPin size={14} />
                          <span>{v.city}{v.state ? `, ${v.state}` : ''}</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.45, flex: 1 }}>
                        {v.description || 'Verified wedding specialist providing bespoke services for luxury nuptial ceremonies.'}
                      </p>

                      <div style={{
                        padding: '0.65rem 0.85rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.84rem'
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>Pricing Range:</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {v.price_range || `From ₹${Number(v.base_price).toLocaleString('en-IN')}`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenVendor(v.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <Eye size={14} />
                          <span>Services & Rates</span>
                        </button>
                        <button
                          onClick={() => navigate('/planner/vendor-requests', { state: { vendor_id: v.id } })}
                          className="btn btn-primary btn-sm"
                          title="Dispatch Booking Request"
                          style={{ padding: '0.4rem 0.65rem' }}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Unassigned / Additional Vendors if any */}
          {unassignedVendors.length > 0 && (
            <section style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.5rem'
            }}>
              <div style={{ marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Other Verified Vendors</h2>
              </div>
              <div className="grid-3">
                {unassignedVendors.map(v => (
                  <div key={v.id} className="card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{v.business_name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{v.city}</p>
                    <button onClick={() => handleOpenVendor(v.id)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                      <Eye size={14} /> View Services
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pagination */}
          <div style={{ marginTop: '1.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              pageSizeOptions={[6, 12, 24, 48]}
            />
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedVendor?.business_name || 'Vendor Details'} maxWidth="740px">
        {selectedVendor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem 1.25rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <span className="badge badge-primary">{selectedVendor.category_name}</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 600 }}>
                  Contact: {selectedVendor.contact_name || selectedVendor.business_name}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Phone: {selectedVendor.phone || 'Available upon request'} • {selectedVendor.city}, {selectedVendor.state}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800, color: 'var(--accent-gold)', fontSize: '1.15rem' }}>
                  <Star size={18} fill="currentColor" />
                  <span>{selectedVendor.rating} / 5.0</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedVendor.total_reviews} verified reviews</div>
              </div>
            </div>

            {/* Catalog Services */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Catalog Services & Packages ({selectedVendor.services?.length || 0})
              </h4>
              {selectedVendor.services?.length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No catalog items uploaded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedVendor.services.map(s => (
                    <div key={s.id} style={{
                      padding: '1rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      background: 'var(--bg-surface)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.description}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                          ₹{Number(s.price).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {s.pricing_unit?.replace(/_/g, ' ') || 'per event'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setIsDetailOpen(false)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  navigate('/planner/vendor-requests', { state: { vendor_id: selectedVendor.id } });
                }}
                className="btn btn-primary btn-sm"
              >
                <Send size={14} />
                <span>Send Booking Request</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
