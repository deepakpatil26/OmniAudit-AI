import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';

interface RouteBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

export function RouteBoundary({
  children,
  fallback = <LoadingFallback />,
  onReset,
}: RouteBoundaryProps) {
  return (
    <ErrorBoundary onReset={onReset}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}
