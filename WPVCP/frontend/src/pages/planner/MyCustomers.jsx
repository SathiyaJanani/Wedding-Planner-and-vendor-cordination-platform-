import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { formatCustomerId, formatCurrency } from '../../utils/formatters';
import {
  Users, UserPlus, Search, Edit2, Trash2, Phone, Mail, Calendar, MapPin, DollarSign, Check, ArrowUpDown
} from 'lucide-react';

export default function MyCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const toast = useToast();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    partner_name: '',
    wedding_date: '',
    city: 'Bangalore',
    estimated_budget: 1200000,
    guest_count: 350,
    wedding_theme: 'Royal Heritage'
  });

  useEffect(() => {
    fetchCustomers();
  }, [search, cityFilter, sortBy, currentPage, pageSize]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers', {
        params: {
          search,
          city: cityFilter,
          sort_by: sortBy,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res.data.success) {
        setCustomers(res.data.data);
        setTotalItems(res.data.total || res.data.pagination?.totalItems || res.data.data.length);
      }
    } catch (e) {
      toast.error('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/customers', formData);
      if (res.data.success) {
        toast.success('Customer registered and assigned successfully!');
        setIsAddOpen(false);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          partner_name: '',
          wedding_date: '',
          city: 'Bangalore',
          estimated_budget: 1200000,
          guest_count: 350,
          wedding_theme: 'Royal Heritage'
        });
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add customer.');
    }
  };

  const handleEditOpen = (c) => {
    setSelectedCustomer(c);
    setFormData({
      full_name: c.full_name || '',
      email: c.email || '',
      phone: c.phone || '',
      partner_name: c.partner_name || '',
      wedding_date: c.wedding_date || '',
      city: c.city || 'Bangalore',
      estimated_budget: c.estimated_budget || 1000000,
      guest_count: c.guest_count || 300,
      wedding_theme: c.wedding_theme || 'Traditional'
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/customers/${selectedCustomer.customer_id}`, formData);
      if (res.data.success) {
        toast.success('Customer details updated successfully!');
        setIsEditOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      toast.error('Failed to update customer.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove customer "${name}"?`)) return;
    try {
      const res = await axios.delete(`/api/customers/${id}`);
      if (res.data.success) {
        toast.success('Customer deleted.');
        fetchCustomers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer.');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>
            My Customers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Manage client profiles, partner details, target wedding budgets, and project assignments.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          <UserPlus size={18} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by customer, partner, email, city..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
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
            <option value="Pune">Pune</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '100%' }}
          >
            <option value="newest">🕒 Newest Added</option>
            <option value="name_asc">🔤 Name (A - Z)</option>
            <option value="name_desc">🔤 Name (Z - A)</option>
            <option value="budget_desc">💰 Budget: High to Low</option>
            <option value="budget_asc">💰 Budget: Low to High</option>
            <option value="date_asc">📅 Wedding Date</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : customers.length === 0 ? (
          <EmptyState title="No customers found" message="Add a customer or adjust your search keywords." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer & Partner</th>
                  <th>Contact Info</th>
                  <th>Wedding Date</th>
                  <th>City</th>
                  <th>Guest Count</th>
                  <th>Target Budget</th>
                  <th>Project Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.customer_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.full_name}</span>
                        <span className="id-badge id-badge-cust">{formatCustomerId(c.customer_id)}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Partner: {c.partner_name || 'Not specified'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Mail size={14} color="var(--text-muted)" />
                        <span>{c.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <Phone size={14} />
                        <span>{c.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.wedding_date || 'TBD'}</td>
                    <td>{c.city}</td>
                    <td>{c.guest_count} guests</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(c.estimated_budget).toLocaleString('en-IN')}</td>
                    <td>
                      <Badge status={c.project_status || 'PLANNING'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleEditOpen(c)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Customer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.customer_id, c.full_name)}
                          className="btn btn-danger btn-sm"
                          title="Delete Customer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Customer">
        <form onSubmit={handleAddSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Partner's Name</label>
              <input
                type="text"
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Wedding Date</label>
              <input
                type="date"
                value={formData.wedding_date}
                onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Estimated Budget (₹)</label>
              <input
                type="number"
                value={formData.estimated_budget}
                onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Guest Count</label>
              <input
                type="number"
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer Details">
        <form onSubmit={handleEditSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Partner's Name</label>
              <input
                type="text"
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Wedding Date</label>
              <input
                type="date"
                value={formData.wedding_date}
                onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Estimated Budget (₹)</label>
              <input
                type="number"
                value={formData.estimated_budget}
                onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Guest Count</label>
              <input
                type="number"
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
