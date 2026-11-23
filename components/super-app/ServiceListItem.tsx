'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { HandHelpingIcon, StarIcon, Tick02Icon } from '@hugeicons/core-free-icons';
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
  /** How many of this main service's orders are running (each is a tab in its chat). */
  runningCount?: number;
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
  runningCount = 0,
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
  const startsFrom = Number(service.basePrice);
  const fallbackText = service.isMainService
    ? startsFrom > 0
      ? `Starts from ৳${startsFrom.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      : service.description
    : null;
  const showOnlineDot = hasActiveRevision || isRunning || isOnline;

  return (
    <div
      onClick={() => onSelect(service)}
      className={`flex h-[92px] cursor-pointer select-none items-center gap-[14px] rounded-[16px] px-[20px] transition-colors ${
        isSelected ? 'bg-surface' : 'hover:bg-surface'
      }`}
    >
      <div className="relative size-[56px] shrink-0">
        <div className="flex size-[56px] items-center justify-center overflow-hidden rounded-full bg-surface text-2xl">
          {isImageUrl(categoryIcon) ? (
            <Image src={categoryIcon} alt="" width={56} height={56} unoptimized className="size-full object-cover" />
          ) : (
            categoryIcon
          )}
        </div>
        {showOnlineDot && (
          <span
            className={`absolute bottom-0 right-0 size-[12px] rounded-full border-2 border-white ${
              hasActiveRevision || isRunning ? 'bg-amber-500' : 'bg-primary'
            }`}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <div className="flex items-center justify-between gap-[12px]">
          <div className="flex min-w-0 items-center gap-[12px]">
            <span className="truncate text-[16px] font-semibold tracking-[-0.36px] text-ink">
              {service.name}
            </span>
            {service.isPopular && (
              <span className="shrink-0 rounded-[4px] bg-black px-[6px] py-[2px] text-[10px] font-bold uppercase leading-[15px] text-white">
                Popular
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-[4px]">
            <HugeiconsIcon icon={StarIcon} size={14} className="shrink-0 fill-[#f5a524] text-[#f5a524]" />
            <span className="text-[14px] font-bold leading-[16px] text-ink">
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
            fallbackText={fallbackText}
            runningCount={runningCount}
          />

          {unreadCount > 0 ? (
            <span className="flex h-[19px] min-w-[19px] shrink-0 items-center justify-center rounded-full bg-primary px-[6px] text-[11px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : (
            completedCount > 0 && (
              <div className="flex shrink-0 items-center gap-[4px]">
                {/* The exported check glyph is white; Figma seats it in a black badge */}
                <span className="flex size-[20px] items-center justify-center rounded-full border-2 border-white bg-black p-[2px]">
                  <HugeiconsIcon icon={Tick02Icon} size={11} strokeWidth={3} className="text-white" />
                </span>
                <span className="text-[12px] font-medium leading-[16px] tracking-[0.5px] text-muted">
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
  /** Shown when nothing else is: a main service's "Starts from" price or its short description. */
  fallbackText?: string | null;
  runningCount?: number;
}

function PreviewLine({
  hasActiveRevision,
  revisionIssue,
  isRunning,
  runningOrderId,
  lastMessage,
  providerNames,
  fallbackText,
  runningCount = 0,
}: PreviewLineProps) {
  const baseClass = 'flex min-w-0 items-center gap-[4px] text-[14px] font-medium';

  if (hasActiveRevision) {
    const label = revisionIssue
      ? `Revision: "${revisionIssue}"`
      : runningOrderId
      ? `Order #${runningOrderId} • Revision Running`
      : '7-Day Warranty Revision in progress';
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
          {runningCount > 1
            ? `${runningCount} orders running`
            : runningOrderId
            ? `Order #${runningOrderId} in progress`
            : 'Order in progress • Tech dispatched'}
        </span>
      </div>
    );
  }

  if (lastMessage) {
    return (
      <div className={`${baseClass} text-muted`}>
        {lastMessage.sender === 'me' && <CheckCheck className="size-[16px] shrink-0 text-[#53bdeb]" />}
        <span className="truncate">{lastMessage.text}</span>
      </div>
    );
  }

  return (
    <div className={`${baseClass} text-muted`}>
      <HugeiconsIcon icon={HandHelpingIcon} size={18} strokeWidth={1.7} className="shrink-0 text-muted" />
      <span className="truncate">
        {providerNames.length > 0 ? providerNames.join(', ') : fallbackText || 'Providers coming soon'}
      </span>
    </div>
  );
}
