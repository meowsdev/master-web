'use client';

import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/types/order.types';
import { ordersService } from '@/services/orders.service';

interface ProviderPriceEditModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPriceUpdated: () => void;
  isDarkMode: boolean;
}

export function ProviderPriceEditModal({
  order,
  isOpen,
  onClose,
  onPriceUpdated,
  isDarkMode,
}: ProviderPriceEditModalProps) {
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const originalPriceNum = Number(order.originalPrice || order.totalPrice || 0);
  const additionalNum = Math.max(0, parseFloat(additionalAmount) || 0);
  const newTotal = originalPriceNum + additionalNum;
  const currentEdits = order.priceEditCount || 0;
  const remainingEdits = Math.max(0, 2 - currentEdits);

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgModal = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgInput = isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingEdits <= 0) {
      toast.error('সর্বোচ্চ ২ বার দাম পরিবর্তনের সীমা পূর্ণ হয়েছে!');
      return;
    }
    if (additionalNum <= 0) {
      toast.error('অনুগ্রহ করে সঠিক অতিরিক্ত চার্জ ইনপুট দিন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await ordersService.updateOrder(order.id, {
        additionalPrice: additionalNum,
      });
      toast.success(`অতিরিক্ত চার্জ ৳${additionalNum} যোগ করে কাস্টমারের অনুমোদনের জন্য পাঠানো হয়েছে!`);
      onPriceUpdated();
      onClose();
    } catch {
      toast.error('দাম আপডেট করতে ব্যর্থ হয়েছে।');
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
            <div className="w-8 h-8 rounded-full bg-[#008069]/10 text-[#008069] dark:text-[#25D366] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>
                Modify Order Price (+ Add-On)
              </h3>
              <p className={`text-[11px] ${textSecondary}`}>
                কাজের অতিরিক্ত চার্জ যোগ করুন (সর্বোচ্চ ২ বার)
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

        {/* Edit Limits Notice */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <p className="leading-tight">
            অরিজিনাল দাম অপরিবর্তিত থাকবে। অবশিষ্ট সুযোগ: <span className="font-bold">{remainingEdits}/2 বার</span>।
          </p>
        </div>

        {/* Calculation Preview */}
        <div className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between text-[#8696a0]">
            <span>Original Price:</span>
            <span>৳{originalPriceNum}</span>
          </div>
          <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
            <span>+ Additional Add-On:</span>
            <span>৳{additionalNum}</span>
          </div>
          <div className="border-t border-black/10 dark:border-white/10 pt-1.5 flex justify-between font-bold text-sm text-[#008069] dark:text-[#25D366]">
            <span>New Total:</span>
            <span>৳{newTotal}</span>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              অতিরিক্ত চার্জের পরিমাণ (টাকা):
            </label>
            <input
              type="number"
              min="1"
              required
              value={additionalAmount}
              onChange={(e) => setAdditionalAmount(e.target.value)}
              placeholder="e.g. 500"
              className={`w-full py-2 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#008069] ${bgInput}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              অতিরিক্ত চার্জের কারণ (Optional):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. অতিরিক্ত গ্যাস রিফিল বা ক্যাপাসিটর পরিবর্তন"
              className={`w-full py-2 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#008069] ${bgInput}`}
            />
          </div>

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
              disabled={isSubmitting || remainingEdits <= 0}
              className="flex-1 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'দাম আপডেট পাঠান'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
