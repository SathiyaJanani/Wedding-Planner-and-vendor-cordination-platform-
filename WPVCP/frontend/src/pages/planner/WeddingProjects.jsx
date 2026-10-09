import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import {
  HeartHandshake, Plus, Search, Calendar, MapPin, DollarSign, Users, Eye, Edit2, CheckCircle, ArrowUpDown, ShieldCheck, Clock
} from 'lucide-react';
import WeddingHallMap from '../../components/WeddingHallMap';
import { isWeddingHallVendor } from '../../utils/weddingHallHelper';

export default function WeddingProjects() {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const toast = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    wedding_date: '',
    venue_name: '',
    venue_address: '',
    city: 'Bangalore',
    guest_count: 400,
    total_budget: 1500000,
    notes: ''
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    wedding_date: '',
    venue_name: '',
    venue_address: '',
    city: 'Bangalore',
    guest_count: 400,
    total_budget: 1500000,
    status: 'PLANNING',
    notes: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchCustomersList();
  }, [statusFilter, cityFilter, search, sortBy, currentPage, pageSize]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/projects', {
        params: {
          status: statusFilter,
          city: cityFilter,
          search,
          sort_by: sortBy,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res.data.success) {
        setProjects(res.data.data);
        setTotalItems(res.data.total || res.data.pagination?.totalItems || res.data.data.length);
      }
    } catch (e) {
      toast.error('Failed to load wedding projects.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersList = async () => {
    try {
      const res = await axios.get('/api/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
        if (res.data.data.length > 0 && !formData.customer_id) {
          setFormData(prev => ({ ...prev, customer_id: res.data.data[0].customer_id }));
        }
      }
    } catch (e) {
      // quiet fallback
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/projects', formData);
      if (res.data.success) {
        toast.success(`Project ${res.data.project_code} created successfully!`);
        setIsAddOpen(false);
        fetchProjects();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project.');
    }
  };

  const handleOpenEdit = (p) => {
    setEditingProject(p);
    setEditFormData({
      title: p.title,
      wedding_date: p.wedding_date ? p.wedding_date.split('T')[0] : '',
      venue_name: p.venue_name || '',
      venue_address: p.venue_address || '',
      city: p.city || 'Bangalore',
      guest_count: p.guest_count || 400,
      total_budget: p.total_budget || 1500000,
      status: p.status || 'PLANNING',
      notes: p.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const res = await axios.put(`/api/projects/${editingProject.id}`, editFormData);
      if (res.data.success) {
        toast.success('Project updated! Verification request sent to customer.');
        setIsEditOpen(false);
        fetchProjects();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project.');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      if (res.data.success) {
        setSelectedProject(res.data.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      toast.error('Failed to load project details.');
    }
  };

  return (
    <div>
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
            Wedding Projects
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Comprehensive wedding coordination projects, arranged vendor services, and budget tracking.
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>New Wedding Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, code, customer..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: '100%' }}
          >
            <option value="">All Project Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

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
            <option value="date_asc">📅 Wedding Date (Soonest)</option>
            <option value="date_desc">📅 Wedding Date (Latest)</option>
            <option value="budget_desc">💰 Budget: High to Low</option>
            <option value="budget_asc">💰 Budget: Low to High</option>
            <option value="title_asc">🔤 Project Title</option>
            <option value="newest">🕒 Newest First</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : projects.length === 0 ? (
        <EmptyState title="No projects found" message="Create a wedding project or convert customer requirements." />
      ) : (
        <div className="grid-2">
          {projects.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {p.project_code}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.2rem' }}>{p.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Couple: <strong>{p.customer_name}</strong> & {p.partner_name || 'Partner'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge status={p.status} />
                  {p.verification_status === 'PENDING_CUSTOMER_VERIFICATION' && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> Pending Client Verification
                      </span>
                    </div>
                  )}
                  {p.verification_status === 'VERIFIED' && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldCheck size={11} /> Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                padding: '0.85rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} color="var(--text-muted)" />
                  <span>{p.wedding_date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--text-muted)" />
                  <span>{p.city}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--text-muted)" />
                  <span>{p.guest_count} Guests</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={16} color="var(--text-muted)" />
                  <span>Budget: ₹{Number(p.total_budget).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Booking: <strong>{p.booking_status || 'DRAFT'}</strong> ({p.vendor_count || 0} vendors arranged)
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}
                    title="Edit wedding project parameters"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleViewDetails(p.id)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          pageSizeOptions={[4, 6, 12, 24]}
        />
      </div>

      {/* Project Details Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedProject?.title || 'Project Details'} maxWidth="760px">
        {selectedProject && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Code</div>
                <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{selectedProject.project_code}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wedding Date</div>
                <div style={{ fontWeight: 700 }}>{selectedProject.wedding_date}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                <Badge status={selectedProject.status} />
              </div>
            </div>

            {/* Arranged Vendors */}
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Arranged Vendors & Services ({selectedProject.arranged_services?.length || 0})</h4>
              {selectedProject.arranged_services?.length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No vendors arranged yet. Search vendors and send availability requests.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Vendor / Business</th>
                        <th>Service Item</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.arranged_services.map(s => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600 }}>{s.business_name}</td>
                          <td>{s.service_name}</td>
                          <td style={{ fontWeight: 700 }}>₹{Number(s.agreed_price).toLocaleString('en-IN')}</td>
                          <td><Badge status={s.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Google Map Section - Strictly Wedding Hall Only */}
            {selectedProject.arranged_services?.some(s => isWeddingHallVendor(s)) && (
              <WeddingHallMap
                vendor={selectedProject.arranged_services.find(s => isWeddingHallVendor(s))}
                title="Wedding Hall Location"
              />
            )}

            {/* Financial Overview */}
            <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Budget & Settlement</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                <span>Target Wedding Budget:</span>
                <span style={{ fontWeight: 700 }}>₹{Number(selectedProject.total_budget).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                <span>Contracted Vendor Total:</span>
                <span style={{ fontWeight: 700 }}>₹{Number(selectedProject.total_amount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--status-success)' }}>
                <span>Amount Paid:</span>
                <span style={{ fontWeight: 800 }}>₹{Number(selectedProject.paid_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* New Project Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Wedding Project">
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Select Customer</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="form-select"
              required
            >
              {customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.full_name} ({c.partner_name || 'Wedding'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Wedding Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Royal Palace Destination Nuptials"
              className="form-input"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Wedding Date</label>
              <input
                type="date"
                value={formData.wedding_date}
                onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Venue Name</label>
              <input
                type="text"
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                placeholder="e.g. Grand Royal Palace"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Budget (₹)</label>
              <input
                type="number"
                value={formData.total_budget}
                onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Initialize Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Project: ${editingProject?.project_code || ''}`}>
        <form onSubmit={handleUpdateProject}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
            Adjust wedding parameters below. Saving changes automatically triggers a re-verification request to the customer.
          </p>

          <div className="form-group">
            <label className="form-label">Wedding Title</label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Wedding Date</label>
              <input
                type="date"
                value={editFormData.wedding_date}
                onChange={(e) => setEditFormData({ ...editFormData, wedding_date: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Venue Name</label>
              <input
                type="text"
                value={editFormData.venue_name}
                onChange={(e) => setEditFormData({ ...editFormData, venue_name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Budget (₹)</label>
              <input
                type="number"
                value={editFormData.total_budget}
                onChange={(e) => setEditFormData({ ...editFormData, total_budget: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Guest Count</label>
              <input
                type="number"
                value={editFormData.guest_count}
                onChange={(e) => setEditFormData({ ...editFormData, guest_count: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="form-select"
              >
                <option value="PLANNING">PLANNING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Specifications</label>
            <textarea
              value={editFormData.notes}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> Save & Submit for Customer Verification
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
