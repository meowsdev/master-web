'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { extraChargeService } from '@/services/extra-charge.service';
import { Order } from '@/types/order.types';
import { AmountRow, AmountRowsEditor, EMPTY_AMOUNT_ROW, sumAmountRows, toAmountItems } from '../../order-chat/AmountRowsEditor';

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
  const [rows, setRows] = useState<AmountRow[]>([EMPTY_AMOUNT_ROW]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTotal = Number(order.totalPrice || 0);
  const addedTotal = sumAmountRows(rows);

  const submit = async () => {
    const items = toAmountItems(rows);
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

      <AmountRowsEditor rows={rows} onChange={setRows} labelPlaceholder="যেমন: ক্যাপাসিটর পরিবর্তন" addLabel="আরেকটি চার্জ যোগ করুন" />

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
