'use client';

import { useMemo, useState } from 'react';

type PaymentStatus = 'paid' | 'pending' | 'failed';

type Payment = {
  id: string;
  customer: string;
  service: string;
  amount: string;
  method: string;
  status: PaymentStatus;
  date: string;
};

const PAYMENTS: Payment[] = [
  { id: 'TX-9021', customer: 'Nairobi Homes', service: 'Rental', amount: 'KES 120,000', method: 'M-Pesa', status: 'paid', date: 'Apr 8' },
  { id: 'TX-9019', customer: 'Juja Stores', service: 'Inventory', amount: 'KES 48,000', method: 'Card', status: 'pending', date: 'Apr 7' },
  { id: 'TX-9012', customer: 'Coastline Venues', service: 'Spaces', amount: 'KES 210,000', method: 'Bank', status: 'paid', date: 'Apr 6' },
  { id: 'TX-9007', customer: 'Ridgeway Apartments', service: 'Rental', amount: 'KES 75,000', method: 'M-Pesa', status: 'failed', date: 'Apr 6' },
  { id: 'TX-9003', customer: 'Imara Warehouses', service: 'Inventory', amount: 'KES 65,500', method: 'Card', status: 'paid', date: 'Apr 5' },
];

const FILTERS: { key: 'all' | PaymentStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

export default function AdministratorPaymentsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | PaymentStatus>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return PAYMENTS;
    return PAYMENTS.filter(payment => payment.status === activeFilter);
  }, [activeFilter]);

  return (
    <div>
      <div className="page-header">
        <h1>Payments</h1>
        <p>Track customer subscriptions, invoices, and payment status.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTERS.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className="btn btn-ghost btn-sm"
            style={{
              background: activeFilter === filter.key ? 'var(--brand-accent-muted)' : 'transparent',
              color: activeFilter === filter.key ? 'var(--brand-primary)' : 'var(--text-secondary)',
              border: activeFilter === filter.key ? '1px solid var(--brand-accent)' : '1px solid transparent',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="section-header">
          <span className="section-title">Latest transactions</span>
          <button className="btn btn-ghost btn-sm">Export</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(payment => (
                <tr key={payment.id}>
                  <td style={{ fontWeight: 600 }}>{payment.id}</td>
                  <td>{payment.customer}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{payment.service}</td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{payment.amount}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{payment.method}</td>
                  <td>
                    <span
                      className={`badge badge-${payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
