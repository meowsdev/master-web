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

/** Same rule as the backend (commissionAfterExpenses): the order's percent of the profit, (total - costs). */
const previewCommission = (total: number, percent: number, costs: number) => Math.round((Math.max(0, total - costs) * percent) / 100);

type Reviewer = 'ADMIN' | 'PROVIDER';

/* Where this claim came from, so the reviewer knows what changed before it reached them. */
function ClaimContext({ claim, reviewer }: { claim: ExpenseClaim; reviewer: Reviewer }) {
  const history = claim.history ?? [];
  const first = history[0];
  const last = history[history.length - 1];
  const wasReturnedByAdmin = reviewer === 'PROVIDER' && last?.action === 'ADMIN_RETURNED';

  return (
    <div className="mt-[10px] flex flex-col gap-[6px] text-[13px] font-medium text-muted">
      {wasReturnedByAdmin && (
        <p className="rounded-[10px] bg-[#fff4e5] px-[12px] py-[8px] text-[#b7791f]">
          এডমিন ফেরত পাঠিয়েছে{last.note ? `: “${last.note}”` : '।'} এডমিনের প্রস্তাবিত অঙ্ক নিচে বসানো আছে।
        </p>
      )}
      {claim.isFromTechnician && first && <p>টেকনিশিয়ানের প্রথম দাবি: {formatTaka(first.total)}</p>}
      <p>এখনকার খরচ: {formatTaka(claim.claimedTotal)}</p>
      {reviewer === 'ADMIN' && claim.providerNote && <p>প্রোভাইডারের নোট: “{claim.providerNote}”</p>}
    </div>
  );
}

function ReviewForm({ order, userId, claim, reviewer, onClose }: { order: Order; userId: string; claim: ExpenseClaim; reviewer: Reviewer; onClose: () => void }) {
  const [rows, setRows] = useState<AmountRow[]>(() => toAmountRows(claim.items));
  const [note, setNote] = useState('');
  const { approve, reject, providerAccept, providerReturn, approvedCosts: earlierCosts } = useExpenseClaims(order.id, userId);
  const isBusy = approve.isPending || reject.isPending || providerAccept.isPending || providerReturn.isPending;
  const isAdmin = reviewer === 'ADMIN';

  const total = Number(order.totalPrice);
  const commission = Number(order.adminCommission);
  // Orders from before per-provider rates have none on the page yet: they were all 10%.
  const percent = Number(order.commissionRate ?? 10);
  const costs = sumAmountRows(rows);
  // A revision's claim: the job's costs were approved before; the commission takes all of them out.
  const allCosts = earlierCosts + costs;
  const profit = Math.max(0, total - allCosts);
  const newCommission = previewCommission(total, percent, allCosts);
  const percentLabel = `${percent.toLocaleString('bn-BD', { maximumFractionDigits: 2 })}%`;
  const trimmedNote = note.trim() || undefined;

  /** The amounts as typed, or null (with a message) when they cannot be sent. */
  const checkedItems = () => {
    const items = toAmountItems(rows);
    if (items.some((item) => item.label.length < 2)) {
      toast.error('প্রতিটি খরচের নাম দিন।');
      return null;
    }
    if (allCosts > total) {
      toast.error('খরচ অর্ডারের মোট বিলের বেশি হতে পারে না।');
      return null;
    }
    return items;
  };

  const accept = () => {
    const items = checkedItems();
    if (!items) return;
    if (isAdmin) approve.mutate({ claimId: claim.id, items, note: trimmedNote }, { onSuccess: onClose });
    else providerAccept.mutate({ claimId: claim.id, items, note: trimmedNote }, { onSuccess: onClose });
  };

  // The admin sends it back to the provider with the amounts as changed here; the provider sends it back to the technician.
  const sendBack = () => {
    if (isAdmin) {
      const items = checkedItems();
      if (!items) return;
      reject.mutate({ claimId: claim.id, note: trimmedNote, items }, { onSuccess: onClose });
    } else {
      providerReturn.mutate({ claimId: claim.id, note: trimmedNote }, { onSuccess: onClose });
    }
  };
  const canSendBack = isAdmin || Boolean(claim.isFromTechnician);

  return (
    <>
      <p className="text-[13px] font-medium leading-relaxed text-muted">
        {isAdmin
          ? 'খরচ যাচাই করুন। দরকার হলে পরিমাণ কমান বা বাড়ান, তারপর অনুমোদন দিন, অথবা ঠিক করা অঙ্কসহ প্রোভাইডারকে ফেরত পাঠান। মোট বিল থেকে অনুমোদিত খরচ বাদ দিয়ে কমিশন হিসাব হবে।'
          : 'খরচ যাচাই করুন। দরকার হলে পরিমাণ কমান বা বাড়ান, তারপর Accept করে এডমিনের কাছে পাঠান।'}
      </p>
      <ClaimContext claim={claim} reviewer={reviewer} />

      <AmountRowsEditor rows={rows} onChange={setRows} labelPlaceholder="খরচের নাম" addLabel="খরচ যোগ করুন" maxRows={20} />

      {isAdmin ? (
        <div className="mt-[20px] rounded-[12px] border border-line bg-surface p-[14px] text-[13px] font-medium text-muted">
          <div className="flex justify-between"><span>অর্ডারের মোট বিল</span><span>{formatTaka(total)}</span></div>
          {earlierCosts > 0 && (
            <div className="mt-[6px] flex justify-between"><span>আগে অনুমোদিত খরচ</span><span>− {formatTaka(earlierCosts)}</span></div>
          )}
          <div className="mt-[6px] flex justify-between"><span>{earlierCosts > 0 ? 'এবারের খরচ (রিভিশন)' : 'অনুমোদিত খরচ'}</span><span>− {formatTaka(costs)}</span></div>
          <div className="mt-[6px] flex justify-between"><span>মূল প্রফিট (কমিশনের ভিত্তি)</span><span>{formatTaka(profit)}</span></div>
          <div className="mt-[6px] flex justify-between"><span>পার্টনারের কমিশন রেট</span><span>{percentLabel}</span></div>
          <div className="mt-[8px] flex justify-between border-t border-line pt-[8px] text-[15px] font-semibold text-ink">
            <span>কমিশন</span><span>{formatTaka(commission)} → {formatTaka(newCommission)}</span>
          </div>
          <p className="mt-[6px] text-[12px]">
            {formatTaka(profit)} × {percentLabel} = {formatTaka(newCommission)}
          </p>
        </div>
      ) : (
        <div className="mt-[20px] rounded-[12px] border border-line bg-surface p-[14px]">
          <div className="flex justify-between text-[13px] font-medium text-muted"><span>অর্ডারের মোট বিল</span><span>{formatTaka(total)}</span></div>
          <div className="mt-[8px] flex justify-between border-t border-line pt-[8px] text-[15px] font-semibold text-ink"><span>মোট খরচ</span><span>{formatTaka(costs)}</span></div>
        </div>
      )}

      <div className="mt-[16px] rounded-[10px] border border-line bg-white px-[12px] py-[8px]">
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={300}
          placeholder={isAdmin ? 'প্রোভাইডারের জন্য নোট (ঐচ্ছিক)' : 'টেকনিশিয়ান বা এডমিনের জন্য নোট (ঐচ্ছিক)'}
          className={`${fieldControlClass} resize-none`}
        />
      </div>

      <div className="mt-[24px] flex flex-wrap justify-center gap-[10px]">
        {canSendBack && (
          <button type="button" disabled={isBusy} onClick={sendBack} className="cursor-pointer rounded-[8px] border border-line bg-white px-[20px] py-[8px] text-[14px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50">
            {isAdmin ? 'প্রোভাইডারকে ফেরত পাঠান' : 'টেকনিশিয়ানকে ফেরত পাঠান'}
          </button>
        )}
        <button type="button" disabled={isBusy} onClick={accept} className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled">
          {isAdmin ? (approve.isPending ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন ও সাবমিট') : providerAccept.isPending ? 'পাঠানো হচ্ছে...' : 'Accept করে এডমিনকে পাঠান'}
        </button>
      </div>
    </>
  );
}

/*
 * Reviewing job costs, for whoever holds them now:
 * - admin: costs that reached them; approve (the commission is worked out again) or send back to the provider;
 * - provider: costs the technician sent, or the admin sent back; accept to the admin, or send back to the technician.
 * Either may raise or lower each amount first.
 */
export function ExpenseReviewPanel({ order, userId, reviewer = 'ADMIN', onClose }: { order: Order; userId: string; reviewer?: Reviewer; onClose: () => void }) {
  const { claims } = useExpenseClaims(order.id, userId);
  const waiting = claims.find((claim) => claim.status === (reviewer === 'ADMIN' ? 'PENDING' : 'PROVIDER_REVIEW'));

  return (
    <SidePanelShell title="খরচ রিভিউ" onClose={onClose}>
      {waiting ? (
        // A key per claim and step: a claim that comes back gets a fresh form with its new amounts.
        <ReviewForm key={`${waiting.id}-${(waiting.history ?? []).length}`} order={order} userId={userId} claim={waiting} reviewer={reviewer} onClose={onClose} />
      ) : (
        <p className="text-[14px] font-medium text-muted">রিভিউয়ের জন্য কোনো খরচ অপেক্ষায় নেই।</p>
      )}
    </SidePanelShell>
  );
}
