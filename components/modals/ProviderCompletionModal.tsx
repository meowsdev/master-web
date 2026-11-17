'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { Order } from '@/types/order.types';
import { CompletionPaymentMode, orderCompletionService } from '@/services/order-completion.service';
import { formatTaka } from '@/components/modals/place-order/format-taka';

interface ProviderCompletionModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const OPTIONS: Array<{ mode: CompletionPaymentMode; title: string; hint: string }> = [
  { mode: 'ONLINE', title: 'অনলাইন পেমেন্ট', hint: 'কাস্টমারের কাছে পেমেন্ট কার্ড যাবে। সে "Accept & Pay" করলে অর্ডার সম্পন্ন হবে।' },
  { mode: 'CASH', title: 'ক্যাশ / অফলাইন', hint: 'আপনি ক্যাশ বুঝে নিয়েছেন। অর্ডার সাথে সাথে সম্পন্ন হবে, কাস্টমারকে কিছু করতে হবে না।' },
];

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।';
};

/*
 * "কাজ শেষ": the provider says how the customer pays. All rules (status, who may complete,
 * cash vs online) are enforced by the backend; this only collects the choice.
 */
export function ProviderCompletionModal({ order, isOpen, onClose, isDarkMode }: ProviderCompletionModalProps) {
  const queryClient = useQueryClient();
  const [paymentMode, setPaymentMode] = useState<CompletionPaymentMode>('ONLINE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgModal = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await orderCompletionService.complete(order.id, paymentMode);
      toast.success(paymentMode === 'CASH' ? 'অর্ডার সম্পন্ন হয়েছে।' : 'কাস্টমারের কাছে পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে।');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['my-orders-drawer'] }),
      ]);
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`w-full max-w-md space-y-4 rounded-2xl border p-5 shadow-2xl ${bgModal}`}>
        <div className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/10">
          <div>
            <h3 className={`text-sm font-bold ${textPrimary}`}>কাজ শেষ করুন</h3>
            <p className={`text-[11px] ${textSecondary}`}>মোট বিল: {formatTaka(order.totalPrice)} • বাকি: {formatTaka(order.dueAmount)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <p className={`text-xs font-semibold ${textPrimary}`}>কাস্টমার কীভাবে পেমেন্ট করবে?</p>
          <div role="radiogroup" className="space-y-2">
            {OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                role="radio"
                aria-checked={paymentMode === option.mode}
                onClick={() => setPaymentMode(option.mode)}
                className={`w-full cursor-pointer rounded-xl border p-3 text-left ${
                  paymentMode === option.mode ? 'border-[#1daa61] bg-[#1daa61]/10' : 'border-black/10 dark:border-white/10'
                }`}
              >
                <span className={`block text-xs font-bold ${textPrimary}`}>{option.title}</span>
                <span className={`mt-0.5 block text-[11px] ${textSecondary}`}>{option.hint}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl bg-black/5 py-2 text-xs font-semibold hover:bg-black/10 dark:bg-white/5">
              বাতিল
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer rounded-xl bg-[#1daa61] py-2 text-xs font-bold text-white hover:bg-[#189452] disabled:opacity-50">
              {isSubmitting ? 'অপেক্ষা করুন...' : 'কাজ শেষ নিশ্চিত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
