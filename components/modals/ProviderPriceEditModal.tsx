'use client';

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { Order } from '@/types/order.types';
import { extraChargeService } from '@/services/extra-charge.service';

interface ProviderPriceEditModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onPriceUpdated: () => void;
  isDarkMode: boolean;
}

interface ChargeRow {
  label: string;
  amount: string;
}

const EMPTY_ROW: ChargeRow = { label: '', amount: '' };
const MAX_ROWS = 10;

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'Could not send the extra charge';
};

/*
 * Provider's extra-charge form. Nothing changes the order price here: the request goes to the
 * customer, and the backend adds it to the total only after they approve.
 */
export function ProviderPriceEditModal({ order, isOpen, onClose, onPriceUpdated, isDarkMode }: ProviderPriceEditModalProps) {
  const [rows, setRows] = useState<ChargeRow[]>([EMPTY_ROW]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentTotal = Number(order.totalPrice || 0);
  const addedTotal = rows.reduce((sum, row) => sum + Math.max(0, parseFloat(row.amount) || 0), 0);

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgModal = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgInput = isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]';

  const updateRow = (index: number, changes: Partial<ChargeRow>) =>
    setRows((previous) => previous.map((row, rowIndex) => (rowIndex === index ? { ...row, ...changes } : row)));
  const removeRow = (index: number) => setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const items = rows.map((row) => ({ label: row.label.trim(), amount: parseFloat(row.amount) }));
    if (items.some((item) => item.label.length < 2 || !(item.amount > 0))) {
      toast.error('প্রতিটি চার্জের নাম ও সঠিক পরিমাণ দিন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await extraChargeService.request(order.id, items);
      toast.success('অতিরিক্ত চার্জ কাস্টমারের অনুমোদনের জন্য পাঠানো হয়েছে।');
      setRows([EMPTY_ROW]);
      onPriceUpdated();
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
            <h3 className={`text-sm font-bold ${textPrimary}`}>অতিরিক্ত চার্জ যোগ করুন</h3>
            <p className={`text-[11px] ${textSecondary}`}>কাস্টমার অনুমোদন দিলে মূল বিলের সাথে যোগ হবে</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/10">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={row.label}
                onChange={(event) => updateRow(index, { label: event.target.value })}
                maxLength={100}
                placeholder="যেমন: ক্যাপাসিটর পরিবর্তন"
                className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1daa61] ${bgInput}`}
              />
              <input
                type="number"
                min="1"
                value={row.amount}
                onChange={(event) => updateRow(index, { amount: event.target.value })}
                placeholder="৳"
                className={`w-24 rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1daa61] ${bgInput}`}
              />
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(index)} aria-label="Remove charge" className="cursor-pointer text-[#d64545]">
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                </button>
              )}
            </div>
          ))}

          {rows.length < MAX_ROWS && (
            <button type="button" onClick={() => setRows((previous) => [...previous, EMPTY_ROW])} className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#1daa61]">
              <HugeiconsIcon icon={Add01Icon} size={14} /> আরেকটি চার্জ যোগ করুন
            </button>
          )}

          <div className={`space-y-1.5 rounded-xl border border-black/5 p-3.5 text-xs dark:border-white/10 ${textSecondary}`}>
            <div className="flex justify-between"><span>পূর্বের বিল</span><span>৳{currentTotal}</span></div>
            <div className="flex justify-between"><span>নতুন সংযোজিত খরচ</span><span>৳{addedTotal}</span></div>
            <div className="flex justify-between border-t border-black/10 pt-1.5 text-sm font-bold text-[#1daa61] dark:border-white/10">
              <span>সর্বমোট নতুন বিল</span><span>৳{currentTotal + addedTotal}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl bg-black/5 py-2 text-xs font-semibold hover:bg-black/10 dark:bg-white/5">
              বাতিল
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer rounded-xl bg-[#1daa61] py-2 text-xs font-bold text-white hover:bg-[#189452] disabled:opacity-50">
              {isSubmitting ? 'পাঠানো হচ্ছে...' : 'কাস্টমারের কাছে পাঠান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
