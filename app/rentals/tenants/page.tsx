'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdPerson } from 'react-icons/md';

type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_id: string;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '', property_id: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/rentals/tenants`);
      if (!res.ok) throw new Error('Failed to fetch tenants');
      const data = await res.json();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/rentals/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to create tenant');
      
      setForm({ name: '', email: '', phone: '', property_id: '' });
      setSuccess('Tenant added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTenants();
      setExpandedForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/rentals/tenants?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete tenant');
      
      setSuccess('Tenant deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTenants();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tenants</h1>

      {/* Success message */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <button
            onClick={() => setExpandedForm(!expandedForm)}
            className="collapsible-header w-full"
            style={{ borderRadius: expandedForm ? '8px 8px 0 0' : '8px' }}
          >
            <h2 className="text-lg font-semibold">Add Tenant</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  placeholder="Tenant name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Property ID</label>
                <input
                  type="text"
                  placeholder="Property ID"
                  value={form.property_id}
                  onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-full-width"
              >
                {submitting ? 'Adding...' : 'Add Tenant'}
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tenant List ({tenants.length})</h2>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading tenants...</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdPerson />
              </div>
              <div className="empty-state-title">No tenants found</div>
              <div className="empty-state-description">Add your first tenant using the form</div>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="grid-card">
                  <div className="card-header">
                    <div>
                      <div className="card-title">{tenant.name}</div>
                      <div className="card-subtitle">{tenant.email || 'No email'}</div>
                    </div>
                    <KebabMenu
                      items={[
                        {
                          label: 'Delete',
                          icon: <MdDelete />,
                          danger: true,
                          onClick: () => setDeleteConfirm(tenant.id),
                        },
                      ]}
                    />
                  </div>

                  <div className="card-detail-row">
                    <div><span className="card-detail-label">Phone:</span> {tenant.phone || '-'}</div>
                    <div><span className="card-detail-label">Property:</span> {tenant.property_id}</div>
                    <div><span className="card-detail-label">Added:</span> {new Date(tenant.created_at).toLocaleDateString()}</div>
                  </div>

                  {deleteConfirm === tenant.id && (
                    <div className="delete-confirm">
                      <p className="delete-confirm-text">
                        Are you sure you want to delete this tenant?
                      </p>
                      <div className="button-group">
                        <button
                          onClick={() => handleDelete(tenant.id)}
                          disabled={submitting}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={submitting}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {submitting && <LoadingOverlay />}
    </div>
  );
}
