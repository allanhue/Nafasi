'use client';

export function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
    </div>
  );
}

export function LoadingSpinner() {
  return <div className="loading-spinner" />;
}
