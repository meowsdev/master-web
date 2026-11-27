'use client';

import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import { HeaderMenuItem } from './HeaderOptionsMenu';

interface ChatEmptyHeaderProps {
  /** Customers and providers only; without it the button is not shown (technicians, staff). */
  onSwitchAccount?: () => void;
  menuItems: HeaderMenuItem[];
}

/* Header while no service is open (Figma): an empty bar with Switch Account and ⋮ on the right. */
export function ChatEmptyHeader({ onSwitchAccount }: ChatEmptyHeaderProps) {
  return (
    <header className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-end gap-[12px] border-b border-line bg-white px-[16px]`}>
      {onSwitchAccount && (
        <button
          type="button"
          onClick={onSwitchAccount}
          className="h-[36px] cursor-pointer rounded-[10px] border border-ink bg-white px-[14px] text-[14px] font-semibold text-ink transition-colors hover:bg-surface"
        >
          Switch Account
        </button>
      )}
      {/* <HeaderOptionsMenu items={menuItems} /> */}
    </header>
  );
}
