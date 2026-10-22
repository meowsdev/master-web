'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterChip, CustomFilterList, StandardFilterChip } from '@/types/super-app.types';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  activeFilterChip: FilterChip;
  onSelectFilterChip: (chip: FilterChip) => void;
  customFilters?: CustomFilterList[];
  onOpenCreateFilter: () => void;
  onDeleteCustomFilter?: (id: string) => void;
  isDarkMode: boolean;
}

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  isSearchFocused,
  onSearchFocus,
  onSearchBlur,
  activeFilterChip,
  onSelectFilterChip,
  customFilters = [],
  onOpenCreateFilter,
  onDeleteCustomFilter,
  isDarkMode,
}: SearchAndFiltersProps) {
  // Standard WhatsApp Web chips: All, Unread, Favorites, Save (replaced Groups as requested)
  const standardChips: StandardFilterChip[] = ['All', 'Unread', 'Favorites', 'Save'];
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag to scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, customFilters]);

  // Convert vertical mouse wheel into smooth horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY * 1.2,
          behavior: 'smooth',
        });
        checkScroll();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [checkScroll]);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 3) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="shrink-0">
      {/* WhatsApp Web Style Search Bar */}
      <div className="px-3 pt-2 pb-1.5 bg-white dark:bg-[#111b21]">
        <div
          className={`flex items-center h-9 px-3 rounded-[8px] transition-all ${
            isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'
          } ${isSearchFocused ? 'ring-1 ring-[#008069] dark:ring-[#25D366]' : ''}`}
        >
          <Search className="w-4 h-4 mr-2.5 shrink-0 text-[#54656f] dark:text-[#8696a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            placeholder="Search or start a new chat"
            className="bg-transparent border-none outline-none text-[13.5px] w-full placeholder:text-[#8696a0]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 text-[#54656f] hover:text-[#111b21] dark:hover:text-white cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Web Authentic Filter Chips Row with Smooth Horizontal Scroll & No Scrollbar */}
      <div className="relative bg-white dark:bg-[#111b21] border-b border-[#e9edef] dark:border-[#222e35]">
        {/* Left Scroll Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scrollByAmount(-140)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 dark:bg-[#202c33]/95 shadow-md border border-[#e9edef] dark:border-[#2f3b43] text-[#54656f] dark:text-[#e9edef] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Chips Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="px-3 pb-2 pt-0.5 flex items-center gap-1.5 overflow-x-auto scroll-smooth scrollbar-none no-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          {/* Standard Filter Chips */}
          {standardChips.map((chip) => {
            const isActive = activeFilterChip === chip;
            return (
              <button
                key={chip}
                onClick={() => {
                  if (!hasDraggedRef.current) {
                    onSelectFilterChip(chip);
                  }
                }}
                className={`px-3 py-1 text-[13px] rounded-full transition-colors font-medium shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#d9fdd3] text-[#008069] dark:bg-[#005c4b] dark:text-[#25D366]'
                    : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef] dark:bg-[#202c33] dark:text-[#8696a0] dark:hover:bg-[#2a3942]'
                }`}
              >
                {chip}
              </button>
            );
          })}

          {/* User-created Custom Filter Lists */}
          {customFilters.map((custom) => {
            const isActive = activeFilterChip === custom.name || activeFilterChip === custom.id;
            return (
              <div
                key={custom.id}
                className={`flex items-center gap-1 pl-3 pr-2 py-1 text-[13px] rounded-full transition-colors font-medium shrink-0 group ${
                  isActive
                    ? 'bg-[#d9fdd3] text-[#008069] dark:bg-[#005c4b] dark:text-[#25D366]'
                    : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef] dark:bg-[#202c33] dark:text-[#8696a0] dark:hover:bg-[#2a3942]'
                }`}
              >
                <button
                  onClick={() => {
                    if (!hasDraggedRef.current) {
                      onSelectFilterChip(custom.name);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {custom.name}
                </button>
                {onDeleteCustomFilter && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomFilter(custom.id);
                    }}
                    className="opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity p-0.5 cursor-pointer"
                    title={`Delete "${custom.name}" list`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Create New List Button (+) */}
          <button
            onClick={() => {
              if (!hasDraggedRef.current) {
                onOpenCreateFilter();
              }
            }}
            className="w-6 h-6 rounded-full bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef] dark:bg-[#202c33] dark:text-[#8696a0] flex items-center justify-center shrink-0 cursor-pointer hover:text-[#008069] dark:hover:text-[#25D366] transition-colors"
            title="New list"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Scroll Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scrollByAmount(140)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 dark:bg-[#202c33]/95 shadow-md border border-[#e9edef] dark:border-[#2f3b43] text-[#54656f] dark:text-[#e9edef] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
