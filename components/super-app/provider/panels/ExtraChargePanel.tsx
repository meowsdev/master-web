'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon, Note01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { extraChargeService } from '@/services/extra-charge.service';
import { Order } from '@/types/order.types';

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
 * Extra charge, as a right-hand panel. Nothing changes the order price here: the request goes to the
 * customer, and the backend adds it to the total only after they approve.
 */
export function ExtraChargePanel({ order, userId, onClose }: { order: Order; userId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<ChargeRow[]>([EMPTY_ROW]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTotal = Number(order.totalPrice || 0);
  const addedTotal = rows.reduce((sum, row) => sum + Math.max(0, parseFloat(row.amount) || 0), 0);

  const updateRow = (index: number, changes: Partial<ChargeRow>) =>
    setRows((previous) => previous.map((row, rowIndex) => (rowIndex === index ? { ...row, ...changes } : row)));

  const submit = async () => {
    const items = rows.map((row) => ({ label: row.label.trim(), amount: parseFloat(row.amount) }));
    if (items.some((item) => item.label.length < 2 || !(item.amount > 0))) {
      toast.error('প্রতিটি চার্জের নাম ও সঠিক পরিমাণ দিন।');
      return;
    }
    setIsSubmitting(true);
    try {
      await extraChargeService.request(order.id, items);
      toast.success('অতিরিক্ত চার্জ কাস্টমারের অনুমোদনের জন্য পাঠানো হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['extra-charges', userId, order.id] });
      queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidePanelShell title="Extra Charge" onClose={onClose}>
      <p className="text-[13px] font-medium text-[#697586]">কাস্টমার অনুমোদন দিলে মূল বিলের সাথে যোগ হবে।</p>

      {rows.map((row, index) => (
        <OrderField key={index} icon={Note01Icon}>
          <input value={row.label} onChange={(event) => updateRow(index, { label: event.target.value })} maxLength={100} placeholder="যেমন: ক্যাপাসিটর পরিবর্তন" className={fieldControlClass} />
          <input
            inputMode="numeric"
            value={row.amount}
            onChange={(event) => updateRow(index, { amount: event.target.value.replace(/\D/g, '').slice(0, 7) })}
            placeholder="৳ পরিমাণ"
            className={`${fieldControlClass} max-w-[110px] flex-none text-right`}
          />
          {rows.length > 1 && (
            <button type="button" onClick={() => setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index))} aria-label="Remove charge" className="cursor-pointer text-[#d64545]">
              <HugeiconsIcon icon={Delete02Icon} size={18} />
            </button>
          )}
        </OrderField>
      ))}

      {rows.length < MAX_ROWS && (
        <button type="button" onClick={() => setRows((previous) => [...previous, EMPTY_ROW])} className="mt-[14px] flex cursor-pointer items-center gap-[6px] text-[14px] font-semibold text-[#1daa61]">
          <HugeiconsIcon icon={Add01Icon} size={16} /> আরেকটি চার্জ যোগ করুন
        </button>
      )}

      <div className="mt-[20px] rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px]">
        <div className="flex justify-between text-[13px] font-medium text-[#697586]"><span>পূর্বের বিল</span><span>{formatTaka(currentTotal)}</span></div>
        <div className="mt-[6px] flex justify-between text-[13px] font-medium text-[#697586]"><span>নতুন সংযোজিত খরচ</span><span>{formatTaka(addedTotal)}</span></div>
        <div className="mt-[8px] flex justify-between border-t border-[#e5e5e5] pt-[8px] text-[15px] font-semibold text-[#202939]"><span>সর্বমোট নতুন বিল</span><span>{formatTaka(currentTotal + addedTotal)}</span></div>
      </div>

      <div className="mt-[28px] flex justify-center">
        <button type="button" onClick={submit} disabled={isSubmitting} className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? 'পাঠানো হচ্ছে...' : 'কাস্টমারের কাছে পাঠান'}
        </button>
      </div>
    </SidePanelShell>
  );
}
