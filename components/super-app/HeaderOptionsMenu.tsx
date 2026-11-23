'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MoreVerticalIcon } from '@hugeicons/core-free-icons';

export interface HeaderMenuItem {
  label: string;
  onSelect: () => void;
  /** Destructive actions (clear, log out) are drawn in red. */
  isDanger?: boolean;
}

/* The ⋮ button at the right end of every chat header, with its dropdown. */
export function HeaderOptionsMenu({ items }: { items: HeaderMenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clicking anywhere else closes it, like a native menu.
  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-label="Options"
        aria-expanded={isOpen}
        className="flex size-[36px] cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5"
      >
        <HugeiconsIcon icon={MoreVerticalIcon} size={20} />
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-[40px] z-50 w-[200px] overflow-hidden rounded-[12px] border border-line bg-white py-[6px] shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              className={`w-full cursor-pointer px-[16px] py-[10px] text-left text-[14px] font-medium hover:bg-surface ${
                item.isDanger ? 'text-[#d64545]' : 'text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
