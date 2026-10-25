'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  RotateCcw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { ChatMessage } from '@/types/super-app.types';

interface OrderCardProps {
  msg: ChatMessage;
  onCompleteOrder: (messageId: string, orderId: string) => void;
  onOpenOrders?: () => void;
  onPayAdvance?: (messageId: string, orderId: string, amount: number) => void;
  onAcceptPrice?: (messageId: string, orderId: string) => void;
  onRejectPrice?: (messageId: string, orderId: string) => void;
  onSatisfactionResponse?: (messageId: string, orderId: string, continueWith: boolean) => void;
  isDarkMode: boolean;
}

export function OrderCard({
  msg,
  onCompleteOrder,
  onOpenOrders,
  onPayAdvance,
  onAcceptPrice,
  onRejectPrice,
  onSatisfactionResponse,
  isDarkMode,
}: OrderCardProps) {
  const order = msg.orderCard;
  if (!order) return null;

  const isCompleted = order.status === 'COMPLETED';
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgCard = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgSubCard = isDarkMode ? 'bg-[#111b21] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';

  const advancePaidNum = Number(order.advancePaid || 0);
  const basePriceNum = Number(order.basePrice || 0);
  const additionalPriceNum = Number(order.additionalPrice || 0);
  const totalPriceNum = Number(order.totalPrice || basePriceNum + additionalPriceNum);
  const dueAmountNum = Number(order.dueAmount || Math.max(0, totalPriceNum - advancePaidNum));

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
          {order.hasActiveRevision ? (
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-black border border-amber-300 flex items-center gap-1.5 shadow-xs animate-pulse">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Revision Running</span>
            </span>
          ) : isCompleted ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d9fdd3] dark:bg-[#005c4b]/80 text-[#008069] dark:text-[#25D366] border border-[#25D366]/40 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 flex items-center gap-1.5 shadow-2xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>Running</span>
            </span>
          )}
        </div>

        {/* Service Title & Pricing Breakdown */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366] flex items-center justify-center text-xl shrink-0 shadow-2xs">
            {order.serviceIcon || '🛠️'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-[15px] font-bold leading-tight ${textPrimary}`}>
              {order.serviceName}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[13.5px] font-black text-[#008069] dark:text-[#25D366]">
                ৳{totalPriceNum} Total
              </span>
              {additionalPriceNum > 0 && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  (+৳{additionalPriceNum} Add-on)
                </span>
              )}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span className={`font-medium ${textPrimary}`}>Payment: {order.paymentMode}</span>
            </div>
            {advancePaidNum > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Advance Paid: ৳{advancePaidNum}
              </span>
            )}
          </div>
        </div>

        {/* FR-ORD Add-On Price Re-Approval Banner */}
        {order.hasPendingPriceEdit && (
          <div className="p-3 rounded-xl bg-amber-500/15 border-2 border-amber-400 dark:border-amber-600 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Provider Requested Price Modification</span>
            </div>
            <div className="p-2 rounded-lg bg-white/70 dark:bg-black/40 font-mono text-[11px] text-[#111b21] dark:text-[#e9edef] space-y-0.5">
              <p>Original Base: ৳{basePriceNum}</p>
              <p className="text-amber-600 dark:text-amber-400 font-bold">
                Additional Add-On: +৳{additionalPriceNum}
              </p>
              <div className="border-t border-black/10 dark:border-white/10 pt-0.5 font-bold text-[#008069] dark:text-[#25D366]">
                New Total Price: ৳{totalPriceNum}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => onAcceptPrice?.(msg.id, order.orderId)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Accept New Price (গ্রহণ করুন)
              </button>
              <button
                type="button"
                onClick={() => onRejectPrice?.(msg.id, order.orderId)}
                className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Active Revision Banner if order is in revision */}
        {order.hasActiveRevision && order.revisionIssue && (
          <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-[11px]">
              <RotateCcw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>3-Day Warranty Revision Active</span>
            </div>
            <p className="text-[11px] text-amber-950 dark:text-amber-200 italic pl-4">
              &ldquo;{order.revisionIssue}&rdquo;
            </p>
          </div>
        )}

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

        {/* FR-REV Post-Revision Satisfaction Auto-Ask Prompt */}
        {order.needsSatisfactionConfirmation && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#d9fdd3]/80 to-amber-500/10 dark:from-emerald-950/40 dark:to-amber-950/30 border border-emerald-500/30 text-xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[#008069] dark:text-[#25D366]">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>সার্ভিস কোয়ালিটি ফিডব্যাক (Satisfaction Prompt)</span>
            </div>
            <p className={`text-[12px] leading-relaxed ${textPrimary}`}>
              আপনার কাজ কি সঠিকভাবে সম্পন্ন হয়েছে? আপনি কি পরবর্তীতে এই প্রোভাইডারের সাথেই কাজ চালিয়ে যেতে চান?
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSatisfactionResponse?.(msg.id, order.orderId, true)}
                className="flex-1 py-2 px-3 rounded-lg bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>YES (চালিয়ে যাব)</span>
              </button>
              <button
                type="button"
                onClick={() => onSatisfactionResponse?.(msg.id, order.orderId, false)}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-500/20"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>NO (প্রোভাইডার রিমুভ)</span>
              </button>
            </div>
          </div>
        )}

        {/* FR-PAY Advance Settlement Action */}
        {!isCompleted && advancePaidNum === 0 && (
          <button
            type="button"
            onClick={() => onPayAdvance?.(msg.id, order.orderId, 500)}
            className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#008069] dark:text-[#25D366] text-xs font-bold border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Advance to Confirm (৳৫০০ অগ্রিম দিন)</span>
          </button>
        )}

        {/* Interactive Action Area: Complete Order Button or Completed Confirmation */}
        {isCompleted ? (
          <div className="p-3 rounded-xl bg-[#d9fdd3]/70 dark:bg-[#005c4b]/30 border border-[#25D366]/40 text-center space-y-2">
            <div className="text-[12.5px] font-bold text-[#008069] dark:text-[#25D366] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Service Successfully Completed!</span>
            </div>
            <p className={`text-[11px] ${textSecondary}`}>
              Completed at {order.completedAt || msg.time} • 3 Days Free Warranty Active ⭐
            </p>
            {onOpenOrders && (
              <button
                type="button"
                onClick={onOpenOrders}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request 3-Day Free Revision (রিভিশন দিন)</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onCompleteOrder(msg.id, order.orderId)}
            className="w-full py-2.5 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-[13px] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <CheckCircle2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>
              {dueAmountNum > 0
                ? `Complete & Settle Due ৳${dueAmountNum} (অর্ডার সম্পন্ন)`
                : 'Complete Order (অর্ডার সম্পন্ন করুন)'}
            </span>
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
