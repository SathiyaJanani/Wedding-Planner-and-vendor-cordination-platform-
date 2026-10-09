import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import {
  FolderOpen, Upload, FileText, Download, Trash2, ShieldCheck,
  Plus, Search, ArrowUpDown, Filter, CheckCircle, FileCheck, Layers
} from 'lucide-react';

export default function VendorDocuments() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Search, Filter, Sort & Pagination State
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Upload Form State
  const [formData, setFormData] = useState({
    title: '',
    document_type: 'CONTRACT',
    wedding_project_id: '',
    file_path: '/uploads/docs/vendor_service_agreement.pdf'
  });
  const [uploadSubmitting, setUploadSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [search, docTypeFilter, sortBy, currentPage, pageSize]);

  const fetchAssignedProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      if (res.data.success && Array.isArray(res.data.data)) {
        setProjects(res.data.data);
        if (res.data.data.length > 0) {
          setFormData(prev => ({ ...prev, wedding_project_id: res.data.data[0].id }));
        }
      }
    } catch (e) {
      console.error('Failed to load vendor assigned projects', e);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/documents', {
        params: {
          search,
          document_type: docTypeFilter,
          sort_by: sortBy,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res.data.success) {
        setDocuments(res.data.data || []);
        setTotalItems(res.data.total || res.data.pagination?.totalItems || (res.data.data || []).length);
      }
    } catch (e) {
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploadSubmitting(true);
      const res = await axios.post('/api/documents', formData);
      if (res.data.success) {
        toast.success('Document uploaded and linked to wedding project successfully!');
        setIsUploadOpen(false);
        setFormData({
          title: '',
          document_type: 'CONTRACT',
          wedding_project_id: projects[0]?.id || '',
          file_path: '/uploads/docs/vendor_service_agreement.pdf'
        });
        fetchDocuments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Archive "${title}"?`)) return;
    try {
      const res = await axios.delete(`/api/documents/${id}`);
      if (res.data.success) {
        toast.success('Document archived.');
        fetchDocuments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive document.');
    }
  };

  // Quick category counts
  const contractCount = documents.filter(d => d.document_type === 'CONTRACT').length;
  const sketchCount = documents.filter(d => d.document_type === 'DESIGN_SKETCH').length;
  const checklistCount = documents.filter(d => d.document_type === 'CHECKLIST').length;

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
              <FolderOpen size={20} />
            </div>
            <h1 className="heading-cinzel" style={{ fontSize: '1.9rem', margin: 0 }}>
              Contracts, Agreements & Blueprints
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Access coordination contracts, venue floor plans, decor sketches, and technical riders for your assigned events.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Upload size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accessible Documents</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalItems}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contracts & Agreements</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{contractCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blueprints & Checklists</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{sketchCount + checklistCount}</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card">
        {/* Search, Filter, Sort Controls */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: '320px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search contracts, projects, codes..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                value={docTypeFilter}
                onChange={(e) => { setDocTypeFilter(e.target.value); setCurrentPage(1); }}
                className="form-select"
              >
                <option value="">All Document Types</option>
                <option value="CONTRACT">Contract Agreement</option>
                <option value="DESIGN_SKETCH">Design & Blueprint</option>
                <option value="CHECKLIST">Event Checklist / Schedule</option>
                <option value="INVOICE">Billing Invoice</option>
                <option value="OTHER">Other Documentation</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="form-select"
              style={{ width: 'auto' }}
            >
              <option value="newest">Upload Date (Newest)</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="size_desc">File Size (Largest)</option>
              <option value="size_asc">File Size (Smallest)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : documents.length === 0 ? (
          <EmptyState
            title="No documents found"
            message="No contracts, floor blueprints, or checklists match your current filters. Upload a service agreement or contract to get started."
          />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Classification</th>
                  <th>Associated Wedding Project</th>
                  <th>Uploaded By</th>
                  <th>File Size</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => {
                  const isOwner = doc.uploader_id === user?.id;
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '6px',
                            background: 'var(--bg-subtle)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FileText size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{doc.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {doc.file_type || 'PDF Document'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          doc.document_type === 'CONTRACT' ? 'badge-primary' :
                          doc.document_type === 'DESIGN_SKETCH' ? 'badge-info' :
                          doc.document_type === 'CHECKLIST' ? 'badge-success' : 'badge-neutral'
                        }`}>
                          {doc.document_type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{doc.project_title || 'General / Unassigned'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.project_code || '—'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {isOwner ? 'You (Vendor)' : doc.uploader_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {doc.uploader_email}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {doc.created_at ? doc.created_at.slice(0, 10) : 'Recent'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            download
                            className="btn btn-primary btn-sm"
                            title="Download PDF Document"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                          >
                            <Download size={14} />
                            <span>PDF</span>
                          </a>
                          {isOwner && (
                            <button
                              onClick={() => handleDelete(doc.id, doc.title)}
                              className="btn btn-danger btn-sm"
                              title="Archive"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
        />
      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Vendor Document">
        <form onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label className="form-label">Document Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Photography Coverage Contract & Equipment Rider"
              className="form-input"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Classification</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="form-select"
              >
                <option value="CONTRACT">Contract Agreement</option>
                <option value="DESIGN_SKETCH">Design Blueprint / Technical Rider</option>
                <option value="CHECKLIST">Event Run-of-Show / Checklist</option>
                <option value="INVOICE">Service Invoice / Estimate</option>
                <option value="OTHER">Other Documentation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Associated Wedding Project</label>
              <select
                value={formData.wedding_project_id}
                onChange={(e) => setFormData({ ...formData, wedding_project_id: e.target.value })}
                className="form-select"
              >
                <option value="">General (Not project-specific)</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.project_code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">File Path or Document URL</label>
            <input
              type="text"
              value={formData.file_path}
              onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
              className="form-input"
              placeholder="/uploads/docs/sample_agreement.pdf"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
              Reference path for your signed agreement, technical rider, or floor blueprint.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="btn btn-secondary"
              disabled={uploadSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploadSubmitting}
            >
              {uploadSubmitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
