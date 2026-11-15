'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCheck, RotateCcw } from 'lucide-react';
import { Service } from '@/types/service.types';
import { ChatMessage } from '@/types/super-app.types';

interface ServiceListItemProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
  isRunning?: boolean;
  runningOrderId?: string | null;
  hasActiveRevision?: boolean;
  revisionIssue?: string;
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
  isOnline?: boolean;
  isDarkMode: boolean;
}

// Category icons are either an uploaded image URL or a plain emoji fallback.
const isImageUrl = (value: string) => /^(https?:)?\/\/|^\//.test(value);

/*
 * Customer chat-list row, built from the Figma design (92px tall, 56px avatar).
 * Subtitle rule: before any message exists it names the providers offering the
 * service; once a conversation starts, the latest message takes its place.
 */
export function ServiceListItem({
  service,
  isSelected,
  onSelect,
  isRunning = false,
  runningOrderId,
  hasActiveRevision = false,
  revisionIssue,
  lastMessage,
  unreadCount = 0,
  isOnline = false,
}: ServiceListItemProps) {
  const categoryIcon = service.category?.iconUrl || '🛠️';
  const providerNames = service.providerSummary?.providerNames ?? [];
  const averageRating = service.providerSummary?.averageRating ?? null;
  const completedCount = service.orderCount ?? 0;
  const showOnlineDot = hasActiveRevision || isRunning || isOnline;

  return (
    <div
      onClick={() => onSelect(service)}
      className={`flex h-[92px] cursor-pointer select-none items-center gap-[14px] rounded-[16px] px-[20px] transition-colors ${
        isSelected ? 'bg-[#f7f5f3]' : 'hover:bg-[#faf9f8]'
      }`}
    >
      <div className="relative size-[56px] shrink-0">
        <div className="flex size-[56px] items-center justify-center overflow-hidden rounded-full bg-[#efefef] text-2xl">
          {isImageUrl(categoryIcon) ? (
            <Image src={categoryIcon} alt="" width={56} height={56} unoptimized className="size-full object-cover" />
          ) : (
            categoryIcon
          )}
        </div>
        {showOnlineDot && (
          <span
            className={`absolute bottom-0 right-0 size-[12px] rounded-full border-2 border-white ${
              hasActiveRevision || isRunning ? 'bg-amber-500' : 'bg-[#1daa61]'
            }`}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <div className="flex items-center justify-between gap-[12px]">
          <div className="flex min-w-0 items-center gap-[12px]">
            <span className="truncate text-[16px] font-semibold tracking-[-0.36px] text-[#202939]">
              {service.name}
            </span>
            {service.isPopular && (
              <span className="shrink-0 rounded-[4px] bg-black px-[6px] py-[2px] text-[10px] font-bold uppercase leading-[15px] text-white">
                Popular
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-[4px]">
            <Image src="/chat-list/star.svg" alt="" width={13.333} height={12.667} />
            <span className="text-[14px] font-bold leading-[16px] text-[#1a1c1c]">
              {averageRating !== null ? averageRating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-[8px]">
          <PreviewLine
            hasActiveRevision={hasActiveRevision}
            revisionIssue={revisionIssue}
            isRunning={isRunning}
            runningOrderId={runningOrderId}
            lastMessage={lastMessage}
            providerNames={providerNames}
          />

          {unreadCount > 0 ? (
            <span className="flex h-[19px] min-w-[19px] shrink-0 items-center justify-center rounded-full bg-[#1daa61] px-[6px] text-[11px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : (
            completedCount > 0 && (
              <div className="flex shrink-0 items-center gap-[4px]">
                <Image src="/chat-list/completed-check.svg" alt="" width={20} height={20} />
                <span className="text-[12px] font-medium leading-[16px] tracking-[0.5px] text-[#707a6c]">
                  {completedCount}+ Completed
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

interface PreviewLineProps {
  hasActiveRevision: boolean;
  revisionIssue?: string;
  isRunning: boolean;
  runningOrderId?: string | null;
  lastMessage?: ChatMessage | null;
  providerNames: string[];
}

function PreviewLine({
  hasActiveRevision,
  revisionIssue,
  isRunning,
  runningOrderId,
  lastMessage,
  providerNames,
}: PreviewLineProps) {
  const baseClass = 'flex min-w-0 items-center gap-[4px] text-[14px] font-medium';

  if (hasActiveRevision) {
    const label = revisionIssue
      ? `Revision: "${revisionIssue}"`
      : runningOrderId
      ? `Order #${runningOrderId} • Revision Running`
      : '3-Day Warranty Revision in progress';
    return (
      <div className={`${baseClass} text-amber-700`}>
        <RotateCcw className="size-[14px] shrink-0 text-amber-500" />
        <span className="truncate">{label}</span>
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className={`${baseClass} text-amber-600`}>
        <span className="size-[8px] shrink-0 rounded-full bg-amber-500" />
        <span className="truncate">
          {runningOrderId ? `Order #${runningOrderId} in progress` : 'Order in progress • Tech dispatched'}
        </span>
      </div>
    );
  }

  if (lastMessage) {
    return (
      <div className={`${baseClass} text-[#697586]`}>
        {lastMessage.sender === 'me' && <CheckCheck className="size-[16px] shrink-0 text-[#53bdeb]" />}
        <span className="truncate">{lastMessage.text}</span>
      </div>
    );
  }

  return (
    <div className={`${baseClass} text-[#697586]`}>
      <Image src="/chat-list/provider.svg" alt="" width={20} height={20} className="shrink-0" />
      <span className="truncate">
        {providerNames.length > 0 ? providerNames.join(', ') : 'Providers coming soon'}
      </span>
    </div>
  );
}
