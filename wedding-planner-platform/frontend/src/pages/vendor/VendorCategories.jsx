import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Badge from '../../components/Badge';
import { 
  Tag, Check, Sparkles, Layers, Search, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, RefreshCw, CheckCircle2 
} from 'lucide-react';

export default function VendorCategories() {
  const { user } = useAuth();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search, Sort & Pagination
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Load Vendor Profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const profRes = await axios.get('/api/vendors/profile/me');
        if (profRes.data.success) {
          setProfile(profRes.data.data || null);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    }
    loadProfile();
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        sort_by: sortBy
      };

      const res = await axios.get('/api/vendors/categories', { params });
      if (res.data.success) {
        setCategories(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      toast.error('Failed to load service categories.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div>
      {/* Header Banner */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(201, 149, 107, 0.12) 100%)',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
          }}>
            <Tag size={24} />
          </div>
          <div>
            <h1 className="heading-cinzel" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
              Service Categories & Specializations
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your active primary category: <strong style={{ color: 'var(--primary)' }}>{profile?.category_name || 'Artisan Service'}</strong>.
              Wedding planners filter and coordinate services based on these verified database categories.
            </p>
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Sorting */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          {/* Search */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Search Categories
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search category, description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Sort Order
            </label>
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="name_asc">Category Name (A-Z)</option>
              <option value="name_desc">Category Name (Z-A)</option>
              <option value="id_asc">Database ID (Ascending)</option>
              <option value="id_desc">Database ID (Descending)</option>
            </select>
          </div>

          {/* Page Size */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Display Per Page
            </label>
            <select
              className="form-input"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              <option value={12}>12 Categories</option>
              <option value={24}>24 Categories</option>
              <option value={48}>48 Categories</option>
            </select>
          </div>
        </div>

        {search && (
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.82rem', color: 'var(--primary)' }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          message="No service categories matched your search criteria."
        />
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            {categories.map((c) => {
              const isMyCategory = profile?.category_id === c.id;

              return (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isMyCategory ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isMyCategory ? '0 4px 18px rgba(225, 29, 72, 0.12)' : 'var(--card-shadow)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {isMyCategory && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'rgba(225, 29, 72, 0.1)',
                      color: 'var(--primary)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <CheckCircle2 size={13} />
                      <span>YOUR CATEGORY</span>
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        #{c.id}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {c.name}
                      </h3>
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <code style={{ fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {c.slug}
                      </code>
                    </div>

                    <p style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
                      margin: 0
                    }}>
                      {c.description || 'Database standard wedding vendor category.'}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Database Verified</span>
                    <span className="badge badge-success">ACTIVE</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="card" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            background: 'var(--bg-subtle)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{categories.length}</strong> of <strong>{pagination.total}</strong> service categories
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
        </>
      )}
    </div>
  );
}
