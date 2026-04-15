'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '500px',
      }}>
        <AlertCircle size={64} style={{ color: '#dc3545', marginBottom: '20px' }} />
        <h1 style={{ marginBottom: '12px' }}>Access Denied</h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '24px',
          fontSize: '16px',
        }}>
          You don't have permission to access this page. Your current role doesn't grant access to this resource.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/profile" className="btn btn-secondary">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
