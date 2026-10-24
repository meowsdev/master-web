'use client';

import React from 'react';
import { CheckCheck, ChevronDown } from 'lucide-react';
import { Service } from '@/types/service.types';
import { ChatMessage } from '@/types/super-app.types';

interface ServiceListItemProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
  isRunning?: boolean;
  runningOrderId?: string | null;
  lastMessage?: ChatMessage | null;
  isDarkMode: boolean;
}

export function ServiceListItem({
  service,
  isSelected,
  onSelect,
  isRunning = false,
  runningOrderId,
  lastMessage,
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
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#111b21] ${
            isRunning ? 'bg-amber-500 animate-pulse' : 'bg-[#25D366]'
          }`}
        />
      </div>

      {/* Service Content with WhatsApp indented border */}
      <div className="flex-1 min-w-0 py-2 border-b border-[#e9edef] dark:border-[#222e35]">
        {/* Top Row: Service Name, Running Badge, and Timestamp or Price */}
        <div className="flex items-center justify-between">
          <span className={`text-[15.5px] font-normal leading-tight truncate ${textPrimary}`}>
            {service.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isRunning && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                <span>Running</span>
              </span>
            )}
            <span
              className={`text-[12px] font-normal ${
                lastMessage ? 'text-[#00a884] dark:text-[#25D366] font-medium' : textSecondary
              }`}
            >
              {lastMessage ? lastMessage.time : `৳${service.basePrice}`}
            </span>
          </div>
        </div>

        {/* Bottom Row: Blue Double Tick or Running Status + Chevron */}
        <div className="flex items-center justify-between mt-1 text-[13px]">
          {isRunning ? (
            <div className="flex items-center gap-1.5 min-w-0 truncate text-amber-600 dark:text-amber-400 font-medium text-[12.5px]">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
              <span className="truncate">
                {runningOrderId ? `Order #${runningOrderId} in progress` : 'Order in progress • Tech dispatched'}
              </span>
            </div>
          ) : lastMessage ? (
            <div className={`flex items-center gap-1.5 min-w-0 truncate ${textSecondary}`}>
              {lastMessage.sender === 'me' && (
                <CheckCheck className="w-4 h-4 text-[#53bdeb] shrink-0" />
              )}
              <span className="truncate">{lastMessage.text}</span>
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 min-w-0 truncate ${textSecondary}`}>
              <CheckCheck className="w-4 h-4 text-[#53bdeb] shrink-0" />
              <span className="truncate">
                {service.description || 'Assalamu Alaikum! Counselor ready.'}
              </span>
            </div>
          )}

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
