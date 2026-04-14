'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdHomeWork } from 'react-icons/md';

type Property = {
  id: string;
  name: string;
  address: string;
  units: number;
  occupied: number;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:8080';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', address: '', units: '' });

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/rentals/properties`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      const data = await res.json();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/rentals/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address.trim(),
          units: Number.parseInt(form.units, 10) || 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to create property');

      setForm({ name: '', address: '', units: '' });
      setSuccess('Property created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchProperties();
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
      const res = await fetch(`${API_BASE_URL}/api/rentals/properties?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete property');

      setSuccess('Property deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchProperties();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Properties</h1>
        <p>Add properties, track occupancy, and manage rentals.</p>
      </div>

      {success ? <div className="alert alert-success">{success}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div className="card">
          <button
            type="button"
            onClick={() => setExpandedForm((v) => !v)}
            className={`collapsible-header w-full${expandedForm ? ' open' : ''}`}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>New Property</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm ? (
            <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Property Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  placeholder="e.g. Sunrise Apartments"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  className="form-input"
                  value={form.address}
                  onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))}
                  placeholder="e.g. Kilimani, Nairobi"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Units</label>
                <input
                  className="form-input"
                  inputMode="numeric"
                  value={form.units}
                  onChange={(e) => setForm((c) => ({ ...c, units: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Create Property'}
              </button>
            </form>
          ) : null}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>All Properties</h2>
            <button className="btn btn-ghost btn-sm" type="button" onClick={fetchProperties} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading properties…</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdHomeWork />
              </div>
              <h3>No properties yet</h3>
              <p>Create your first property using the form.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {properties.map((property) => {
                const occupancy =
                  property.units > 0 ? Math.round((property.occupied / property.units) * 100) : 0;

                return (
                  <div key={property.id} className="grid-card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{property.name}</div>
                        <div className="card-subtitle">{property.address}</div>
                      </div>
                      <KebabMenu
                        items={[
                          {
                            label: 'Delete',
                            icon: <MdDelete />,
                            danger: true,
                            onClick: () => setDeleteConfirm(property.id),
                          },
                        ]}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#6b7280', fontSize: 14 }}>
                      <span>
                        <strong style={{ color: '#374151' }}>Units:</strong> {property.units}
                      </span>
                      <span>
                        <strong style={{ color: '#374151' }}>Occupied:</strong> {property.occupied}
                      </span>
                      <span>
                        <strong style={{ color: '#374151' }}>Occupancy:</strong> {occupancy}%
                      </span>
                    </div>

                    {deleteConfirm === property.id ? (
                      <div style={{ marginTop: 12 }} className="alert alert-warning">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <span>Delete this property?</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-primary btn-sm"
                              type="button"
                              onClick={() => handleDelete(property.id)}
                            >
                              Delete
                            </button>
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDeleteConfirm(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {submitting ? <LoadingOverlay /> : null}
    </div>
  );
}

