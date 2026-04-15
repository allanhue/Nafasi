'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import NotificationsComponent from '../notifications/notifications';

export default function NotificationDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="nafasi-drawer-root" role="presentation">
      <button
        type="button"
        className="nafasi-drawer-overlay"
        aria-label="Close notifications"
        onClick={onClose}
      />

      <aside
        className="nafasi-drawer nafasi-drawer-right"
        id="notifications-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
      >
        <div className="nafasi-drawer-header">
          <div className="nafasi-drawer-title">Notifications</div>
          <div className="nafasi-drawer-header-actions">
            <Link className="btn btn-ghost btn-sm" href="/notifications" onClick={onClose}>
              View all
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              aria-label="Close"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="nafasi-drawer-body">
          <NotificationsComponent compact />
        </div>
      </aside>
    </div>
  );
}
