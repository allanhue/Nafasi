'use client';

import { useState, useEffect } from 'react';
import { readSession } from '../../lib/session';
import { canAccess, ROLES } from '../../lib/roles';
import { apiPost, apiGet } from '../../lib/api';
import Link from 'next/link';
import { Plus, Mail, Trash2, Copy, Check } from 'lucide-react';

type TenantInvite = {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  accepted_at?: string;
};

export default function TenantsInvitePage() {
  const [invites, setInvites] = useState<TenantInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);

  const session = readSession();
  const userRole = session?.role as any || ROLES.USER;
  const canInviteTenants = canAccess(userRole, 'canInviteTenants');

  useEffect(() => {
    if (!canInviteTenants) {
      return;
    }
    loadInvites();
  }, [canInviteTenants]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      // For now, use dummy data since backend endpoint doesn't exist yet
      setInvites([
        {
          id: '1',
          email: 'tenant1@example.com',
          status: 'accepted',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          accepted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          email: 'tenant2@example.com',
          status: 'pending',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to load invites:', err);
      setError('Failed to load tenant invites');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSending(true);

    try {
      if (!email.trim()) {
        setError('Email is required');
        return;
      }

      if (!email.includes('@')) {
        setError('Invalid email address');
        return;
      }

      // Create dummy invite locally (backend endpoint needed)
      const newInvite: TenantInvite = {
        id: Date.now().toString(),
        email,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      setInvites([newInvite, ...invites]);
      setSuccess(`Invite sent to ${email}`);
      setEmail('');
      setShowForm(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const handleCopyInviteLink = (email: string) => {
    const inviteLink = `${window.location.origin}/auth/register?invite=${email}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(email);
    setTimeout(() => setCopiedInvite(null), 2000);
  };

  const handleDeleteInvite = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invite?')) return;

    try {
      setInvites(invites.filter(invite => invite.id !== id));
      setSuccess('Invite cancelled');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invite');
    }
  };

  if (!canInviteTenants) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Tenant Management</h1>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            You don't have permission to manage tenants.
          </p>
          <Link href="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Invite Tenants</h1>
        <p>Send invitations to people looking for a house to rent.</p>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.2)',
            borderRadius: '6px',
            color: '#dc3545',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '6px',
            color: '#10b981',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          {success}
        </div>
      )}

      <div className="page-toolbar" style={{ marginBottom: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} />
          Send Tenant Invite
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', maxWidth: '500px' }}>
          <form onSubmit={handleSendInvite}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', display: 'block' }}>
                  Email Address
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="tenant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0' }}>
                They will receive an invitation link and can register as a tenant.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  <Mail size={16} style={{ marginRight: '4px' }} />
                  {sending ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEmail('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading tenant invites...</p>
        </div>
      ) : invites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            No tenant invites yet. Send one to get started.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Send First Invite
          </button>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Sent Date</th>
                  <th>Accepted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id}>
                    <td>
                      <strong>{invite.email}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background:
                            invite.status === 'accepted'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(251, 191, 36, 0.1)',
                          color:
                            invite.status === 'accepted'
                              ? '#10b981'
                              : '#f59e0b',
                        }}
                      >
                        {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(invite.created_at).toLocaleDateString()}</td>
                    <td>{invite.accepted_at ? new Date(invite.accepted_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {invite.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleCopyInviteLink(invite.email)}
                            title="Copy invite link"
                          >
                            {copiedInvite === invite.email ? (
                              <>
                                <Check size={14} />
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                              </>
                            )}
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteInvite(invite.id)}
                          title="Cancel invite"
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
        </div>
      )}

      <style jsx>{`
        table {
          border-collapse: collapse;
        }
        th,
        td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }
        th {
          font-weight: 600;
          background: var(--bg-secondary, #f9fafb);
          font-size: 12px;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        tr:hover {
          background: var(--bg-secondary, #f9fafb);
        }
      `}</style>
    </div>
  );
}
