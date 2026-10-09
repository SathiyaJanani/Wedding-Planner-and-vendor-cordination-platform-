import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/LoadingSkeleton';
import Pagination from '../../components/Pagination';
import { FolderOpen, Upload, FileText, Download, Trash2, ShieldCheck, Plus, Search, ArrowUpDown, Filter } from 'lucide-react';

export default function ContractsDocuments() {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    document_type: 'CONTRACT',
    wedding_project_id: '',
    file_path: '/uploads/docs/wedding_agreement.pdf'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [search, docTypeFilter, sortBy, currentPage, pageSize]);

  const fetchProjects = async () => {
    try {
      const pRes = await axios.get('/api/projects');
      if (pRes.data.success) {
        setProjects(pRes.data.data);
        if (pRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, wedding_project_id: pRes.data.data[0].id }));
        }
      }
    } catch (e) {
      console.error('Failed to load projects');
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
        setDocuments(res.data.data);
        setTotalItems(res.data.total || res.data.pagination?.totalItems || res.data.data.length);
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
      const res = await axios.post('/api/documents', formData);
      if (res.data.success) {
        toast.success('Document uploaded and linked to wedding project!');
        setIsUploadOpen(false);
        setFormData({
          title: '',
          document_type: 'CONTRACT',
          wedding_project_id: projects[0]?.id || '',
          file_path: '/uploads/docs/wedding_agreement.pdf'
        });
        fetchDocuments();
      }
    } catch (err) {
      toast.error('Failed to upload document.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this document?')) return;
    try {
      const res = await axios.delete(`/api/documents/${id}`);
      if (res.data.success) {
        toast.success('Document archived.');
        fetchDocuments();
      }
    } catch (err) {
      toast.error('Failed to archive document.');
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
            Contracts, Blueprints & Documents
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Central repository for legal vendor contracts, stage blueprints, and guest seating charts.
          </p>
        </div>

        <button onClick={() => setIsUploadOpen(true)} className="btn btn-primary">
          <Upload size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="card">
        {/* Filters and Search Bar */}
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
                placeholder="Search contracts, project, uploader..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <div style={{ minWidth: '170px' }}>
              <select
                value={docTypeFilter}
                onChange={(e) => { setDocTypeFilter(e.target.value); setCurrentPage(1); }}
                className="form-select"
              >
                <option value="">All Document Types</option>
                <option value="CONTRACT">Contract Agreement</option>
                <option value="DESIGN_SKETCH">Design & Blueprint</option>
                <option value="CHECKLIST">Guest / Floor Plan</option>
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

        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : documents.length === 0 ? (
          <EmptyState title="No documents found" message="Upload vendor contracts, stage design blueprints, or guest lists matching your filters." />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Classification</th>
                  <th>Associated Project</th>
                  <th>Uploaded By</th>
                  <th>File Size</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FileText size={18} color="var(--primary)" />
                        <span style={{ fontWeight: 700 }}>{doc.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{doc.document_type}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doc.project_title || 'General'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doc.project_code}</div>
                    </td>
                    <td>{doc.uploader_name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{(doc.file_size / 1024).toFixed(1)} KB</td>
                    <td style={{ fontSize: '0.85rem' }}>{doc.created_at ? doc.created_at.slice(0, 10) : 'Recent'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="View / Download"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="btn btn-danger btn-sm"
                          title="Archive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
        />
      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Wedding Document">
        <form onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label className="form-label">Document Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Master Palace Venue Coordination Contract"
              className="form-input"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="form-select"
              >
                <option value="CONTRACT">Contract Agreement</option>
                <option value="DESIGN_SKETCH">Design & Decor Blueprint</option>
                <option value="CHECKLIST">Guest Checklist / Floor Plan</option>
                <option value="INVOICE">Billing Invoice</option>
                <option value="OTHER">Other Documentation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Wedding Project</label>
              <select
                value={formData.wedding_project_id}
                onChange={(e) => setFormData({ ...formData, wedding_project_id: e.target.value })}
                className="form-select"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title} ({p.project_code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">File Path / Reference URL</label>
            <input
              type="text"
              value={formData.file_path}
              onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsUploadOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Upload Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
