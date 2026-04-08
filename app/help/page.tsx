'use client';

import { useState } from 'react';
import Link from 'next/link';

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: 'How do I add a new rental unit?',
    answer:
      'Go to Rentals, select Properties, and use the Add unit button. You can also import units in bulk from a CSV file.',
  },
  {
    question: 'Where can I see overdue payments?',
    answer:
      'Open Rentals, then Payments. Filter by status and select Late to view overdue rent by tenant and unit.',
  },
  {
    question: 'How do I reset my password?',
    answer:
      'Open Profile, select Security, and choose Reset password. A verification link will be sent to your email.',
  },
  {
    question: 'Can I move stock between warehouses?',
    answer:
      'Yes. In Inventory, open Movements and create a transfer between locations. The system keeps a full audit trail.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Use the support channels in this page. For urgent issues, use the phone line marked Priority.',
  },
];

const SUPPORT_CHANNELS = [
  { label: 'Email', detail: 'support@nafasi.co.ke', badge: 'Response in 2h' },
  { label: 'Phone', detail: '+254 700 111 222', badge: 'Priority line' },
  { label: 'WhatsApp', detail: '+254 700 333 444', badge: 'Mon to Sat' },
];

const QUICK_LINKS = [
  { label: 'User guide', href: '/help/user-guide' },
  { label: 'Billing FAQ', href: '/help/billing' },
  { label: 'Product updates', href: '/help/updates' },
  { label: 'Report a bug', href: '/help/bug' },
];

const TICKETS = [
  { id: 'NF-1024', subject: 'Tenant portal access', status: 'open', updated: '2 hours ago' },
  { id: 'NF-1019', subject: 'Invoice export format', status: 'pending', updated: 'Yesterday' },
  { id: 'NF-1012', subject: 'Booking refund request', status: 'resolved', updated: '2 days ago' },
];

export default function HelpAndSupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      <div className="page-header">
        <h1>Help and support</h1>
        <p>Guides, FAQs, and ways to get in touch with the Nafasi team.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="section-header" style={{ marginBottom: 12 }}>
              <span className="section-title">Find answers fast</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="input"
                placeholder="Search help topics"
                aria-label="Search help topics"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary btn-sm">Search</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {QUICK_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="btn btn-ghost btn-sm">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <span className="section-title">Frequently asked questions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQS.map((item, index) => {
                const open = openIndex === index;
                return (
                  <div
                    key={item.question}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      background: open ? 'var(--bg-subtle)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(open ? null : index)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                      }}
                      aria-expanded={open}
                    >
                      {item.question}
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '-' : '+'}</span>
                    </button>
                    {open && (
                      <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <span className="section-title">Still need help?</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Create a support ticket and we will follow up with you quickly.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm">Create ticket</button>
              <button className="btn btn-ghost btn-sm">View my tickets</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="section-header">
              <span className="section-title">Support channels</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SUPPORT_CHANNELS.map(channel => (
                <div
                  key={channel.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{channel.label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{channel.detail}</p>
                  </div>
                  <span className="badge badge-info">{channel.badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <span className="section-title">System status</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Overall status</span>
                <span className="badge badge-success">All systems operational</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Last incident</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mar 28, 2026</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Uptime (30 days)</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>99.98%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <span className="section-title">Recent tickets</span>
              <button className="btn btn-ghost btn-sm">Open support</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TICKETS.map(ticket => (
                <div key={ticket.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{ticket.subject}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ticket.id} - {ticket.updated}</p>
                  </div>
                  <span className={`badge badge-${ticket.status === 'resolved' ? 'success' : ticket.status === 'pending' ? 'warning' : 'info'}`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
