'use client';

import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import Image from 'next/image';
import { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { BubbleChatIcon, PlusSignIcon, ShoppingBag02Icon, UserIcon } from '@hugeicons/core-free-icons';
import { RailSelection, RailTab } from '@/types/super-app.types';
import { RailIconButton, railIconClass } from './RailIconButton';

interface CustomerNavigationRailProps {
  isAuthenticated: boolean;
  /** The selected icon sits in the secondary-green circle with a white border. */
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
  /** Providers: the team button, drawn right above the profile picture. */
  teamSlot?: ReactNode;
}

/*
 * Customer rail from the Figma design: chats, orders and account only. The icons are Hugeicons (RailIconButton):
 * the selected one sits in a secondary-green circle with a white border, the others have no circle.
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
  teamSlot,
}: CustomerNavigationRailProps) {
  // The Support chat is a row of the chat list, so Chats stays lit while it is open.
  const isChatsSelected = selection === 'CHATS' || selection === 'SUPPORT';

  return (
    <aside className="z-20 hidden h-full w-[64px] shrink-0 select-none flex-col items-center justify-between overflow-clip bg-surface px-[8px] pb-[27px] md:flex">
      <div className="flex w-[40px] flex-col items-center gap-[10px]">
        {/* The app logo heads the rail in every role. */}
        {/* Centred in a bar as tall as the headers beside it, so the logo sits on the same line as their titles. */}
        <div className={`mb-[5px] flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center justify-center`}>
          <Image src="/chat-list/brand-logo.svg" alt="Super App" width={36} height={36} priority />
        </div>

        <RailIconButton icon={BubbleChatIcon} label="Chats & Services" isActive={isChatsSelected} onClick={() => onSelectTab('CHATS')} />

        {showOrdersTab && (
        // Disabled for guests is a UI hint only; the orders API itself rejects unauthenticated requests.
        <RailIconButton
          icon={ShoppingBag02Icon}
          label={isAuthenticated ? 'My Orders & History' : 'Log in to view your orders'}
          isActive={selection === 'ORDERS'}
          onClick={() => onSelectTab('ORDERS')}
          disabled={!isAuthenticated}
          badge={isAuthenticated && runningCount > 0 ? <span className="absolute right-0 top-0 size-[10px] rounded-full bg-primary ring-2 ring-white" /> : undefined}
        />
        )}

      </div>

      <div className="flex flex-col items-center gap-[12px]">
        {/* Provider only: "আমার টিম", right above the profile picture. */}
        {isAuthenticated && teamSlot}
        {isAuthenticated && onStartNewOrder && (
          <button
            type="button"
            onClick={onStartNewOrder}
            title="Start a new order"
            aria-label="Start a new order"
            className="btn-raised flex size-[40px] cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2.5} />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenAccount}
          title={accountTitle}
          aria-current={selection === 'ACCOUNT' ? 'page' : undefined}
          className={isAuthenticated && profilePhoto ? `size-[40px] cursor-pointer overflow-hidden rounded-full border-2 ${selection === 'ACCOUNT' ? 'border-white ring-2 ring-secondary' : 'border-transparent'}` : railIconClass(selection === 'ACCOUNT')}
        >
          {isAuthenticated && profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
            <img src={profilePhoto} alt="Account" className="size-full object-cover" />
          ) : (
            <HugeiconsIcon icon={UserIcon} size={22} strokeWidth={selection === 'ACCOUNT' ? 2 : 1.7} />
          )}
        </button>
      </div>
    </aside>
  );
}
