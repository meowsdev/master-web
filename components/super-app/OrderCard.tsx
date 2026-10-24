'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { ChatMessage } from '@/types/super-app.types';

interface OrderCardProps {
  msg: ChatMessage;
  onCompleteOrder: (messageId: string, orderId: string) => void;
  isDarkMode: boolean;
}

export function OrderCard({ msg, onCompleteOrder, isDarkMode }: OrderCardProps) {
  const order = msg.orderCard;
  if (!order) return null;

  const isCompleted = order.status === 'COMPLETED';
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgCard = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgSubCard = isDarkMode ? 'bg-[#111b21] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';

  return (
    <div className="flex justify-start my-2">
      <div
        className={`rounded-2xl p-4 shadow-md max-w-sm sm:max-w-md w-full space-y-3.5 border select-text ${bgCard}`}
      >
        {/* Top Header: Order ID & Live Status Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#008069] dark:text-[#25D366]">
              #{order.orderId}
            </span>
          </div>

          {/* Live Status Badge */}
          {isCompleted ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d9fdd3] dark:bg-[#005c4b]/80 text-[#008069] dark:text-[#25D366] border border-[#25D366]/40 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 flex items-center gap-1.5 shadow-2xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>In Progress</span>
            </span>
          )}
        </div>

        {/* Service Title & Base Price */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366] flex items-center justify-center text-xl shrink-0 shadow-2xs">
            {order.serviceIcon || '🛠️'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-[15px] font-bold leading-tight ${textPrimary}`}>
              {order.serviceName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[13.5px] font-black text-[#008069] dark:text-[#25D366]">
                ৳{order.basePrice} Fixed Base
              </span>
              <span className={`text-[11px] ${textSecondary}`}>• Verified Tech</span>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className={`p-3 rounded-xl border space-y-1.5 text-xs ${bgSubCard}`}>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span className={`truncate font-medium ${textPrimary}`}>{order.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span className={`truncate font-medium ${textPrimary}`}>{order.scheduleTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
            <span className={`font-medium ${textPrimary}`}>Payment: {order.paymentMode}</span>
          </div>
        </div>

        {/* 3-Step Live Progress Stepper */}
        <div className="flex items-center justify-between px-1 py-1 text-[11px] font-semibold">
          <div className="flex items-center gap-1 text-[#008069] dark:text-[#25D366]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Booked</span>
          </div>
          <div
            className={`h-0.5 flex-1 mx-2 transition-colors ${
              isCompleted ? 'bg-[#25D366]' : 'bg-amber-400 dark:bg-amber-500'
            }`}
          />
          <div
            className={`flex items-center gap-1 ${
              isCompleted
                ? 'text-[#008069] dark:text-[#25D366]'
                : 'text-amber-600 dark:text-amber-400 font-bold'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>Dispatched</span>
          </div>
          <div
            className={`h-0.5 flex-1 mx-2 transition-colors ${
              isCompleted ? 'bg-[#25D366]' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          />
          <div
            className={`flex items-center gap-1 ${
              isCompleted ? 'text-[#008069] dark:text-[#25D366] font-bold' : textSecondary
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        </div>

        {/* Interactive Action Area: Complete Order Button or Completed Confirmation */}
        {isCompleted ? (
          <div className="p-3 rounded-xl bg-[#d9fdd3]/70 dark:bg-[#005c4b]/30 border border-[#25D366]/40 text-center space-y-1">
            <div className="text-[12.5px] font-bold text-[#008069] dark:text-[#25D366] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Service Successfully Completed!</span>
            </div>
            <p className={`text-[11px] ${textSecondary}`}>
              Completed at {order.completedAt || msg.time} • 7 Days Free Warranty Active ⭐
            </p>
          </div>
        ) : (
          <button
            onClick={() => onCompleteOrder(msg.id, order.orderId)}
            className="w-full py-2.5 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-[13px] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Complete Order (অর্ডার সম্পন্ন করুন)</span>
          </button>
        )}

        {/* Bottom Time Stamp */}
        <div className="flex justify-end pt-0.5">
          <span className={`text-[11px] ${textSecondary}`}>{msg.time}</span>
        </div>
      </div>
    </div>
  );
}
