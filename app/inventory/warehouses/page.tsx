'use client';

import { useEffect, useState } from 'react';

type Warehouse = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  used: number;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', location: '', capacity: '' });

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
      setWarehouses(data || []);
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
      await fetchWarehouses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Warehouses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">New Warehouse</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Warehouse Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Capacity (units)"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700"
            >
              Create Warehouse
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Warehouses</h2>
          {loading ? (
            <p>Loading...</p>
          ) : warehouses.length === 0 ? (
            <p className="text-gray-500">No warehouses found</p>
          ) : (
            <div className="space-y-4">
              {warehouses.map((warehouse) => {
                const utilization = warehouse.capacity > 0 ? Math.round((warehouse.used / warehouse.capacity) * 100) : 0;
                return (
                  <div key={warehouse.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="font-semibold mb-2">{warehouse.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{warehouse.location}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Capacity</span>
                        <span>{warehouse.used} / {warehouse.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${utilization}%` }} />
                      </div>
                      <p className="text-xs text-gray-500">{utilization}% utilization</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
