export default function ReportsPage() {
  return (
    <div>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Quick snapshots for rentals, inventory, spaces, and admin.</p>
      </div>

      <div className="service-grid">
        <div className="card service-card">
          <div className="service-header">
            <div className="service-icon context-tag context-rental">RN</div>
            <div>
              <h2>Rental Reports</h2>
              <p>Collections, occupancy, and expenses.</p>
            </div>
          </div>
          <div className="service-description">
            <p>Includes:</p>
            <ul style={{ marginTop: 8, paddingLeft: 18, color: 'var(--text-secondary)' }}>
              <li>Monthly rent collection summary</li>
              <li>Tenant payment history</li>
              <li>Property occupancy rates</li>
              <li>Maintenance expenses</li>
            </ul>
          </div>
        </div>

        <div className="card service-card">
          <div className="service-header">
            <div className="service-icon context-tag context-inventory">IV</div>
            <div>
              <h2>Inventory Reports</h2>
              <p>Utilization, movement, and valuation.</p>
            </div>
          </div>
          <div className="service-description">
            <p>Includes:</p>
            <ul style={{ marginTop: 8, paddingLeft: 18, color: 'var(--text-secondary)' }}>
              <li>Stock movement summary</li>
              <li>Warehouse utilization</li>
              <li>Product level analysis</li>
              <li>Inventory valuation</li>
            </ul>
          </div>
        </div>

        <div className="card service-card">
          <div className="service-header">
            <div className="service-icon context-tag context-spaces">SP</div>
            <div>
              <h2>Spaces Reports</h2>
              <p>Bookings, revenue, and utilization.</p>
            </div>
          </div>
          <div className="service-description">
            <p>Includes:</p>
            <ul style={{ marginTop: 8, paddingLeft: 18, color: 'var(--text-secondary)' }}>
              <li>Booking statistics</li>
              <li>Revenue analytics</li>
              <li>Space utilization</li>
              <li>Guest feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

