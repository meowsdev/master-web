'use client';

import Image from 'next/image';
import { FilterChip } from '@/types/super-app.types';

// Customers only get the chips that map to real, backend-backed lists.
const CUSTOMER_FILTER_CHIPS: FilterChip[] = ['All', 'Running', 'Unread', 'Save'];

interface CustomerSidebarTopProps {
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  activeFilterChip: FilterChip;
  onSelectFilterChip: (chip: FilterChip) => void;
  isSearchCollapsed: boolean;
}

/* Brand header, search pill and filter chips of the Figma customer sidebar. */
export function CustomerSidebarTop({
  isAuthenticated,
  onOpenAuth,
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  activeFilterChip,
  onSelectFilterChip,
  isSearchCollapsed,
}: CustomerSidebarTopProps) {
  return (
    <div className="flex shrink-0 flex-col p-[8px] pb-0">
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
      </div>

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
          placeholder="Search services..."
          className="w-full bg-transparent text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#697586]"
        />
      </label>

      <div className="no-scrollbar flex items-center gap-[8px] overflow-x-auto px-[16px] py-[12px]">
        {CUSTOMER_FILTER_CHIPS.map((chip) => {
          const isActive = activeFilterChip === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onSelectFilterChip(chip)}
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
        </div>
        </div>
      </div>
    </div>
  );
}
