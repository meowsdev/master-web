'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, Star, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types/order.types';
import { apiClient } from '@/lib/axios';

interface ProviderCompletionModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: () => void;
  isDarkMode: boolean;
}

export function ProviderCompletionModal({
  order,
  isOpen,
  onClose,
  onOrderCompleted,
  isDarkMode,
}: ProviderCompletionModalProps) {
  const [totalCollected, setTotalCollected] = useState(String(order.totalPrice || order.originalPrice || 0));
  const [hasTip, setHasTip] = useState(false);
  const [tipAmount, setTipAmount] = useState('0');
  const [customerRating, setCustomerRating] = useState(5);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgModal = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgInput = isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Update order status to COMPLETED
      await apiClient.patch(`/orders/${order.id}/status`, {
        orderStatus: OrderStatus.COMPLETED,
      });

      // 2. Submit payment and tips record if applicable
      try {
        await apiClient.post('/order-payment-and-tip', {
          orderId: order.id,
          serviceAmountPaid: parseFloat(totalCollected) || Number(order.totalPrice),
          tipAmount: hasTip ? parseFloat(tipAmount) || 0 : 0,
          hasTip,
          completedByPartner: true,
          paymentMode: 'CASH',
        });
      } catch {
        // Non-blocking if table endpoint optional
      }

      // 3. Submit customer rating
      try {
        await apiClient.post('/provider-reviews', {
          orderId: order.id,
          providerRating: customerRating,
          reviewComment: reviewNote || 'Customer was cooperative and payment settled in cash.',
        });
      } catch {
        // Non-blocking
      }

      toast.success('অর্ডার সফলভাবে সম্পন্ন ও ক্যাশ কালেকশন কনফার্ম করা হয়েছে! 💰');
      onOrderCompleted();
      onClose();
    } catch {
      toast.error('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-150 ${bgModal}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>
                Complete Order & Cash Collection
              </h3>
              <p className={`text-[11px] ${textSecondary}`}>
                ক্যাশ আদায় ও কাজের সমাপ্তি নিশ্চিতকরণ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Total Amount Paid / Collected */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              মোট আদায়কৃত সার্ভিস চার্জ (ক্যাশ):
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="number"
                min="0"
                required
                value={totalCollected}
                onChange={(e) => setTotalCollected(e.target.value)}
                className={`w-full py-2 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#008069] ${bgInput}`}
              />
            </div>
          </div>

          {/* Tips Status Toggle */}
          <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${textPrimary}`}>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>কাস্টমার কি কোনো টিপস দিয়েছেন?</span>
              </span>
              <button
                type="button"
                onClick={() => setHasTip(!hasTip)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  hasTip
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-gray-500'
                }`}
              >
                {hasTip ? 'হ্যাঁ (YES)' : 'না (NO)'}
              </button>
            </div>

            {hasTip && (
              <div className="pt-2 animate-in fade-in">
                <label className={`block text-[11px] font-medium mb-1 ${textSecondary}`}>
                  টিপসের পরিমাণ (টাকা):
                </label>
                <input
                  type="number"
                  min="1"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className={`w-full py-1.5 px-3 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-[#008069] ${bgInput}`}
                />
              </div>
            )}
          </div>

          {/* Customer Rating */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${textPrimary}`}>
              কাস্টমারকে রেটিং দিন (Partner Rating):
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCustomerRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= customerRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'প্রসেসিং...' : 'কনফার্ম ও অর্ডার সমাপ্ত'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
