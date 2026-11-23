'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useExpenseClaims } from '@/hooks/useExpenseClaims';
import { Order } from '@/types/order.types';
import { AmountRow, AmountRowsEditor, EMPTY_AMOUNT_ROW, sumAmountRows, toAmountItems } from './AmountRowsEditor';

/* Provider / technician, after the job: which parts were bought and what else was spent. It goes to an admin for review. */
export function ExpenseClaimPanel({ order, userId, onClose }: { order: Order; userId: string; onClose: () => void }) {
  const [rows, setRows] = useState<AmountRow[]>([EMPTY_AMOUNT_ROW]);
  const { submit } = useExpenseClaims(order.id, userId);
  const total = sumAmountRows(rows);

  const send = () => {
    const items = toAmountItems(rows);
    if (items.some((item) => item.label.length < 2 || !(item.amount > 0))) {
      toast.error('প্রতিটি খরচের নাম ও সঠিক পরিমাণ দিন।');
      return;
    }
    submit.mutate(items, { onSuccess: onClose });
  };

  return (
    <SidePanelShell title="পার্টস / খরচের হিসাব" onClose={onClose}>
      <p className="text-[13px] font-medium leading-relaxed text-muted">
        এই কাজে কত টাকার পার্টস কিনেছেন বা অন্য কী খরচ হয়েছে লিখুন। এডমিন রিভিউ করে অনুমোদন দিলে মোট বিল থেকে এই খরচ বাদ দিয়ে কমিশন হিসাব হবে।
      </p>

      <AmountRowsEditor rows={rows} onChange={setRows} labelPlaceholder="যেমন: ক্যাপাসিটর কেনা" addLabel="আরেকটি খরচ যোগ করুন" maxRows={20} />

      <div className="mt-[20px] rounded-[12px] border border-line bg-surface p-[14px]">
        <div className="flex justify-between text-[13px] font-medium text-muted"><span>অর্ডারের মোট বিল</span><span>{formatTaka(order.totalPrice)}</span></div>
        <div className="mt-[8px] flex justify-between border-t border-line pt-[8px] text-[15px] font-semibold text-ink"><span>মোট খরচ</span><span>{formatTaka(total)}</span></div>
      </div>

      <div className="mt-[28px] flex justify-center">
        <button type="button" onClick={send} disabled={submit.isPending} className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled">
          {submit.isPending ? 'পাঠানো হচ্ছে...' : 'এডমিনের কাছে পাঠান'}
        </button>
      </div>
    </SidePanelShell>
  );
}
