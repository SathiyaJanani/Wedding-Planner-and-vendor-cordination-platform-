import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import { 
  Layers, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  Store, Tag, DollarSign, Star, MapPin, RefreshCw, Eye, Plus, CheckCircle, Info
} from 'lucide-react';

export default function ServiceManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'categories'

  // Service Catalog state
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination for Services
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pricingUnit, setPricingUnit] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Selected Service detail modal
  const [selectedService, setSelectedService] = useState(null);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await axios.get('/api/vendors/categories');
        if (res.data.success) {
          setCategories(res.data.data || []);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    loadCategories();
  }, []);

  // Fetch Services from API
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        category_id: selectedCategory || undefined,
        pricing_unit: pricingUnit || undefined,
        sort_by: sortBy
      };

      const res = await axios.get('/api/vendors/services/all', { params });
      if (res.data.success) {
        setServices(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedCategory, pricingUnit, sortBy]);

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    }
  }, [fetchServices, activeTab]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPricingUnit('');
    setSortBy('price_asc');
    setPage(1);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            Service Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Browse and manage all registered vendor service packages, categories, unit pricing, and availability.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Vendor Services ({pagination.total || services.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Category Taxonomy ({categories.length})
          </button>
        </div>
      </div>

      {activeTab === 'services' ? (
        <>
          {/* Controls: Search, Category, Unit, Sort */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end'
            }}>
              {/* Search */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Search Services & Vendors
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search package name, vendor..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Category Filter */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category
                </label>
                <select
                  className="form-input"
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Unit */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pricing Model
                </label>
                <select
                  className="form-input"
                  value={pricingUnit}
                  onChange={(e) => { setPricingUnit(e.target.value); setPage(1); }}
                >
                  <option value="">All Pricing Models</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="per_plate">Per Plate</option>
                  <option value="per_day">Per Day</option>
                  <option value="per_hour">Per Hour</option>
                  <option value="per_event">Per Event</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sort By
                </label>
                <select
                  className="form-input"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Service Name (A-Z)</option>
                  <option value="vendor_asc">Vendor Business (A-Z)</option>
                  <option value="newest">Newest Added</option>
                </select>
              </div>
            </div>

            {(search || selectedCategory || pricingUnit || sortBy !== 'price_asc') && (
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleResetFilters}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.82rem', color: 'var(--primary)' }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Services Table */}
          {loading ? (
            <LoadingSkeleton rows={6} />
          ) : services.length === 0 ? (
            <EmptyState
              title="No Vendor Services Found"
              message="No services matched your query. Adjust search terms or category filters."
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Service Package</th>
                      <th>Category</th>
                      <th>Vendor / Studio</th>
                      <th>Location</th>
                      <th style={{ textAlign: 'right' }}>Base Price</th>
                      <th>Pricing Unit</th>
                      <th>Availability</th>
                      <th style={{ textAlign: 'center' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                            {s.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.description || 'Professional wedding service package.'}
                          </div>
                        </td>

                        <td>
                          <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                            {s.category_name}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                            {s.vendor_name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#eab308' }}>
                            <Star size={12} fill="#eab308" />
                            <span>{s.vendor_rating || '4.8'}</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.3rem' }}>({s.vendor_experience || 3} yrs exp)</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <MapPin size={13} />
                            <span>{s.vendor_city || 'Bangalore'}</span>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                          ₹{Number(s.price || 0).toLocaleString('en-IN')}
                        </td>

                        <td>
                          <code style={{ fontSize: '0.78rem', background: 'var(--bg-subtle)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                            /{s.pricing_unit || 'fixed'}
                          </code>
                        </td>

                        <td>
                          <span className={`badge ${s.is_available !== false ? 'badge-success' : 'badge-danger'}`}>
                            {s.is_available !== false ? 'Available' : 'Unavailable'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedService(s)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.35rem 0.6rem' }}
                            title="View Package Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Server-Side Pagination Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>
                    Showing <strong>{services.length}</strong> of <strong>{pagination.total}</strong> services
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Per Page:</span>
                    <select
                      value={limit}
                      onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                      className="form-input"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.82rem', width: 'auto' }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <span style={{ fontSize: '0.88rem', fontWeight: 600, padding: '0 0.5rem' }}>
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                    disabled={page >= (pagination.totalPages || 1)}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Category Taxonomy Tab */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Service Category Name</th>
                  <th>URL Slug</th>
                  <th>Description</th>
                  <th>System Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{c.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {c.name}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.82rem', background: 'var(--bg-subtle)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                        {c.slug}
                      </code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
                      {c.description}
                    </td>
                    <td>
                      <span className="badge badge-success">ACTIVE IN DB</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-neutral" style={{ marginBottom: '0.4rem' }}>{selectedService.category_name}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{selectedService.name}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{Number(selectedService.price).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per {selectedService.pricing_unit}</div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {selectedService.description || 'Full-service professional wedding offering designed for premium coordination.'}
            </p>

            <div style={{ background: 'var(--bg-subtle)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vendor Business:</span>
                <strong>{selectedService.vendor_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact Person:</span>
                <span>{selectedService.vendor_contact || 'Vendor Lead'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span>{selectedService.vendor_email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operating City:</span>
                <span>{selectedService.vendor_city || 'Bangalore'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedService(null)}
              className="btn btn-secondary btn-block"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
