'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, Clock, CheckCircle2, MessageSquare, X, Filter } from 'lucide-react';

type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';

type Ticket = {
  id: string;
  title: string;
  description: string;
  customer: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  created: string;
  updated: string;
  assignee?: string;
  responses: number;
};

const TICKETS: Ticket[] = [
  {
    id: 'TKT-2847',
    title: 'Payment gateway timeout on M-Pesa',
    description: 'Users experiencing timeout errors when paying via M-Pesa',
    customer: 'Multiple customers',
    priority: 'critical',
    status: 'in-progress',
    category: 'Technical',
    created: 'Apr 16, 2:30 PM',
    updated: 'Apr 16, 3:15 PM',
    assignee: 'John K.',
    responses: 4,
  },
  {
    id: 'TKT-2846',
    title: 'Export feature not working for inventory reports',
    description: 'CSV export button is disabled in inventory reports',
    customer: 'Juja Stores',
    priority: 'high',
    status: 'open',
    category: 'Feature Bug',
    created: 'Apr 16, 1:45 PM',
    updated: 'Apr 16, 1:45 PM',
    responses: 0,
  },
  {
    id: 'TKT-2845',
    title: 'Invoice template customization request',
    description: 'Customer wants to customize invoice headers with logo',
    customer: 'Nairobi Homes',
    priority: 'medium',
    status: 'waiting',
    category: 'Feature Request',
    created: 'Apr 15, 4:20 PM',
    updated: 'Apr 15, 5:30 PM',
    assignee: 'Sarah M.',
    responses: 2,
  },
  {
    id: 'TKT-2844',
    title: 'Tenant verification delays',
    description: 'KYC verification process taking longer than expected',
    customer: 'Multiple customers',
    priority: 'high',
    status: 'in-progress',
    category: 'Admin',
    created: 'Apr 15, 10:00 AM',
    updated: 'Apr 16, 9:30 AM',
    assignee: 'Admin Team',
    responses: 5,
  },
  {
    id: 'TKT-2843',
    title: 'Calendar sync issues with Google Calendar',
    description: 'Events not syncing properly to Google Calendar',
    customer: 'Elite Office Spaces',
    priority: 'medium',
    status: 'resolved',
    category: 'Integration',
    created: 'Apr 14, 6:15 PM',
    updated: 'Apr 15, 11:30 AM',
    responses: 3,
  },
  {
    id: 'TKT-2842',
    title: 'Dashboard performance optimization',
    description: 'Dashboard loads slowly with 1000+ units',
    customer: 'Coastline Venues',
    priority: 'low',
    status: 'open',
    category: 'Performance',
    created: 'Apr 14, 2:00 PM',
    updated: 'Apr 14, 2:00 PM',
    responses: 1,
  },
];

const STATUS_COLORS: Record<TicketStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  open: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--brand-accent)', icon: <AlertCircle size={12} /> },
  'in-progress': { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--brand-accent)', icon: <Clock size={12} /> },
  waiting: { bg: 'rgba(234, 179, 8, 0.1)', text: 'var(--status-warning)', icon: <Clock size={12} /> },
  resolved: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--status-success)', icon: <CheckCircle2 size={12} /> },
  closed: { bg: 'rgba(107, 114, 128, 0.1)', text: 'var(--text-muted)', icon: <X size={12} /> },
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'var(--text-muted)',
  medium: 'var(--status-warning)',
  high: 'var(--status-danger)',
  critical: '#ff0000',
};

function TicketRow({ ticket, onSelect }: { ticket: Ticket; onSelect: (ticket: Ticket) => void }) {
  const statusStyle = STATUS_COLORS[ticket.status];
  const priorityColor = PRIORITY_COLORS[ticket.priority];

  return (
    <div
      onClick={() => onSelect(ticket)}
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 100px 80px 100px 60px',
        gap: 12,
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-subtle)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--bg-muted)';
        el.style.borderColor = 'var(--border-default)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'var(--bg-subtle)';
        el.style.borderColor = 'var(--border-subtle)';
      }}
    >
      {/* Priority Indicator */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: priorityColor,
      }} />

      {/* Ticket Info */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ticket.id}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ticket.title}</p>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: 4,
          background: statusStyle.bg,
          color: statusStyle.text,
        }}>
          {statusStyle.icon}
          {ticket.status}
        </span>
      </div>

      {/* Priority */}
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: priorityColor,
        textTransform: 'capitalize',
      }}>
        {ticket.priority}
      </div>

      {/* Assignee */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {ticket.assignee || '-'}
      </div>

      {/* Responses */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
        <MessageSquare size={14} />
        {ticket.responses}
      </div>
    </div>
  );
}

export default function AdminTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return TICKETS.filter(ticket => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
      if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !ticket.customer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, priorityFilter, searchTerm]);

  const stats = {
    total: TICKETS.length,
    open: TICKETS.filter(t => t.status === 'open').length,
    critical: TICKETS.filter(t => t.priority === 'critical').length,
    avgResponse: 3,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Support Tickets</h1>
          <p>Manage customer support requests and system escalations.</p>
        </div>
        <button className="btn btn-primary">+ New Ticket</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Tickets', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Open Issues', value: stats.open, color: 'var(--brand-accent)' },
          { label: 'Critical', value: stats.critical, color: 'var(--status-danger)' },
          { label: 'Avg. Response Time', value: `${stats.avgResponse}h`, color: 'var(--status-success)' },
        ].map((stat, idx) => (
          <div key={idx} className="card">
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by ticket ID, title, or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: 250,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Tickets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 320px' : '1fr', gap: 20 }}>
        {/* Tickets List */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <span className="section-title">Tickets</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} of {TICKETS.length}</span>
          </div>

          {filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map(ticket => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelectedTicket}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>No tickets matching your filters</p>
            </div>
          )}
        </div>

        {/* Ticket Details Sidebar */}
        {selectedTicket && (
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Details</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>ID</p>
                <p style={{ fontSize: 12, fontWeight: 600 }}>{selectedTicket.id}</p>
              </div>

              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Status</p>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: STATUS_COLORS[selectedTicket.status].bg,
                  color: STATUS_COLORS[selectedTicket.status].text,
                }}>
                  {STATUS_COLORS[selectedTicket.status].icon}
                  {selectedTicket.status}
                </span>
              </div>

              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Priority</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: PRIORITY_COLORS[selectedTicket.priority], textTransform: 'capitalize' }}>
                  {selectedTicket.priority}
                </p>
              </div>

              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Assignee</p>
                <p style={{ fontSize: 12 }}>{selectedTicket.assignee || 'Unassigned'}</p>
              </div>

              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Customer</p>
                <p style={{ fontSize: 12 }}>{selectedTicket.customer}</p>
              </div>

              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>Created</p>
                <p style={{ fontSize: 12 }}>{selectedTicket.created}</p>
              </div>

              <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                Open Full View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
