'use client';

import React from 'react';
import { CheckCheck, Clock, Zap, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { Order, OrderStatus } from '@/types/order.types';

interface ProviderOrderListItemProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
  isDarkMode: boolean;
}

export function ProviderOrderListItem({
  order,
  isSelected,
  onSelect,
  isDarkMode,
}: ProviderOrderListItemProps) {
  const serviceIcon = order.service?.category?.iconUrl || '🛠️';
  const serviceName = order.service?.name || 'On-Demand Service';
  const customerName = order.customer?.user?.name || 'Customer';
  const orderShortId = order.id.slice(0, 8).toUpperCase();
  const totalPrice = Number(order.totalPrice || 0);

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  // Revision status check
  const activeRevision = order.revisions?.find(
    (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
  );
  const hasActiveRevision = !!activeRevision;

  const isPending = order.orderStatus === OrderStatus.PENDING;
  const isAccepted = order.orderStatus === OrderStatus.ACCEPTED;
  const isInProgress = order.orderStatus === OrderStatus.IN_PROGRESS;
  const isCompleted = order.orderStatus === OrderStatus.COMPLETED;

  const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onSelect(order)}
      className={`flex items-center gap-3 px-3 py-1 cursor-pointer transition-colors relative group select-none ${
        hasActiveRevision
          ? 'border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/30'
          : ''
      } ${
        isSelected
          ? isDarkMode
            ? 'bg-[#2a3942]'
            : 'bg-[#f0f2f5]'
          : isDarkMode
          ? 'hover:bg-[#202c33]'
          : 'hover:bg-[#f5f6f6]'
      }`}
    >
      {/* Service Icon with Status Indicator */}
      <div className="relative shrink-0 my-1">
        <div className="w-12 h-12 rounded-full bg-[#e9edef] dark:bg-[#202c33] flex items-center justify-center text-xl shadow-2xs">
          {serviceIcon}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#111b21] ${
            hasActiveRevision
              ? 'bg-amber-500 animate-ping ring-2 ring-amber-400'
              : isInProgress
              ? 'bg-emerald-500 animate-ping'
              : isPending
              ? 'bg-amber-500 animate-pulse'
              : isAccepted
              ? 'bg-blue-500'
              : isCompleted
              ? 'bg-[#25D366]'
              : 'bg-zinc-400'
          }`}
        />
      </div>

      {/* Order Item Details */}
      <div className="flex-1 min-w-0 py-2 border-b border-[#e9edef] dark:border-[#222e35]">
        {/* Top Line: Service Name & Order Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-[15px] font-medium leading-tight truncate ${textPrimary}`}>
              {serviceName}
            </span>
            {hasActiveRevision && (
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-400 text-black shadow-xs flex items-center gap-0.5 shrink-0 animate-pulse">
                <RotateCcw className="w-2.5 h-2.5" />
                <span>TOP PRIORITY</span>
              </span>
            )}
          </div>
          <span className="text-[12px] font-bold text-[#008069] dark:text-[#25D366] shrink-0 ml-2">
            ৳{totalPrice}
          </span>
        </div>

        {/* Second Line: Customer Name, Status Badge, & Time */}
        <div className="flex items-center justify-between mt-1 text-[13px]">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            {hasActiveRevision ? (
              <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : isCompleted ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
            ) : isInProgress ? (
              <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : isPending ? (
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            )}
            <span className={`truncate text-xs ${hasActiveRevision ? 'text-amber-700 dark:text-amber-400 font-semibold' : textSecondary}`}>
              {hasActiveRevision ? '⚠️ Revision Request • ' : ''}👤 {customerName} • #{orderShortId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                hasActiveRevision
                  ? 'bg-amber-400 dark:bg-amber-500 text-black font-black shadow-xs'
                  : isInProgress
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                  : isPending
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                  : isCompleted
                  ? 'bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366]'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {hasActiveRevision ? 'REVISION' : order.orderStatus}
            </span>
            <span className={`text-[11px] ${textSecondary}`}>{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
