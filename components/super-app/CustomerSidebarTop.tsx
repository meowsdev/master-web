'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon, ShoppingBag02Icon, UserIcon } from '@hugeicons/core-free-icons';
import Image from 'next/image';
import { ReactNode } from 'react';
import { FilterChip } from '@/types/super-app.types';
import { User } from '@/types/auth.types';
import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import { CustomerProfileHeader } from './CustomerProfileHeader';
import { ChipRow } from './ChipRow';
import { railIconClass } from './RailIconButton';


interface CustomerSidebarTopProps {
  isAuthenticated: boolean;
  /** Signed-in customer shown in the header instead of the brand row. */
  user?: User | null;
  onStartNewOrder?: () => void;
  onOpenAuth: () => void;
  /** Phones have no navigation rail, so signed-in customers reach these from the header. */
  onOpenOrders?: () => void;
  onOpenAccount?: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  activeFilterChip: FilterChip;
  onSelectFilterChip: (chip: FilterChip) => void;
  /** Service categories from the backend, shown as chips after "All" like the Figma design. */
  categoryNames: string[];
  /** False when the options-menu header (staff roles) already renders the brand row. */
  showBrandRow?: boolean;
  isSearchCollapsed: boolean;
  /** The Orders list reuses this top section with its own placeholder. */
  searchPlaceholder?: string;
  /** Replaces the customer profile header (the provider view shows its own, with the due and Pay Now). */
  profileSlot?: ReactNode;
  /** After the chips, e.g. the staff "Add" chip that creates a category. */
  chipsTrailing?: ReactNode;
}

/* Brand header, search pill and filter chips of the Figma customer sidebar. */
export function CustomerSidebarTop({
  isAuthenticated,
  user,
  onStartNewOrder,
  onOpenAuth,
  onOpenOrders,
  onOpenAccount,
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  activeFilterChip,
  onSelectFilterChip,
  categoryNames,
  showBrandRow = true,
  isSearchCollapsed,
  searchPlaceholder = 'Search services...',
  profileSlot,
  chipsTrailing,
}: CustomerSidebarTopProps) {
  const filterChips: FilterChip[] = ['All', ...categoryNames];

  return (
    <div className="flex shrink-0 flex-col px-[8px] pb-0">
      {/* Same height and divider line as the chat header and the right-hand panel header, so the three line up. */}
      {showBrandRow && (
        <div className={`-mx-[8px] flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 flex-col justify-center border-b border-line px-[16px]`}>
      {profileSlot}
      {showBrandRow && !profileSlot && isAuthenticated && user && onStartNewOrder && (
        <CustomerProfileHeader user={user} onStartNewOrder={onStartNewOrder} />
      )}
      {showBrandRow && !profileSlot && !(isAuthenticated && user && onStartNewOrder) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <Image src="/chat-list/brand-logo.svg" alt="" width={36} height={36} />
            <span className="text-[18px] font-semibold tracking-[-0.36px] text-ink">SupeerApp</span>
          </div>
          {!isAuthenticated && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn-raised cursor-pointer rounded-[10px] bg-primary px-[14px] py-[5px] text-[15px] font-semibold tracking-[-0.3px] text-white transition-transform hover:scale-105"
            >
              Join Now
            </button>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-[8px] md:hidden">
              <button type="button" onClick={onOpenOrders} title="My Orders & History" className="size-[36px] cursor-pointer">
                <span className={railIconClass(false)}><HugeiconsIcon icon={ShoppingBag02Icon} size={22} strokeWidth={1.7} /></span>
              </button>
              <button type="button" onClick={onOpenAccount} title="Edit profile" className="size-[36px] cursor-pointer">
                <span className={railIconClass(false)}><HugeiconsIcon icon={UserIcon} size={22} strokeWidth={1.7} /></span>
              </button>
            </div>
          )}
        </div>
      )}
        </div>
      )}

      {/* Animating grid rows from 1fr to 0fr collapses to the content's natural height without measuring it */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          isSearchCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        }`}
        aria-hidden={isSearchCollapsed}
      >
        <div className="min-h-0 overflow-hidden">
        {/* Spacing lives inside the clipped box so it collapses together with the content */}
        <div className="flex flex-col gap-[10px] pt-[10px]">
      <label className="flex h-[40px] items-center gap-[12px] rounded-[20px] bg-surface pl-[24px] pr-[16px]">
        <HugeiconsIcon icon={Search01Icon} size={22} strokeWidth={1.8} className="shrink-0 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          id="service-search-input"
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-[14px] font-medium text-ink outline-none placeholder:text-muted"
        />
      </label>

      {/* Many categories overflow the row: wheel, drag and the arrows all scroll it sideways. */}
      <ChipRow
        label="categories"
        chips={filterChips.map((chip) => ({ id: chip, label: chip }))}
        activeId={activeFilterChip}
        onSelect={onSelectFilterChip}
        trailing={chipsTrailing}
      />
        </div>
        </div>
      </div>
    </div>
  );
}
