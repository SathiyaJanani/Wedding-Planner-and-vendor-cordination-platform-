import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems <= 0) return null;

  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination-wrapper" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: '0.85rem 1rem',
      borderTop: '1px solid var(--border-subtle)',
      fontSize: '0.88rem',
      color: 'var(--text-muted)'
    }}>
      {/* Items info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>
          Showing <strong style={{ color: 'var(--text-main)' }}>{startItem}</strong> to{' '}
          <strong style={{ color: 'var(--text-main)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: 'var(--text-main)' }}>{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
            <span>per page:</span>
            <select
              className="form-select"
              style={{ padding: '0.2rem 0.5rem', height: 'auto', width: 'auto', fontSize: '0.82rem' }}
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.5rem', opacity: current === 1 ? 0.4 : 1 }}
            disabled={current === 1}
            onClick={() => onPageChange(1)}
            title="First Page"
          >
            <ChevronsLeft size={15} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.5rem', opacity: current === 1 ? 0.4 : 1 }}
            disabled={current === 1}
            onClick={() => onPageChange(current - 1)}
            title="Previous Page"
          >
            <ChevronLeft size={15} />
          </button>

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${p === current ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                minWidth: 32,
                padding: '0.35rem 0.6rem',
                fontWeight: p === current ? 700 : 500
              }}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.5rem', opacity: current === totalPages ? 0.4 : 1 }}
            disabled={current === totalPages}
            onClick={() => onPageChange(current + 1)}
            title="Next Page"
          >
            <ChevronRight size={15} />
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.5rem', opacity: current === totalPages ? 0.4 : 1 }}
            disabled={current === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Last Page"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
