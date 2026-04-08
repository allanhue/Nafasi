'use client';

import React, { useState } from 'react';

/* --- Types ----------------------------------------------- */
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  reorderLevel: number;
  eastlands: number;
  mombasaRd: number;
}

interface Movement {
  id: string;
  product: string;
  sku: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  qty: number;
  warehouse: string;
  movedBy: string;
  date: string;
  reference: string;
}

/* --- Data ------------------------------------------------- */
const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Cement bags (50kg)',    sku: 'CEM-001', category: 'Construction', unit: 'Bag',    reorderLevel: 20,  eastlands: 12, mombasaRd: 30 },
  { id: 'p2', name: 'Iron sheets 3m',         sku: 'IRN-004', category: 'Construction', unit: 'Sheet',  reorderLevel: 15,  eastlands: 8,  mombasaRd: 22 },
  { id: 'p3', name: 'PVC pipes 4"',            sku: 'PVC-007', category: 'Plumbing',     unit: 'Piece',  reorderLevel: 10,  eastlands: 5,  mombasaRd: 0 },
  { id: 'p4', name: 'Paint 20L white',         sku: 'PNT-012', category: 'Finishing',    unit: 'Tin',    reorderLevel: 8,   eastlands: 3,  mombasaRd: 6 },
  { id: 'p5', name: 'Steel rods 12mm (6m)',    sku: 'STL-003', category: 'Construction', unit: 'Rod',    reorderLevel: 30,  eastlands: 45, mombasaRd: 60 },
  { id: 'p6', name: 'Electrical cable 2.5mm', sku: 'ELC-019', category: 'Electrical',   unit: 'Meter',  reorderLevel: 100, eastlands: 320, mombasaRd: 0 },
  { id: 'p7', name: 'Roofing nails 4"',        sku: 'NAL-002', category: 'Hardware',     unit: 'Kg',     reorderLevel: 10,  eastlands: 28, mombasaRd: 15 },
  { id: 'p8', name: 'Door hinges (pair)',       sku: 'HNG-005', category: 'Hardware',     unit: 'Pair',   reorderLevel: 20,  eastlands: 44, mombasaRd: 12 },
];

const MOVEMENTS: Movement[] = [
  { id: 'm1', product: 'Steel rods 12mm (6m)',    sku: 'STL-003', type: 'in',         qty: 50,  warehouse: 'Eastlands',  movedBy: 'John Mwenda',   date: 'Apr 7',  reference: 'PO-2024-041' },
  { id: 'm2', product: 'Cement bags (50kg)',       sku: 'CEM-001', type: 'out',        qty: 20,  warehouse: 'Eastlands',  movedBy: 'James Mwangi',  date: 'Apr 6',  reference: 'SO-2024-089' },
  { id: 'm3', product: 'PVC pipes 4"',             sku: 'PVC-007', type: 'transfer',   qty: 10,  warehouse: 'Mombasa Rd', movedBy: 'Mary Kamau',    date: 'Apr 5',  reference: 'TR-2024-012' },
  { id: 'm4', product: 'Iron sheets 3m',           sku: 'IRN-004', type: 'in',         qty: 30,  warehouse: 'Mombasa Rd', movedBy: 'John Mwenda',   date: 'Apr 4',  reference: 'PO-2024-038' },
  { id: 'm5', product: 'Paint 20L white',          sku: 'PNT-012', type: 'out',        qty: 5,   warehouse: 'Eastlands',  movedBy: 'James Mwangi',  date: 'Apr 4',  reference: 'SO-2024-087' },
  { id: 'm6', product: 'Electrical cable 2.5mm',  sku: 'ELC-019', type: 'adjustment', qty: -15, warehouse: 'Eastlands',  movedBy: 'James Mwangi',  date: 'Apr 3',  reference: 'ADJ-2024-004' },
];

const MOVEMENT_META = {
  in:         { label: 'Stock in',    color: 'var(--status-success)', bg: 'var(--status-success-bg)', icon: '?' },
  out:        { label: 'Stock out',   color: 'var(--status-danger)',  bg: 'var(--status-danger-bg)',  icon: '?' },
  transfer:   { label: 'Transfer',    color: 'var(--status-info)',    bg: 'var(--status-info-bg)',    icon: '?' },
  adjustment: { label: 'Adjustment',  color: 'var(--status-warning)', bg: 'var(--status-warning-bg)', icon: '�' },
};

type Tab = 'products' | 'movements' | 'warehouses';

function isLowStock(p: Product): boolean {
  return (p.eastlands + p.mombasaRd) < p.reorderLevel;
}

/* --- Inventory Page --------------------------------------- */
export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [movementType, setMovementType] = useState<'in' | 'out' | 'transfer'>('in');

  const categories = ['all', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
  const lowStockCount = PRODUCTS.filter(isLowStock).length;

  const filteredProducts = PRODUCTS.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1>Inventory</h1>
            <p>Track stock levels, movements and warehouses</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => { setMovementType('out'); setShowAddMovement(true); }}>
              ? Issue stock
            </button>
            <button className="btn btn-primary" onClick={() => { setMovementType('in'); setShowAddMovement(true); }}>
              ? Receive stock
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--status-warning-bg)',
            border: '1px solid rgba(176, 122, 21, 0.25)',
            marginBottom: 20,
            fontSize: 13,
            color: 'var(--status-warning)',
          }}
        >
          <span style={{ fontWeight: 700 }}>!</span>
          <span>
            <strong>{lowStockCount} products</strong> are below reorder level and need restocking.
          </span>
          <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--status-warning)', fontWeight: 600 }}
            onClick={() => setActiveTab('products')}
          >
            View ?
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: 20 }}>
        {(['products', 'movements', 'warehouses'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 20px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--inventory-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--inventory-color)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {tab}
            {tab === 'products' && lowStockCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--status-danger)',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {lowStockCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {activeTab === 'products' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              className="input"
              placeholder="Search products, SKU�"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 280 }}
            />
            <select
              className="input select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ maxWidth: 180 }}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
              ))}
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Eastlands</th>
                  <th>Mombasa Rd</th>
                  <th>Total</th>
                  <th>Reorder at</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const total = p.eastlands + p.mombasaRd;
                  const low = total < p.reorderLevel;
                  return (
                    <tr key={p.id} style={{ background: low ? 'rgba(176, 122, 21, 0.03)' : undefined }}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-muted)' }}>{p.sku}</td>
                      <td>
                        <span className="badge badge-muted">{p.category}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: p.eastlands < p.reorderLevel / 2 ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                          {p.eastlands}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>{p.unit}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{p.mombasaRd}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 3 }}>{p.unit}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: low ? 'var(--status-danger)' : 'var(--status-success)' }}>
                        {total}
                      </td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>{p.reorderLevel}</td>
                      <td>
                        {low ? (
                          <span className="badge badge-warning">Low stock</span>
                        ) : (
                          <span className="badge badge-success">OK</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm">Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Movements tab */}
      {activeTab === 'movements' && (
        <div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Warehouse</th>
                  <th>By</th>
                  <th>Date</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {MOVEMENTS.map(m => {
                  const meta = MOVEMENT_META[m.type];
                  return (
                    <tr key={m.id}>
                      <td>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: 13 }}>{m.product}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.sku}</p>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 500,
                            background: meta.bg,
                            color: meta.color,
                          }}
                        >
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: m.qty < 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
                        {m.qty > 0 ? '+' : ''}{m.qty}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.warehouse}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.movedBy}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.date}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-muted)' }}>{m.reference}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warehouses tab */}
      {activeTab === 'warehouses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { name: 'Eastlands Warehouse', location: 'Eastleigh, Nairobi', products: PRODUCTS.reduce((s, p) => s + (p.eastlands > 0 ? 1 : 0), 0), totalUnits: PRODUCTS.reduce((s, p) => s + p.eastlands, 0), capacity: 72 },
            { name: 'Mombasa Rd Store',    location: 'Industrial Area, Nairobi', products: PRODUCTS.reduce((s, p) => s + (p.mombasaRd > 0 ? 1 : 0), 0), totalUnits: PRODUCTS.reduce((s, p) => s + p.mombasaRd, 0), capacity: 45 },
          ].map(w => (
            <div key={w.name} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--inventory-bg)',
                    border: '1px solid var(--inventory-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  ?
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{w.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{w.location}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[
                  { label: 'Active products', value: w.products },
                  { label: 'Total units',     value: w.totalUnits },
                ].map(s => (
                  <div key={s.label}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--inventory-color)' }}>{s.value}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Capacity used</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--inventory-color)' }}>{w.capacity}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-muted)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${w.capacity}%`,
                      borderRadius: 999,
                      background: w.capacity > 80 ? 'var(--status-warning)' : 'var(--inventory-color)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>View stock</button>
                <button className="btn btn-primary btn-sm" onClick={() => { setMovementType('in'); setShowAddMovement(true); }}>
                  + Receive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Movement modal */}
      {showAddMovement && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setShowAddMovement(false)}
        >
          <div
            className="card animate-in"
            style={{ width: 460, padding: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              Record stock movement
            </h2>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {(['in', 'out', 'transfer'] as const).map(t => {
                const meta = MOVEMENT_META[t];
                return (
                  <button
                    key={t}
                    onClick={() => setMovementType(t)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${movementType === t ? meta.color : 'var(--border-default)'}`,
                      background: movementType === t ? meta.bg : 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      fontWeight: movementType === t ? 600 : 400,
                      color: movementType === t ? meta.color : 'var(--text-secondary)',
                      transition: 'all 0.12s',
                    }}
                  >
                    {meta.icon} {meta.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Product</label>
                <select className="input select">
                  {PRODUCTS.map(p => <option key={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Quantity</label>
                  <input className="input" type="number" placeholder="0" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Warehouse</label>
                  <select className="input select">
                    <option>Eastlands Warehouse</option>
                    <option>Mombasa Rd Store</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>Reference (optional)</label>
                <input className="input" placeholder="e.g. PO-2024-042" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Record movement</button>
                <button className="btn btn-ghost" onClick={() => setShowAddMovement(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
