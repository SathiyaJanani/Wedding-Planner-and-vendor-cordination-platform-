import React from 'react';
import { EmptyState as EmptyStateComp, LoadingSkeleton as BaseLoadingSkeleton } from './EmptyState';

export function LoadingSkeleton(props) {
  return <BaseLoadingSkeleton {...props} />;
}

export const EmptyState = EmptyStateComp;
export default LoadingSkeleton;
