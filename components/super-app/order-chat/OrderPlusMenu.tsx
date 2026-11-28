'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PauseCircleIcon, PlayCircleIcon, PlusSignIcon } from '@hugeicons/core-free-icons';

interface OrderPlusMenuItem {
  label: string;
  onSelect: () => void;
  /** Draws the play icon (Resume) instead of pause (Hold). */
  isResume?: boolean;
}

/*
 * The green + beside a staff member's order message box, the same button the provider has, with the order actions
 * staff may take there (for now Hold / Resume). It goes in OrderChatComposer's actions slot.
 */
export function OrderPlusMenu({ items }: { items: OrderPlusMenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-label="Order actions"
        aria-expanded={isOpen}
        className="btn-raised flex size-[40px] cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />
      </button>

      {isOpen && (
        <div role="menu" className="absolute bottom-[48px] right-0 z-30 w-[220px] rounded-[12px] border border-line bg-white p-[6px] shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                item.onSelect();
              }}
              className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left text-[14px] font-semibold text-ink hover:bg-surface"
            >
              <HugeiconsIcon icon={item.isResume ? PlayCircleIcon : PauseCircleIcon} size={18} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
