'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Download, Filter } from 'lucide-react';

type PaymentStatus = 'paid' | 'pending' | 'failed';

type Payment = {
  id: string;
  customer: string;
  service: string;
  amount: string;
  method: string;
  status: PaymentStatus;
  date: string;
  daysOverdue?: number;
};

const PAYMENTS: Payment[] = [
  { id: 'TX-9021', customer: 'Nairobi Homes', service: 'Rental', amount: 'KES 120,000', method: 'M-Pesa', status: 'paid', date: 'Apr 8' },
  { id: 'TX-9019', customer: 'Juja Stores', service: 'Inventory', amount: 'KES 48,000', method: 'Card', status: 'pending', date: 'Apr 7', daysOverdue: 2 },
  { id: 'TX-9012', customer: 'Coastline Venues', service: 'Spaces', amount: 'KES 210,000', method: 'Bank', status: 'paid', date: 'Apr 6' },
  { id: 'TX-9007', customer: 'Ridgeway Apartments', service: 'Rental', amount: 'KES 75,000', method: 'M-Pesa', status: 'failed', date: 'Apr 6', daysOverdue: 5 },
  { id: 'TX-9003', customer: 'Imara Warehouses', service: 'Inventory', amount: 'KES 65,500', method: 'Card', status: 'paid', date: 'Apr 5' },
  { id: 'TX-8998', customer: 'Elite Office Spaces', service: 'Spaces', amount: 'KES 85,000', method: 'M-Pesa', status: 'pending', date: 'Apr 4', daysOverdue: 8 },
  { id: 'TX-8992', customer: 'Green Valley Estates', service: 'Rental', amount: 'KES 95,000', method: 'Bank', status: 'paid', date: 'Apr 3' },
];

const PAYMENT_STATS = [
  { label: 'Total Revenue (MTD)', value: 'KES 4.8M', delta: '+12%', trend: 'up' as const },
  { label: 'Payments Collected', value: '4 of 7', delta: '57%', trend: 'neutral' as const },
  { label: 'Pending Amount', value: 'KES 133k', delta: '+8%', trend: 'down' as const },
  { label: 'Failed Payments', value: '2', delta: '-1', trend: 'down' as const },
];

const FILTERS: { key: 'all' | PaymentStatus; label: string }[] = [
  { key: 'all', label: 'All Payments' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

const METHODS = ['All Methods', 'M-Pesa', 'Card', 'Bank'];

function PaymentStatCard({ stat }: { stat: typeof PAYMENT_STATS[0] }) {
  const trendColor = stat.trend === 'up' ? 'var(--status-success)' : stat.trend === 'down' ? 'var(--status-danger)' : 'var(--text-muted)';
  return (
    <div className="card">
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
        {stat.label}
      </p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
        {stat.value}
      </p>
      <p style={{ fontSize: 12, color: trendColor, fontWeight: 500 }}>
        {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.delta}
      </p>
    </div>
  );
}

export default function AdministratorPaymentsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | PaymentStatus>('all');
  const [selectedMethod, setSelectedMethod] = useState('All Methods');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    let result = PAYMENTS;

    if (activeFilter !== 'all') {
      result = result.filter(payment => payment.status === activeFilter);
    }

    if (selectedMethod !== 'All Methods') {
      result = result.filter(payment => payment.method === selectedMethod);
    }

    if (searchTerm) {
      result = result.filter(payment =>
        payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [activeFilter, selectedMethod, searchTerm]);

  const totalAmount = filtered.reduce((sum, p) => {
    const amount = parseInt(p.amount.replace(/[^\d]/g, ''));
    return sum + amount;
  }, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payments Management</h1>
          <p>Track customer subscriptions, invoices, and payment status across all services.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {PAYMENT_STATS.map(stat => (
          <PaymentStatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Filters Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Status Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className="btn btn-ghost btn-sm"
                style={{
                  background: activeFilter === filter.key ? 'var(--brand-accent)' : 'var(--bg-subtle)',
                  color: activeFilter === filter.key ? 'white' : 'var(--text-secondary)',
                  border: activeFilter === filter.key ? 'none' : '1px solid var(--border-subtle)',
                  fontWeight: activeFilter === filter.key ? 600 : 400,
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />

          {/* Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            {METHODS.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by customer or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <span className="section-title">Transactions</span>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Total: KES {(totalAmount / 1000).toFixed(0)}k • {filtered.length} transactions</p>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} of {PAYMENTS.length} shown</span>
        </div>

        {filtered.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => (
                  <tr key={payment.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>{payment.id}</td>
                    <td style={{ fontWeight: 500 }}>{payment.customer}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{payment.service}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{payment.amount}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{payment.method}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          className={`badge badge-${payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}`}
                        >
                          {payment.status}
                        </span>
                        {payment.daysOverdue && payment.daysOverdue > 0 && (
                          <span style={{ fontSize: 10, color: 'var(--status-danger)', fontWeight: 600 }}>
                            ({payment.daysOverdue}d overdue)
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{payment.date}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>No payments matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
