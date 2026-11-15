'use client';

import Image from 'next/image';
import { RailSelection, RailTab } from '@/types/super-app.types';

interface CustomerNavigationRailProps {
  isAuthenticated: boolean;
  /** The selected icon is drawn with the mint circle, the others with the white one. */
  selection: RailSelection;
  onSelectTab: (tab: RailTab) => void;
  onOpenOrders?: () => void;
  /** Guest: the join / log-in panel. Signed in: the Edit Profile panel. */
  onOpenAccount: () => void;
  runningCount?: number;
  accountTitle: string;
}

/*
 * Customer rail from the Figma design: chats, orders and account only.
 * Each icon already includes its own 36px circular background in the exported
 * SVG: mint for the selected one, white for the rest. So every icon has a
 * `-active` and an `-inactive` file and the selected state just picks one.
 */
export function CustomerNavigationRail({
  isAuthenticated,
  selection,
  onSelectTab,
  onOpenOrders,
  onOpenAccount,
  runningCount = 0,
  accountTitle,
}: CustomerNavigationRailProps) {
  const iconState = (isSelected: boolean) => (isSelected ? 'active' : 'inactive');

  return (
    <aside className="z-20 hidden h-full w-[64px] shrink-0 select-none flex-col items-center justify-between overflow-clip bg-[#f7f5f3] px-[8px] pb-[27px] pt-[16px] md:flex">
      <div className="flex w-[36px] flex-col gap-[8px]">
        <button
          type="button"
          onClick={() => onSelectTab('CHATS')}
          title="Chats & Services"
          aria-current={selection === 'CHATS' ? 'page' : undefined}
          className="size-[36px] cursor-pointer"
        >
          <Image src={`/rail/chats-${iconState(selection === 'CHATS')}.svg`} alt="Chats" width={36} height={36} />
        </button>

        <button
          type="button"
          onClick={onOpenOrders}
          disabled={!isAuthenticated}
          title={isAuthenticated ? 'My Orders & History' : 'Log in to view your orders'}
          // UI hint only; the orders API itself rejects unauthenticated requests.
          aria-current={selection === 'ORDERS' ? 'page' : undefined}
          className="relative size-[36px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image src={`/rail/orders-${iconState(selection === 'ORDERS')}.svg`} alt="My orders" width={36} height={36} />
          {isAuthenticated && runningCount > 0 && (
            <span className="absolute right-0 top-0 size-[10px] rounded-full bg-[#1daa61] ring-2 ring-[#f7f5f3]" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenAccount}
        title={accountTitle}
        aria-current={selection === 'ACCOUNT' ? 'page' : undefined}
        className="size-[36px] cursor-pointer"
      >
        <Image src={`/rail/account-${iconState(selection === 'ACCOUNT')}.svg`} alt="Account" width={36} height={36} />
      </button>
    </aside>
  );
}
