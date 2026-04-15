'use client';

import { useEffect, useMemo, useState } from 'react';
import KebabMenu from '@/app/components/kebab-menu';
import { LoadingOverlay } from '@/app/components/loading';
import { MdDelete, MdInventory2 } from 'react-icons/md';

type Warehouse = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number | null;
  warehouse_id: string | null;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedForm, setExpandedForm] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    quantity: '',
    unit_price: '',
    warehouse_id: '',
  });

  const warehouseNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of warehouses) map.set(w.id, w.name);
    return map;
  }, [warehouses]);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/warehouses`);
      if (!res.ok) return;
      const data = await res.json();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch {
      // Ignore: page still works without warehouse names.
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: form.sku.trim() || null,
          name: form.name.trim(),
          quantity: Number.parseInt(form.quantity, 10) || 0,
          unit_price: form.unit_price.trim() === '' ? null : Number.parseFloat(form.unit_price),
          warehouse_id: form.warehouse_id.trim() === '' ? null : form.warehouse_id.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create product');

      setForm({ sku: '', name: '', quantity: '', unit_price: '', warehouse_id: '' });
      setSuccess('Product created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchProducts();
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
      const res = await fetch(`${API_BASE_URL}/api/inventory/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');

      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchProducts();
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
        <h1>Products</h1>
        <p>Create, track, and manage inventory items.</p>
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
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>New Product</h2>
            <span className="collapsible-caret">{expandedForm ? '▼' : '▶'}</span>
          </button>

          {expandedForm ? (
            <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  placeholder="e.g. Cement bags (50kg)"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  className="form-input"
                  value={form.sku}
                  onChange={(e) => setForm((c) => ({ ...c, sku: e.target.value }))}
                  placeholder="e.g. CEM-001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  className="form-input"
                  inputMode="numeric"
                  value={form.quantity}
                  onChange={(e) => setForm((c) => ({ ...c, quantity: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit Price (KES)</label>
                <input
                  className="form-input"
                  inputMode="decimal"
                  value={form.unit_price}
                  onChange={(e) => setForm((c) => ({ ...c, unit_price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse</label>
                <select
                  className="form-select"
                  value={form.warehouse_id}
                  onChange={(e) => setForm((c) => ({ ...c, warehouse_id: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Create Product'}
              </button>
            </form>
          ) : null}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>All Products</h2>
            <button className="btn btn-ghost btn-sm" type="button" onClick={fetchProducts} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-state-spinner loading-spinner" />
              <p>Loading products…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <MdInventory2 />
              </div>
              <h3>No products yet</h3>
              <p>Create your first product using the form.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {products.map((product) => {
                const warehouseName = product.warehouse_id ? warehouseNameById.get(product.warehouse_id) : null;

                return (
                  <div key={product.id} className="grid-card">
                    <div className="card-header">
                      <div>
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {product.name}
                          {product.sku ? <span className="badge badge-muted">{product.sku}</span> : null}
                        </div>
                        <div className="card-subtitle">
                          {warehouseName ? `Warehouse: ${warehouseName}` : 'Warehouse: Unassigned'}
                        </div>
                      </div>

                      <KebabMenu
                        items={[
                          {
                            label: 'Delete',
                            icon: <MdDelete />,
                            danger: true,
                            onClick: () => setDeleteConfirm(product.id),
                          },
                        ]}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#6b7280', fontSize: 14 }}>
                      <span>
                        <strong style={{ color: '#374151' }}>Qty:</strong> {product.quantity}
                      </span>
                      <span>
                        <strong style={{ color: '#374151' }}>Unit Price:</strong>{' '}
                        {product.unit_price == null ? '—' : `KES ${product.unit_price.toLocaleString()}`}
                      </span>
                    </div>

                    {deleteConfirm === product.id ? (
                      <div style={{ marginTop: 12 }} className="alert alert-warning">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <span>Delete this product?</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary btn-sm" type="button" onClick={() => handleDelete(product.id)}>
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
