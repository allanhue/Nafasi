'use client';

import { LogOut, AlertCircle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userName?: string;
}

export default function LogoutModal({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
  userName = 'User',
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: 400,
          width: '90%',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(234, 179, 8, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} style={{ color: 'var(--status-warning)' }} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Sign out?</h2>
          </div>

          {/* Content */}
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginBottom: 20,
            lineHeight: 1.6,
          }}>
            Are you sure you want to sign out, <strong>{userName}</strong>? You'll need to sign back in to access your workspace.
          </p>

          {/* Unsaved Changes Warning */}
          <div style={{
            padding: 12,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(249, 115, 22, 0.05)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            marginBottom: 20,
            display: 'flex',
            gap: 8,
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <span>Any unsaved changes will be lost.</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="btn btn-ghost"
              style={{
                flex: 1,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                flex: 1,
                background: 'var(--status-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {!isLoading && <LogOut size={14} />}
              {isLoading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
