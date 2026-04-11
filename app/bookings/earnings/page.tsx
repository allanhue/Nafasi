'use client';

import { useEffect, useState } from 'react';

type Earning = {
  id: string;
  space_id: string;
  booking_id: string;
  amount: number;
  period: string;
  created_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/earnings`);
      if (!res.ok) throw new Error('Failed to fetch earnings');
      const data = await res.json();
      setEarnings(data || []);
      const total = (data || []).reduce((sum: number, e: Earning) => sum + e.amount, 0);
      setTotalEarnings(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Group earnings by period
  const groupedByPeriod = earnings.reduce((acc: Record<string, Earning[]>, earning) => {
    if (!acc[earning.period]) {
      acc[earning.period] = [];
    }
    acc[earning.period].push(earning);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Earnings</h3>
          <p className="text-4xl font-bold text-green-600">KES {totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Bookings</h3>
          <p className="text-4xl font-bold">{earnings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Average per Booking</h3>
          <p className="text-4xl font-bold">KES {earnings.length > 0 ? Math.round(totalEarnings / earnings.length).toLocaleString() : '0'}</p>
        </div>
      </div>

      {/* Earnings by period */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Earnings Breakdown</h2>
        {loading ? (
          <p>Loading...</p>
        ) : Object.keys(groupedByPeriod).length === 0 ? (
          <p className="text-gray-500">No earnings recorded yet</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByPeriod).map(([period, periodEarnings]) => {
              const periodTotal = periodEarnings.reduce((sum, e) => sum + e.amount, 0);
              return (
                <div key={period}>
                  <h3 className="font-semibold mb-3 pb-2 border-b">{period}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-2 px-2">Booking ID</th>
                          <th className="text-right py-2 px-2">Amount</th>
                          <th className="text-left py-2 px-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodEarnings.map((earning) => (
                          <tr key={earning.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 text-xs font-mono">{earning.booking_id}</td>
                            <td className="py-2 px-2 text-right font-semibold">KES {earning.amount.toLocaleString()}</td>
                            <td className="py-2 px-2 text-xs text-gray-500">{new Date(earning.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-right mt-2 pt-2 border-t font-semibold">
                    Period Total: KES {periodTotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
