'use client';

import { useEffect, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdBuild } from 'react-icons/md';

type MaintenanceRequest = {
  id: string;
  property_id: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [form, setForm] = useState({ property_id: '', description: '', priority: 'normal' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/rentals/maintenance`);
      if (!res.ok) throw new Error('Failed to fetch maintenance requests');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API_BASE_URL}/api/rentals/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to create maintenance request');
      
      setForm({ property_id: '', description: '', priority: 'normal' });
      setSuccess('Maintenance request submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchMaintenance();
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
      const res = await fetch(`${API_BASE_URL}/api/rentals/maintenance?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete maintenance request');
      
      setSuccess('Maintenance request deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchMaintenance();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return { background: '#fee2e2', color: '#991b1b' };
      case 'high':
        return { background: '#fed7aa', color: '#92400e' };
      case 'normal':
        return { background: '#bfdbfe', color: '#1e40af' };
      case 'low':
        return { background: '#dcfce7', color: '#166534' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'badge-danger';
      case 'normal':
        return 'badge-info';
      case 'low':
        return 'badge-success';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>

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
            <h2 className="text-lg font-semibold">New Request</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Property ID *</label>
                <input
                  type="text"
                  placeholder="Property ID"
                  value={form.property_id}
                  onChange={(e) => setForm({ ...form, property_id: e.target.value })}
                  className="form-input"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea
                  placeholder="Describe the maintenance issue"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label">Priority *</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="form-input"
                  disabled={submitting}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-full-width"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Active Requests ({requests.length})</h2>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading maintenance requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdBuild />
              </div>
              <div className="empty-state-title">No maintenance requests</div>
              <div className="empty-state-description">Submit your first request using the form</div>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const priorityColors = getPriorityColor(req.priority);
                return (
                  <div key={req.id} className="grid-card">
                    <div className="card-header">
                      <div>
                        <div className="card-title">{req.description.substring(0, 50)}</div>
                        <div className="card-subtitle">Property: {req.property_id}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                          {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                        </div>
                        <KebabMenu
                          items={[
                            {
                              label: 'Delete',
                              icon: <MdDelete />,
                              danger: true,
                              onClick: () => setDeleteConfirm(req.id),
                            },
                          ]}
                        />
                      </div>
                    </div>

                    <div className="card-detail-row">
                      <div><span className="card-detail-label">Status:</span> {req.status}</div>
                      <div><span className="card-detail-label">Created:</span> {new Date(req.created_at).toLocaleDateString()}</div>
                      <div><span className="card-detail-label">Updated:</span> {new Date(req.updated_at).toLocaleDateString()}</div>
                    </div>

                    {deleteConfirm === req.id && (
                      <div className="delete-confirm">
                        <p className="delete-confirm-text">
                          Are you sure you want to delete this request?
                        </p>
                        <div className="button-group">
                          <button
                            onClick={() => handleDelete(req.id)}
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
