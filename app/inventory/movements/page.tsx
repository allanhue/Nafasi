'use client';

import { useEffect, useState } from 'react';

type Movement = {
  id: string;
  product_id: string;
  from_warehouse: string;
  to_warehouse: string;
  quantity: number;
  movement_type: string;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ product_id: '', from_warehouse: '', to_warehouse: '', quantity: '' });

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/movements`);
      if (!res.ok) throw new Error('Failed to fetch movements');
      const data = await res.json();
      setMovements(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: form.product_id,
          from_warehouse: form.from_warehouse,
          to_warehouse: form.to_warehouse,
          quantity: parseInt(form.quantity),
        }),
      });

      if (!res.ok) throw new Error('Failed to create movement');
      setForm({ product_id: '', from_warehouse: '', to_warehouse: '', quantity: '' });
      await fetchMovements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Movements</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Record Movement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Product ID"
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="From Warehouse"
              value={form.from_warehouse}
              onChange={(e) => setForm({ ...form, from_warehouse: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="To Warehouse"
              value={form.to_warehouse}
              onChange={(e) => setForm({ ...form, to_warehouse: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Record Movement
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Movement History</h2>
          {loading ? (
            <p>Loading...</p>
          ) : movements.length === 0 ? (
            <p className="text-gray-500">No movements recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">From</th>
                    <th className="text-left py-2">To</th>
                    <th className="text-left py-2">Quantity</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 text-xs text-gray-600">{movement.from_warehouse}</td>
                      <td className="py-2 text-xs text-gray-600">{movement.to_warehouse}</td>
                      <td className="py-2 font-semibold">{movement.quantity}</td>
                      <td className="py-2 text-xs text-gray-500">{new Date(movement.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
