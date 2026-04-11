'use client';

import { useState, useRef, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';

type KebabItem = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
};

export default function KebabMenu({ items }: { items: KebabItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="kebab-menu">
      <button
        className="kebab-button"
        onClick={() => setOpen(!open)}
        title="More options"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontSize: '18px' }}
      >
        <BsThreeDots />
      </button>
      {open && (
        <div className="kebab-dropdown">
          {items.map((item, idx) => (
            <button
              key={idx}
              className={`kebab-item${item.danger ? ' danger' : ''}`}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {item.icon && <span style={{ fontSize: '16px', display: 'flex' }}>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
