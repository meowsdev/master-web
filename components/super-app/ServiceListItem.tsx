'use client';

import React from 'react';
import { CheckCheck, ChevronDown } from 'lucide-react';
import { Service } from '@/types/service.types';

interface ServiceListItemProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
  isDarkMode: boolean;
}

export function ServiceListItem({
  service,
  isSelected,
  onSelect,
  isDarkMode,
}: ServiceListItemProps) {
  const categoryIcon = service.category?.iconUrl || '🛠️';
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <div
      onClick={() => onSelect(service)}
      className={`flex items-center gap-3 px-3 py-1 cursor-pointer transition-colors relative group select-none ${
        isSelected
          ? isDarkMode
            ? 'bg-[#2a3942]'
            : 'bg-[#f0f2f5]'
          : isDarkMode
          ? 'hover:bg-[#202c33]'
          : 'hover:bg-[#f5f6f6]'
      }`}
    >
      {/* Service Icon Avatar */}
      <div className="relative shrink-0 my-1">
        <div className="w-12 h-12 rounded-full bg-[#e9edef] dark:bg-[#202c33] flex items-center justify-center text-xl shadow-2xs">
          {categoryIcon}
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white dark:border-[#111b21]" />
      </div>

      {/* Service Content with WhatsApp indented border */}
      <div className="flex-1 min-w-0 py-2 border-b border-[#e9edef] dark:border-[#222e35]">
        {/* Top Row: Service Name and Price */}
        <div className="flex items-center justify-between">
          <span className={`text-[15.5px] font-normal leading-tight truncate ${textPrimary}`}>
            {service.name}
          </span>
          <span className={`text-[12px] font-normal shrink-0 ml-2 ${textSecondary}`}>
            ৳{service.basePrice}
          </span>
        </div>

        {/* Bottom Row: Blue Double Tick + Last Message / Description + Chevron */}
        <div className="flex items-center justify-between mt-1 text-[13px]">
          <div className={`flex items-center gap-1.5 min-w-0 truncate ${textSecondary}`}>
            <CheckCheck className="w-4 h-4 text-[#53bdeb] shrink-0" />
            <span className="truncate">
              {service.description || 'Assalamu Alaikum! Counselor ready.'}
            </span>
          </div>

          {/* WhatsApp Dropdown Chevron */}
          <ChevronDown
            className={`w-4 h-4 text-[#8696a0] shrink-0 ml-1.5 transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
