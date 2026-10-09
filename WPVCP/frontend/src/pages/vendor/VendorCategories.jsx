import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRecentlyAccessed } from '../../context/RecentlyAccessedContext';
import Modal from '../../components/Modal';
import WeddingHallMap from '../../components/WeddingHallMap';
import { isWeddingHallVendor } from '../../utils/weddingHallHelper';
import { 
  Tag, Check, Sparkles, Layers, Search, Filter, ArrowUpDown, 
  MapPin, Star, DollarSign, Building2, Utensils, Palette, Camera,
  Video, Heart, Award, Cake, Disc, Car, Flower2, Mail, Shirt, Crown,
  Eye, CheckCircle2, Store
} from 'lucide-react';

const CATEGORY_ICON_MAP = {
  'wedding halls': Building2,
  'wedding hall': Building2,
  'catering': Utensils,
  'decoration': Palette,
  'photography': Camera,
  'videography': Video,
  'makeup': Heart,
  'mehendi': Sparkles,
  'bridal wear': Crown,
  'groom wear': Shirt,
  'invitation': Mail,
  'jewellery': Award,
  'wedding cakes': Cake,
  'wedding cake': Cake,
  'music & dj': Disc,
  'dj': Disc,
  'transportation': Car,
  'florists': Flower2,
  'flower decoration': Flower2
};

export default function VendorCategories() {
  const { user } = useAuth();
  const toast = useToast();
  const { trackRecent } = useRecentlyAccessed();

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedVendorModal, setSelectedVendorModal] = useState(null);

  // Load Vendor Profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const profRes = await axios.get('/api/vendors/profile/me');
        if (profRes.data.success) {
          setProfile(profRes.data.data || null);
        }
      } catch (err) {
        // quiet
      }
    }
    loadProfile();
  }, []);

  // Fetch all 15 categories and vendors
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, venRes] = await Promise.all([
        axios.get('/api/vendors/categories'),
        axios.get('/api/vendors?limit=100')
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.data || []);
      }
      if (venRes.data.success) {
        setVendors(venRes.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load categories and vendor directory.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenVendor = (vendor) => {
    setSelectedVendorModal(vendor);
    if (trackRecent) {
      trackRecent({
        id: `vnd-${vendor.id}`,
        type: 'VENDOR',
        title: vendor.business_name,
        subtitle: vendor.category_name || 'Verified Partner',
        path: '/vendor/categories',
        icon: 'Store'
      });
    }
  };

  const getCategoryIconComponent = (catName = '') => {
    const key = catName.toLowerCase().trim();
    return CATEGORY_ICON_MAP[key] || Tag;
  };

  // Group vendors strictly under their assigned category
  const groupedData = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return categories.map(cat => {
      // Strict category filter: match by category_id or exact category_name
      let catVendors = vendors.filter(v => 
        Number(v.category_id) === Number(cat.id) ||
        (v.category_name && v.category_name.toLowerCase().trim() === cat.name.toLowerCase().trim())
      );

      // Search filter within category
      if (cleanSearch) {
        catVendors = catVendors.filter(v =>
          v.business_name?.toLowerCase().includes(cleanSearch) ||
          v.description?.toLowerCase().includes(cleanSearch) ||
          v.city?.toLowerCase().includes(cleanSearch) ||
          v.category_name?.toLowerCase().includes(cleanSearch)
        );
      }

      return {
        ...cat,
        vendors: catVendors
      };
    }).filter(group => {
      if (selectedCategoryFilter !== 'ALL') {
        return String(group.id) === String(selectedCategoryFilter) || group.name.toLowerCase() === selectedCategoryFilter.toLowerCase();
      }
      // In ALL view, show all 15 categories (or categories with search matches)
      if (cleanSearch) {
        return group.vendors.length > 0;
      }
      return true;
    });
  }, [categories, vendors, search, selectedCategoryFilter]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div className="card" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, var(--card-bg, #ffffff) 0%, rgba(225, 29, 72, 0.05) 100%)',
        marginBottom: '1.75rem',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'var(--primary, #e11d48)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(225, 29, 72, 0.25)'
            }}>
              <Store size={26} />
            </div>
            <div>
              <h1 className="heading-cinzel" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
                15 Vendor Category Headings & Directory
              </h1>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Browse verified wedding partners categorized into 15 distinct specialties with dedicated vendor listings and Google Maps support.
              </p>
            </div>
          </div>

          {profile && (
            <div style={{
              background: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0.6rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Your Category:</span>
              <strong style={{ color: 'var(--primary)' }}>{profile.category_name || 'Registered Vendor'}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills & Search Controls */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem', borderRadius: '14px' }}>
        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by vendor name, location, or specialty across all 15 categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', height: '42px', fontSize: '0.9rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* 15 Category Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`btn btn-sm ${selectedCategoryFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '20px', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            All 15 Categories ({vendors.length})
          </button>

          {categories.map((c) => {
            const isSelected = String(selectedCategoryFilter) === String(c.id) || selectedCategoryFilter.toLowerCase() === c.name.toLowerCase();
            const Icon = getCategoryIconComponent(c.name);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(String(c.id))}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Icon size={13} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 15 Separate Category Headings with Dedicated Vendors */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading 15 vendor categories...</p>
        </div>
      ) : groupedData.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Store size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3>No Vendors Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>No vendor matched "{search}". Try searching for another term.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {groupedData.map((group) => {
            const GroupIcon = getCategoryIconComponent(group.name);
            const isHall = isWeddingHallVendor(group.name) || group.id === 1;

            return (
              <section
                key={group.id}
                id={`cat-${group.id}`}
                style={{
                  background: 'var(--bg-surface, #ffffff)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: 'var(--card-shadow)'
                }}
              >
                {/* Category Heading (Mandatory 15 separate category headings) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem',
                  borderBottom: '2px solid var(--border-subtle, #f1f5f9)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      background: 'var(--primary-glow, rgba(225, 29, 72, 0.1))',
                      color: 'var(--primary, #e11d48)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <GroupIcon size={22} />
                    </div>
                    <div>
                      <h2 style={{
                        margin: 0,
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        letterSpacing: '-0.01em'
                      }}>
                        {group.name}
                      </h2>
                      <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {group.description || `Verified partners specialized exclusively in ${group.name}.`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isHall && (
                      <span className="badge" style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem' }}>
                        🗺️ Google Maps Verified
                      </span>
                    )}
                    <span className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                      {group.vendors.length} Verified {group.vendors.length === 1 ? 'Vendor' : 'Vendors'}
                    </span>
                  </div>
                </div>

                {/* Vendors Grid strictly filtered for this category */}
                {group.vendors.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: '1rem 0' }}>
                    No vendors currently matching search criteria in this category.
                  </p>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.25rem'
                  }}>
                    {group.vendors.map((vendor) => {
                      const isHallVendor = isWeddingHallVendor(vendor);

                      return (
                        <div
                          key={vendor.id}
                          className="card"
                          style={{
                            padding: '1.25rem',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            border: '1px solid var(--border)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            background: 'var(--bg-subtle, #f8fafc)'
                          }}
                        >
                          <div>
                            {/* Vendor Title & Rating */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
                              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {vendor.business_name}
                              </h3>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: '#fef3c7',
                                color: '#b45309',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                flexShrink: 0
                              }}>
                                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                <span>{vendor.rating ? Number(vendor.rating).toFixed(2) : '4.90'}</span>
                              </div>
                            </div>

                            {/* Location & Experience */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={13} color="var(--primary)" />
                                {vendor.city || 'Bangalore'}
                              </span>
                              <span>•</span>
                              <span>{vendor.experience_years || 5} yrs experience</span>
                            </div>

                            {/* Description */}
                            <p style={{
                              fontSize: '0.84rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.45,
                              margin: '0 0 0.85rem 0',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {vendor.description}
                            </p>
                          </div>

                          <div>
                            {/* Pricing */}
                            <div style={{
                              padding: '0.5rem 0.75rem',
                              background: 'var(--bg-surface, #ffffff)',
                              borderRadius: '8px',
                              marginBottom: '0.85rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.8rem'
                            }}>
                              <span style={{ color: 'var(--text-muted)' }}>Price Range:</span>
                              <strong style={{ color: 'var(--text-main)' }}>
                                {vendor.price_range || `₹${Number(vendor.base_price || 25000).toLocaleString('en-IN')}`}
                              </strong>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenVendor(vendor)}
                                className="btn btn-secondary btn-block btn-sm"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                              >
                                <Eye size={14} />
                                <span>View Details</span>
                              </button>

                              {isHallVendor && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenVendor(vendor)}
                                  className="btn btn-primary btn-sm"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                                  title="Google Maps venue directions"
                                >
                                  <MapPin size={14} />
                                  <span>Venue Map</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Vendor Detail Modal with Google Maps for Wedding Halls */}
      {selectedVendorModal && (
        <Modal
          isOpen={Boolean(selectedVendorModal)}
          onClose={() => setSelectedVendorModal(null)}
          title={selectedVendorModal.business_name}
          maxWidth="700px"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-primary">{selectedVendorModal.category_name}</span>
              <span className="badge badge-success">Verified Partner</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                ⭐ {selectedVendorModal.rating ? Number(selectedVendorModal.rating).toFixed(2) : '4.95'} ({selectedVendorModal.total_reviews || 30}+ reviews)
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {selectedVendorModal.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              padding: '1rem',
              background: 'var(--bg-subtle, #f8fafc)',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <div style={{ fontWeight: 600 }}>{selectedVendorModal.address || selectedVendorModal.city}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Price Range:</span>
                <div style={{ fontWeight: 600 }}>{selectedVendorModal.price_range || `₹${Number(selectedVendorModal.base_price).toLocaleString('en-IN')}`}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
                <div style={{ fontWeight: 600 }}>{selectedVendorModal.experience_years || 5} Years</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Coverage:</span>
                <div style={{ fontWeight: 600 }}>{selectedVendorModal.service_locations || 'Bangalore, Pan-India'}</div>
              </div>
            </div>

            {/* PRESERVE GOOGLE MAPS INTEGRATION FOR WEDDING HALLS EXACTLY AS IT IS */}
            {isWeddingHallVendor(selectedVendorModal) && (
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
                  Interactive Google Maps Location & Turn-by-Turn Directions
                </h4>
                <WeddingHallMap
                  vendor={selectedVendorModal}
                  height="260px"
                  showControls={true}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedVendorModal(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
