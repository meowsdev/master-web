'use client';

import React from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2, Clock, Phone, UserCheck, ShieldAlert } from 'lucide-react';
import { CounselorChatItem } from '@/types/counselor.types';

interface CounselorListItemProps {
  item: CounselorChatItem;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode: boolean;
}

export function CounselorListItem({
  item,
  isSelected,
  onSelect,
  isDarkMode,
}: CounselorListItemProps) {
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgHover = isDarkMode ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]';
  const bgSelected = isDarkMode ? 'bg-[#2a3942]' : 'bg-[#f0f2f5]';

  return (
    <div
      onClick={onSelect}
      className={`px-3 py-2.5 flex items-start gap-3 cursor-pointer border-b transition-colors select-none ${
        isDarkMode ? 'border-[#222e35]' : 'border-[#f0f2f5]'
      } ${isSelected ? bgSelected : bgHover}`}
    >
      {/* Service Icon or Customer Avatar */}
      <div className="relative shrink-0 mt-0.5">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-[#008069] dark:text-[#25D366] flex items-center justify-center text-xl font-bold border border-emerald-500/20 shadow-xs">
          {item.serviceIcon || '🎧'}
        </div>
        {item.hasActiveRevision && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-xs animate-bounce">
            ⚠️
          </span>
        )}
        {item.tabCategory === 'HOLD' && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] shadow-xs">
            🛑
          </span>
        )}
      </div>

      {/* Chat Summary Content */}
      <div className="flex-1 min-w-0">
        {/* Top Line: Customer Name & Status Badge */}
        <div className="flex items-center justify-between gap-1">
          <h4 className={`text-[14px] font-bold truncate ${textPrimary}`}>
            {item.customerName}
          </h4>
          <span className={`text-[11px] shrink-0 font-medium ${textSecondary}`}>
            {item.orderId ? `#${item.orderId}` : ''}
          </span>
        </div>

        {/* Second Line: Service & Phone */}
        <div className="flex items-center gap-1.5 mt-0.5 text-xs">
          <span className="font-semibold text-[#008069] dark:text-[#25D366] truncate">
            {item.serviceName}
          </span>
          <span className={`text-[11px] ${textSecondary}`}>•</span>
          <span className={`text-[11px] truncate flex items-center gap-1 ${textSecondary}`}>
            <Phone className="w-2.5 h-2.5" />
            {item.customerPhone}
          </span>
        </div>

        {/* Third Line: Flags & Pricing details */}
        <div className="flex items-center justify-between mt-1.5 gap-2">
          {/* Status Flag */}
          {item.hasActiveRevision ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-black border border-amber-300 flex items-center gap-1 shrink-0">
              <RotateCcw className="w-2.5 h-2.5 animate-spin" />
              <span>Warranty Revision</span>
            </span>
          ) : item.tabCategory === 'HOLD' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1 shrink-0">
              <ShieldAlert className="w-2.5 h-2.5" />
              <span>Dispute / Hold</span>
            </span>
          ) : item.orderStatus === 'COMPLETED' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Completed</span>
            </span>
          ) : item.assignedProvider ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate max-w-[140px]">
              <UserCheck className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{item.assignedProvider.name}</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center gap-1 shrink-0">
              <Clock className="w-2.5 h-2.5" />
              <span>Unassigned Lead</span>
            </span>
          )}

          {/* Pricing / Due Amount */}
          {item.totalPrice > 0 && (
            <div className="text-[11px] font-mono text-right shrink-0">
              <span className="font-bold text-[#008069] dark:text-[#25D366]">৳{item.totalPrice}</span>
              {item.dueAmount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold ml-1">
                  (Due: ৳{item.dueAmount})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
