'use client';

import { HeaderMenuItem, HeaderOptionsMenu } from './HeaderOptionsMenu';

interface ChatEmptyHeaderProps {
  onSwitchAccount: () => void;
  menuItems: HeaderMenuItem[];
}

/* Header while no service is open (Figma): an empty bar with Switch Account and ⋮ on the right. */
export function ChatEmptyHeader({ onSwitchAccount, menuItems }: ChatEmptyHeaderProps) {
  return (
    <header className="flex h-[56px] shrink-0 items-center justify-end gap-[12px] border-b border-[#e5e5e5] bg-white px-[16px]">
      <button
        type="button"
        onClick={onSwitchAccount}
        className="h-[36px] cursor-pointer rounded-[10px] border border-[#202939] bg-white px-[14px] text-[14px] font-semibold text-[#202939] transition-colors hover:bg-[#f7f5f3]"
      >
        Switch Account
      </button>
      {/* <HeaderOptionsMenu items={menuItems} /> */}
    </header>
  );
}
