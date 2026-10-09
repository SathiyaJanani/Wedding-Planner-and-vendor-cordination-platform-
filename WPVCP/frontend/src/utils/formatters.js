/**
 * Formatting Utilities for WPVCP Platform
 */

export function formatCustomerId(id) {
  if (!id && id !== 0) return 'CUST-—';
  const cleanId = String(id).replace(/\D/g, '');
  const num = parseInt(cleanId, 10) || 1;
  return `CUST-${String(num).padStart(4, '0')}`;
}

export function formatVendorId(id) {
  if (!id && id !== 0) return 'VND-—';
  const cleanId = String(id).replace(/\D/g, '');
  const num = parseInt(cleanId, 10) || 1;
  return `VND-${String(num).padStart(4, '0')}`;
}

export function formatCurrency(amount) {
  const num = parseFloat(amount || 0);
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  });
}
