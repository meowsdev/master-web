'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll';
import { FilterChip } from '@/types/super-app.types';
import { User } from '@/types/auth.types';
import { CustomerProfileHeader } from './CustomerProfileHeader';


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
}: CustomerSidebarTopProps) {
  const filterChips: FilterChip[] = ['All', ...categoryNames];
  const { ref: chipRowRef, canScrollLeft, canScrollRight, scrollByAmount, wasDragged } =
    useHorizontalScroll<HTMLDivElement>();

  const arrowClass =
    'absolute top-1/2 z-10 flex size-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#202939] shadow-md transition-transform hover:scale-110';
  return (
    <div className={`flex shrink-0 flex-col px-[8px] pb-0 ${showBrandRow ? 'pt-[8px]' : 'pt-0'}`}>
      {showBrandRow && isAuthenticated && user && onStartNewOrder && (
        <CustomerProfileHeader user={user} onStartNewOrder={onStartNewOrder} />
      )}
      {showBrandRow && !(isAuthenticated && user && onStartNewOrder) && (
        <div className="flex h-[50px] items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <Image src="/chat-list/brand-logo.svg" alt="" width={36} height={36} />
            <span className="text-[18px] font-semibold tracking-[-0.36px] text-[#202939]">SupeerApp</span>
          </div>
          {!isAuthenticated && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="cursor-pointer rounded-[10px] bg-[#1daa61] px-[14px] py-[5px] text-[15px] font-semibold tracking-[-0.3px] text-white"
            >
              Join Now
            </button>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-[8px] md:hidden">
              <button type="button" onClick={onOpenOrders} title="My Orders & History" className="size-[36px] cursor-pointer">
                <Image src="/rail/orders-inactive.svg" alt="My orders" width={36} height={36} />
              </button>
              <button type="button" onClick={onOpenAccount} title="Edit profile" className="size-[36px] cursor-pointer">
                <Image src="/rail/account-inactive.svg" alt="Profile" width={36} height={36} />
              </button>
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
      <label className="flex h-[40px] items-center gap-[12px] rounded-[20px] bg-[#f7f5f3] pl-[24px] pr-[16px]">
        <Image src="/chat-list/search.svg" alt="" width={24} height={24} className="shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          id="service-search-input"
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#697586]"
        />
      </label>

      {/* Many categories overflow the row: wheel, drag and the arrows all scroll it sideways. */}
      <div className="relative">
        {canScrollLeft && (
          <button type="button" aria-label="Scroll categories left" onClick={() => scrollByAmount(-160)} className={`${arrowClass} left-0`}>
            <ChevronLeft className="size-[16px]" />
          </button>
        )}
        <div
          ref={chipRowRef}
          className="no-scrollbar flex cursor-grab select-none items-center gap-[8px] overflow-x-auto px-[16px] py-[12px] active:cursor-grabbing"
        >
          {filterChips.map((chip) => {
            const isActive = activeFilterChip === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  if (!wasDragged()) onSelectFilterChip(chip);
                }}
                className={`h-[36px] shrink-0 cursor-pointer rounded-[20px] border px-[12px] text-[16px] font-semibold ${
                  isActive
                    ? 'border-[#bccdba] bg-[#d7fdd2] text-[#205737]'
                    : 'border-[#cecece] text-[#697586]'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
        {canScrollRight && (
          <button type="button" aria-label="Scroll categories right" onClick={() => scrollByAmount(160)} className={`${arrowClass} right-0`}>
            <ChevronRight className="size-[16px]" />
          </button>
        )}
      </div>
        </div>
        </div>
      </div>
    </div>
  );
}
