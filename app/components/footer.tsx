import Link from 'next/link';

export default function Footer({
  activeMeta,
}: {
  activeMeta: { label: string; color: string };
}) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="brand-mark">N</span>
        <div>
          <p className="footer-title">Nafasi Platform</p>
          <p className="footer-subtitle">
            Unified rentals, inventory, and space bookings.
          </p>
        </div>
      </div>
      <div className="footer-links">
        <Link href="/help" className="footer-link">Help</Link>
        <Link href="/profile" className="footer-link">Profile</Link>
        <Link href="/dashboard" className="footer-link">Dashboard</Link>
      </div>
      <div className="footer-status" style={{ color: activeMeta.color }}>
        Active workspace: {activeMeta.label}
      </div>
    </footer>
  );
}
