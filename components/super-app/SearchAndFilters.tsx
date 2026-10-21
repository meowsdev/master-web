'use client';

import React from 'react';
import { Search, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { FilterChip } from '@/types/super-app.types';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  activeFilterChip: FilterChip;
  onSelectFilterChip: (chip: FilterChip) => void;
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
  isDarkMode,
}: SearchAndFiltersProps) {
  const chips: FilterChip[] = ['All', 'Unread', 'Favorites', 'Groups'];

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

      {/* WhatsApp Web Authentic Filter Chips Row */}
      <div className="px-3 pb-2 pt-0.5 bg-white dark:bg-[#111b21] flex items-center gap-1.5 overflow-x-auto border-b border-[#e9edef] dark:border-[#222e35] scrollbar-none">
        {chips.map((chip) => {
          const isActive = activeFilterChip === chip;
          return (
            <button
              key={chip}
              onClick={() => onSelectFilterChip(chip)}
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

        <button
          onClick={() => toast.info('Super app custom category filter')}
          className="w-6 h-6 rounded-full bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef] dark:bg-[#202c33] dark:text-[#8696a0] flex items-center justify-center shrink-0 cursor-pointer"
          title="Add filter"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
