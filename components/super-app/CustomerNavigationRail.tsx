'use client';

import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { RailSelection, RailTab } from '@/types/super-app.types';

interface CustomerNavigationRailProps {
  isAuthenticated: boolean;
  /** The selected icon is drawn with the mint circle, the others with the white one. */
  selection: RailSelection;
  onSelectTab: (tab: RailTab) => void;
  /** Signed-in only: the + above the profile picture starts a new order. */
  onStartNewOrder?: () => void;
  profilePhoto?: string | null;
  /** Guest: the join / log-in panel. Signed in: the Edit Profile panel. */
  onOpenAccount: () => void;
  runningCount?: number;
  accountTitle: string;
  /** Providers only have the Messages tab; customers also get Orders. */
  showOrdersTab?: boolean;

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
  onStartNewOrder,
  profilePhoto,
  onOpenAccount,
  runningCount = 0,
  accountTitle,
  showOrdersTab = true,
}: CustomerNavigationRailProps) {
  const iconState = (isSelected: boolean) => (isSelected ? 'active' : 'inactive');
  // The Support chat is a row of the chat list, so Chats stays lit while it is open.
  const isChatsSelected = selection === 'CHATS' || selection === 'SUPPORT';

  return (
    <aside className="z-20 hidden h-full w-[64px] shrink-0 select-none flex-col items-center justify-between overflow-clip bg-[#f7f5f3] px-[8px] pb-[27px] md:flex">
      <div className="flex w-[36px] flex-col gap-[8px]">
        {/* The app logo heads the rail in every role. */}
        {/* Centred in a bar as tall as the headers beside it, so the logo sits on the same line as their titles. */}
        <div className={`mb-[5px] flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-center`}>
          <Image src="/chat-list/brand-logo.svg" alt="Super App" width={36} height={36} priority />
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('CHATS')}
          title="Chats & Services"
          aria-current={isChatsSelected ? 'page' : undefined}
          className="size-[36px] cursor-pointer"
        >
          <Image src={`/rail/chats-${iconState(isChatsSelected)}.svg`} alt="Chats" width={36} height={36} />
        </button>

        {showOrdersTab && (
        <button
          type="button"
          onClick={() => onSelectTab('ORDERS')}
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
        )}

      </div>

      <div className="flex flex-col items-center gap-[12px]">
        {isAuthenticated && onStartNewOrder && (
          <button
            type="button"
            onClick={onStartNewOrder}
            title="Start a new order"
            aria-label="Start a new order"
            className="flex size-[36px] cursor-pointer items-center justify-center rounded-full border-2 border-[#1daa61] text-[#1daa61] transition-colors hover:bg-[#d7fdd2]"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2.5} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenAccount}
          title={accountTitle}
          aria-current={selection === 'ACCOUNT' ? 'page' : undefined}
          className={`size-[36px] cursor-pointer overflow-hidden rounded-full ${
            selection === 'ACCOUNT' && profilePhoto ? 'ring-2 ring-[#1daa61]' : ''
          }`}
        >
          {isAuthenticated && profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
            <img src={profilePhoto} alt="Account" className="size-full object-cover" />
          ) : (
            <Image src={`/rail/account-${iconState(selection === 'ACCOUNT')}.svg`} alt="Account" width={36} height={36} />
          )}
        </button>
      </div>
    </aside>
  );
}
