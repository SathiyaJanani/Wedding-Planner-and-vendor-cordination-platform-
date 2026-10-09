import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { Layers, Plus, Edit2, Trash2, DollarSign, Clock, Check } from 'lucide-react';

export default function VendorServices() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);
  const [services, setServices] = useState([]);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    pricing_unit: 'per_event',
    is_active: 1
  });

  useEffect(() => {
    fetchVendorServices();
  }, []);

  const fetchVendorServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/vendors/profile/me');
      if (res.data.success && res.data.data) {
        setVendorId(res.data.data.id);
        setServices(res.data.data.services || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      showToast('Could not load vendor services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      price: '',
      pricing_unit: 'per_event',
      is_active: 1
    });
    setModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    setServiceForm({
      name: srv.name,
      description: srv.description || '',
      price: srv.price,
      pricing_unit: srv.pricing_unit || 'per_event',
      is_active: srv.is_active ? 1 : 0
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId) return;

    try {
      setSaving(true);
      if (editingService) {
        // Update
        const res = await axios.put(`/api/vendors/services/${editingService.id}`, serviceForm);
        if (res.data.success) {
          showToast('Service package updated!', 'success');
          setModalOpen(false);
          fetchVendorServices();
        }
      } else {
        // Add
        const res = await axios.post('/api/vendors/services', {
          ...serviceForm,
          vendor_id: vendorId
        });
        if (res.data.success) {
          showToast('Service package added to catalog!', 'success');
          setModalOpen(false);
          fetchVendorServices();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save service', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service package?')) return;
    try {
      const res = await axios.delete(`/api/vendors/services/${serviceId}`);
      if (res.data.success) {
        showToast('Service deleted from catalog', 'info');
        fetchVendorServices();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete service', 'error');
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Catalog Services & Packages</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Define the services, tiers, and standard pricing that wedding planners can select when requesting bookings.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Add Service Package
        </button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Services Configured"
          description="Add your first wedding service package to make it easier for planners to send tailored proposals."
          actionText="Add New Service"
          onAction={openAddModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {services.map((srv) => (
            <div key={srv.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {srv.name}
                  </h3>
                  <Badge variant={srv.is_active ? 'success' : 'secondary'}>
                    {srv.is_active ? 'Active' : 'Archived'}
                  </Badge>
                </div>

                <div style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  marginBottom: '0.75rem'
                }}>
                  ₹{Number(srv.price).toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    / {srv.pricing_unit?.replace('_', ' ') || 'event'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, minHeight: 45 }}>
                  {srv.description || 'Full-scope professional wedding service delivered with premier quality.'}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.85rem',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => openEditModal(srv)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(srv.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--status-danger)' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editingService ? 'Edit Service Package' : 'Add New Service Package'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Service Package Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Royal Bridal Makeup, Candid Wedding Photography 2-Day"
              value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (INR ₹) *</label>
              <input
                type="number"
                className="form-control"
                required
                min="0"
                placeholder="25000"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pricing Unit</label>
              <select
                className="form-control"
                value={serviceForm.pricing_unit}
                onChange={(e) => setServiceForm({ ...serviceForm, pricing_unit: e.target.value })}
              >
                <option value="per_event">Per Event / Wedding</option>
                <option value="per_day">Per Day</option>
                <option value="per_hour">Per Hour</option>
                <option value="per_plate">Per Plate / Guest</option>
                <option value="flat_rate">Flat Package Rate</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Description & Inclusions</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="List what is included in this tier (e.g. 2 photographers, drone coverage, 40-page photobook)..."
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={serviceForm.is_active === 1}
                onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked ? 1 : 0 })}
              />
              Active in catalog (Planners can view and select this package)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : editingService ? 'Update Service' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
