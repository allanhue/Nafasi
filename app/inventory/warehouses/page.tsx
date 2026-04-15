'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdWarehouse } from 'react-icons/md';

type Warehouse = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  used: number;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [form, setForm] = useState({ name: '', location: '', capacity: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/warehouses`);
      if (!res.ok) throw new Error('Failed to fetch warehouses');
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API_BASE_URL}/api/inventory/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          capacity: parseInt(form.capacity),
        }),
      });

      if (!res.ok) throw new Error('Failed to create warehouse');
      
      setForm({ name: '', location: '', capacity: '' });
      setSuccess('Warehouse created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchWarehouses();
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
      const res = await fetch(`${API_BASE_URL}/api/inventory/warehouses?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete warehouse');
      
      setSuccess('Warehouse deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchWarehouses();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Warehouses</h1>

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
          >
            <h2 className="text-lg font-semibold">New Warehouse</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Warehouse Name *</label>
                <input
                  type="text"
                  placeholder="Warehouse Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="form-input"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Capacity (units) *</label>
                <input
                  type="number"
                  placeholder="Capacity"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-full-width"
              >
                {submitting ? 'Creating...' : 'Create Warehouse'}
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Warehouses ({warehouses.length})</h2>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading warehouses...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdWarehouse />
              </div>
              <div className="empty-state-title">No warehouses found</div>
              <div className="empty-state-description">Create your first warehouse using the form</div>
            </div>
          ) : (
            <div className="space-y-3">
              {warehouses.map((warehouse) => {
                const utilization = warehouse.capacity > 0 ? Math.round((warehouse.used / warehouse.capacity) * 100) : 0;
                return (
                  <div key={warehouse.id} className="grid-card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{warehouse.name}</div>
                        <div className="card-subtitle">{warehouse.location || 'No location'}</div>
                      </div>
                      <KebabMenu
                        items={[
                          {
                            label: 'Delete',
                            icon: <MdDelete />,
                            danger: true,
                            onClick: () => setDeleteConfirm(warehouse.id),
                          },
                        ]}
                      />
                    </div>

                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 500 }}>
                          <span>Capacity</span>
                          <span>{warehouse.used} / {warehouse.capacity} units</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <div className="progress-label">{utilization}% utilized</div>
                      </div>
                      <div><strong>Created:</strong> {new Date(warehouse.created_at).toLocaleDateString()}</div>
                    </div>

                    {deleteConfirm === warehouse.id && (
                      <div className="delete-confirm">
                        <p className="delete-confirm-text">
                          Are you sure you want to delete this warehouse?
                        </p>
                        <div className="button-group">
                          <button
                            onClick={() => handleDelete(warehouse.id)}
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {submitting && <LoadingOverlay />}
    </div>
  );
}
