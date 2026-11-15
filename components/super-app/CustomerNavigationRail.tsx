'use client';

import Image from 'next/image';
import { RailTab } from '@/types/super-app.types';

interface CustomerNavigationRailProps {
  isAuthenticated: boolean;
  onSelectTab: (tab: RailTab) => void;
  onOpenOrders?: () => void;
  onOpenSettings: () => void;
  runningCount?: number;
  accountTitle: string;
}

/*
 * Customer rail from the Figma design: chats, orders and account only.
 * Each icon already includes its own 36px circular background in the exported
 * SVG (green for the active chats tab, white for the rest), so no extra
 * background styling is applied here.
 */
export function CustomerNavigationRail({
  isAuthenticated,
  onSelectTab,
  onOpenOrders,
  onOpenSettings,
  runningCount = 0,
  accountTitle,
}: CustomerNavigationRailProps) {
  return (
    <aside className="z-20 hidden h-full w-[64px] shrink-0 select-none flex-col items-center justify-between overflow-clip bg-[#f7f5f3] px-[8px] pb-[27px] pt-[16px] md:flex">
      <div className="flex w-[36px] flex-col gap-[8px]">
        <button
          type="button"
          onClick={() => onSelectTab('CHATS')}
          title="Chats & Services"
          className="size-[36px] cursor-pointer"
        >
          <Image src="/rail/chats-active.svg" alt="Chats" width={36} height={36} />
        </button>

        <button
          type="button"
          onClick={onOpenOrders}
          disabled={!isAuthenticated}
          title={isAuthenticated ? 'My Orders & History' : 'Log in to view your orders'}
          // UI hint only; the orders API itself rejects unauthenticated requests.
          className="relative size-[36px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image src="/rail/orders.svg" alt="My orders" width={36} height={36} />
          {isAuthenticated && runningCount > 0 && (
            <span className="absolute right-0 top-0 size-[10px] rounded-full bg-[#1daa61] ring-2 ring-[#f7f5f3]" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        title={accountTitle}
        className="size-[36px] cursor-pointer"
      >
        <Image src="/rail/account.svg" alt="Account" width={36} height={36} />
      </button>
    </aside>
  );
}
