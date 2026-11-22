'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { fieldControlClass } from '@/components/modals/place-order/OrderField';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useExpenseClaims } from '@/hooks/useExpenseClaims';
import { ExpenseClaim } from '@/types/expense-claim.types';
import { Order } from '@/types/order.types';
import { AmountRow, AmountRowsEditor, sumAmountRows, toAmountItems, toAmountRows } from './AmountRowsEditor';

/** Same rule as the backend (commissionAfterExpenses): the order's own rate on (total - costs). */
const previewCommission = (total: number, commission: number, costs: number) => (total > 0 ? Math.max(0, Math.round((total - costs) * (commission / total))) : 0);

function ReviewForm({ order, userId, claim, onClose }: { order: Order; userId: string; claim: ExpenseClaim; onClose: () => void }) {
  const [rows, setRows] = useState<AmountRow[]>(() => toAmountRows(claim.items));
  const [note, setNote] = useState('');
  const { approve, reject } = useExpenseClaims(order.id, userId);
  const isBusy = approve.isPending || reject.isPending;

  const total = Number(order.totalPrice);
  const commission = Number(order.adminCommission);
  const costs = sumAmountRows(rows);
  const newCommission = previewCommission(total, commission, costs);

  const approveClaim = () => {
    const items = toAmountItems(rows);
    if (items.some((item) => item.label.length < 2)) {
      toast.error('প্রতিটি খরচের নাম দিন।');
      return;
    }
    if (costs > total) {
      toast.error('খরচ অর্ডারের মোট বিলের বেশি হতে পারে না।');
      return;
    }
    approve.mutate({ claimId: claim.id, items, note: note.trim() || undefined }, { onSuccess: onClose });
  };

  return (
    <>
      <p className="text-[13px] font-medium leading-relaxed text-[#697586]">
        প্রোভাইডারের পাঠানো খরচ যাচাই করুন। দরকার হলে পরিমাণ কমান বা বাড়ান, তারপর অনুমোদন দিন। মোট বিল থেকে অনুমোদিত খরচ বাদ দিয়ে কমিশন হিসাব হবে।
      </p>
      <p className="mt-[10px] text-[13px] font-medium text-[#697586]">প্রোভাইডারের দাবি: {formatTaka(claim.claimedTotal)}</p>

      <AmountRowsEditor rows={rows} onChange={setRows} labelPlaceholder="খরচের নাম" addLabel="খরচ যোগ করুন" maxRows={20} />

      <div className="mt-[20px] rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px] text-[13px] font-medium text-[#697586]">
        <div className="flex justify-between"><span>অর্ডারের মোট বিল</span><span>{formatTaka(total)}</span></div>
        <div className="mt-[6px] flex justify-between"><span>অনুমোদিত খরচ</span><span>− {formatTaka(costs)}</span></div>
        <div className="mt-[6px] flex justify-between"><span>কমিশনের ভিত্তি</span><span>{formatTaka(Math.max(0, total - costs))}</span></div>
        <div className="mt-[8px] flex justify-between border-t border-[#e5e5e5] pt-[8px] text-[15px] font-semibold text-[#202939]">
          <span>কমিশন</span><span>{formatTaka(commission)} → {formatTaka(newCommission)}</span>
        </div>
      </div>

      <div className="mt-[16px] rounded-[10px] border border-[#cecece] bg-white px-[12px] py-[8px]">
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={300} placeholder="প্রোভাইডারের জন্য নোট (ঐচ্ছিক)" className={`${fieldControlClass} resize-none`} />
      </div>

      <div className="mt-[24px] flex justify-center gap-[10px]">
        <button type="button" disabled={isBusy} onClick={() => reject.mutate({ claimId: claim.id, note: note.trim() || undefined }, { onSuccess: onClose })} className="cursor-pointer rounded-[8px] border border-[#cecece] bg-white px-[20px] py-[8px] text-[14px] font-semibold text-[#202939] hover:bg-[#f7f5f3] disabled:cursor-not-allowed disabled:opacity-50">
          ফেরত পাঠান
        </button>
        <button type="button" disabled={isBusy} onClick={approveClaim} className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
          {approve.isPending ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন ও সাবমিট'}
        </button>
      </div>
    </>
  );
}

/* Admin: review the provider's job costs, raise or lower each amount, see the new commission, then approve or send back. */
export function ExpenseReviewPanel({ order, userId, onClose }: { order: Order; userId: string; onClose: () => void }) {
  const { claims } = useExpenseClaims(order.id, userId);
  const pending = claims.find((claim) => claim.status === 'PENDING');

  return (
    <SidePanelShell title="খরচ রিভিউ" onClose={onClose}>
      {pending ? (
        // A key per claim: a newly sent claim gets a fresh form.
        <ReviewForm key={pending.id} order={order} userId={userId} claim={pending} onClose={onClose} />
      ) : (
        <p className="text-[14px] font-medium text-[#697586]">রিভিউয়ের জন্য কোনো খরচ অপেক্ষায় নেই।</p>
      )}
    </SidePanelShell>
  );
}
