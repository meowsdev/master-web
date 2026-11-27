'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useExpenseClaims } from '@/hooks/useExpenseClaims';
import { ExpenseClaim } from '@/types/expense-claim.types';
import { Order } from '@/types/order.types';
import { AmountRow, AmountRowsEditor, EMPTY_AMOUNT_ROW, sumAmountRows, toAmountItems, toAmountRows } from './AmountRowsEditor';

/*
 * Provider / technician, after the job: which parts were bought and what else was spent. A technician's costs go
 * to the provider first; the provider's go straight to an admin. Costs the provider sent back to the technician
 * open here filled in with their amounts and the provider's note, to change and send again.
 */
export function ExpenseClaimPanel({ order, userId, viewer = 'PROVIDER', onClose }: { order: Order; userId: string; viewer?: 'PROVIDER' | 'TECHNICIAN'; onClose: () => void }) {
  const { claims } = useExpenseClaims(order.id, userId);
  const returned = viewer === 'TECHNICIAN' ? claims.find((claim) => claim.status === 'RETURNED_TO_TECHNICIAN') : undefined;
  // A key per claim: the form starts from the returned amounts, or empty for new costs.
  return (
    <SidePanelShell title="পার্টস / খরচের হিসাব" onClose={onClose}>
      <ClaimForm key={returned?.id ?? 'new'} order={order} userId={userId} viewer={viewer} returned={returned} onClose={onClose} />
    </SidePanelShell>
  );
}

function ClaimForm({ order, userId, viewer, returned, onClose }: { order: Order; userId: string; viewer: 'PROVIDER' | 'TECHNICIAN'; returned?: ExpenseClaim; onClose: () => void }) {
  const [rows, setRows] = useState<AmountRow[]>(() => (returned ? toAmountRows(returned.items) : [EMPTY_AMOUNT_ROW]));
  const { submit, resubmit } = useExpenseClaims(order.id, userId);
  const total = sumAmountRows(rows);
  const isSending = submit.isPending || resubmit.isPending;
  const isTechnician = viewer === 'TECHNICIAN';

  const send = () => {
    const items = toAmountItems(rows);
    if (items.some((item) => item.label.length < 2 || !(item.amount > 0))) {
      toast.error('প্রতিটি খরচের নাম ও সঠিক পরিমাণ দিন।');
      return;
    }
    if (returned) resubmit.mutate({ claimId: returned.id, items }, { onSuccess: onClose });
    else submit.mutate(items, { onSuccess: onClose });
  };

  return (
    <>
      {returned ? (
        <div className="rounded-[10px] bg-[#fff4e5] px-[12px] py-[10px] text-[13px] font-medium text-[#b7791f]">
          প্রোভাইডার খরচের হিসাব ফেরত পাঠিয়েছে। অঙ্ক ঠিক করে আবার পাঠান।
          {returned.providerNote && <span className="mt-[4px] block font-semibold">প্রোভাইডারের নোট: “{returned.providerNote}”</span>}
        </div>
      ) : (
        <p className="text-[13px] font-medium leading-relaxed text-muted">
          {isTechnician
            ? 'এই কাজে কত টাকার পার্টস কিনেছেন বা অন্য কী খরচ হয়েছে লিখুন। প্রথমে প্রোভাইডার দেখবে, তারপর এডমিন।'
            : 'এই কাজে কত টাকার পার্টস কিনেছেন বা অন্য কী খরচ হয়েছে লিখুন। এডমিন রিভিউ করে অনুমোদন দিলে মোট বিল থেকে এই খরচ বাদ দিয়ে কমিশন হিসাব হবে।'}
        </p>
      )}

      <AmountRowsEditor rows={rows} onChange={setRows} labelPlaceholder="যেমন: ক্যাপাসিটর কেনা" addLabel="আরেকটি খরচ যোগ করুন" maxRows={20} />

      <div className="mt-[20px] rounded-[12px] border border-line bg-surface p-[14px]">
        <div className="flex justify-between text-[13px] font-medium text-muted"><span>অর্ডারের মোট বিল</span><span>{formatTaka(order.totalPrice)}</span></div>
        <div className="mt-[8px] flex justify-between border-t border-line pt-[8px] text-[15px] font-semibold text-ink"><span>মোট খরচ</span><span>{formatTaka(total)}</span></div>
      </div>

      <div className="mt-[28px] flex justify-center">
        <button type="button" onClick={send} disabled={isSending} className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled">
          {isSending ? 'পাঠানো হচ্ছে...' : isTechnician ? 'প্রোভাইডারের কাছে পাঠান' : 'এডমিনের কাছে পাঠান'}
        </button>
      </div>
    </>
  );
}
