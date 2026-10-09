import React from 'react';

export default function Badge({ status, text }) {
  const normalized = (status || '').toUpperCase();
  let type = 'neutral';

  switch (normalized) {
    case 'CONFIRMED':
    case 'ACCEPTED':
    case 'AVAILABLE':
    case 'FULLY_PAID':
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PAID':
    case 'RESOLVED':
    case 'ACTIVE':
      type = 'success';
      break;

    case 'PARTIALLY_PAID':
    case 'CUSTOMER_APPROVAL':
    case 'RESERVED':
    case 'SCHEDULED':
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
    case 'RESENT':
      type = 'warning';
      break;

    case 'PENDING':
    case 'PENDING_VENDOR_RESPONSE':
    case 'PAYMENT_PENDING':
    case 'REQUESTED':
    case 'SUBMITTED':
    case 'PLANNED':
    case 'OPEN':
      type = 'info';
      break;

    case 'DECLINED':
    case 'UNAVAILABLE':
    case 'FAILED':
    case 'CANCELLED':
    case 'REJECTED':
      type = 'danger';
      break;

    case 'CUSTOMER_CHANGE_REQUESTED':
    case 'DRAFT':
    case 'BOOKED':
      type = 'purple';
      break;

    default:
      type = 'neutral';
  }

  const displayText = text || status?.replace(/_/g, ' ');

  return (
    <span className={`badge badge-${type}`}>
      {displayText}
    </span>
  );
}
