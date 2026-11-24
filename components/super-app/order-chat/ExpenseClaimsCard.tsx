'use client';

import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useExpenseClaims } from '@/hooks/useExpenseClaims';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { ExpenseClaim, ExpenseItem } from '@/types/expense-claim.types';
import { Order } from '@/types/order.types';
import { openRevision } from '@/lib/revision';

const STATUS_LABEL: Record<ExpenseClaim['status'], { text: string; className: string }> = {
  PENDING: { text: 'এডমিন রিভিউয়ের অপেক্ষায়', className: 'text-[#b7791f]' },
  APPROVED: { text: 'অনুমোদিত', className: 'text-primary' },
  REJECTED: { text: 'ফেরত পাঠানো হয়েছে', className: 'text-[#d64545]' },
};

function ItemList({ items }: { items: ExpenseItem[] }) {
  return (
    <ul className="mt-[8px] flex flex-col gap-[4px] text-[14px] font-medium">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex justify-between gap-[12px]">
          <span className="min-w-0">{item.label}</span>
          <span className="shrink-0">{formatTaka(item.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

function ClaimSummary({ claim }: { claim: ExpenseClaim }) {
  const status = STATUS_LABEL[claim.status];
  const isApproved = claim.status === 'APPROVED';
  return (
    <div className="border-t border-line pt-[10px] first:border-t-0 first:pt-0">
      <p className={`text-[12px] font-semibold ${status.className}`}>{status.text}</p>
      <ItemList items={isApproved && claim.approvedItems ? claim.approvedItems : claim.items} />
      <dl className="mt-[8px] flex flex-col gap-[2px] text-[13px] font-medium text-muted">
        <div className="flex justify-between"><dt>দাবি করা খরচ</dt><dd>{formatTaka(claim.claimedTotal)}</dd></div>
        {isApproved && (
          <>
            <div className="flex justify-between font-semibold text-ink"><dt>অনুমোদিত খরচ</dt><dd>{formatTaka(claim.approvedTotal ?? 0)}</dd></div>
            <div className="flex justify-between"><dt>কমিশন</dt><dd>{formatTaka(claim.commissionBefore ?? 0)} → {formatTaka(claim.commissionAfter ?? 0)}</dd></div>
          </>
        )}
      </dl>
      {claim.reviewNote && <p className="mt-[6px] text-[12px] font-medium text-muted">এডমিনের নোট: {claim.reviewNote}</p>}
    </div>
  );
}

/*
 * Job costs on the order timeline, one card for both sides:
 * - provider / technician: what they sent and its review; after the job, "send costs";
 * - admin: the same, with "Review" on a claim that is waiting.
 * The customer never sees it.
 */
export function ExpenseClaimsCard({ order, userId, viewer }: { order: Order; userId: string; viewer: 'WORKER' | 'ADMIN' }) {
  const { claims, canSubmit } = useExpenseClaims(order.id, userId);
  const { canReviewExpenses } = useStaffPermissions();
  const openPanel = useOrderPanelStore((state) => state.open);
  const pending = claims.find((claim) => claim.status === 'PENDING');
  // Closed while a revision is open: parts found then are billed to the customer as an Extra Charge.
  const canSend = viewer === 'WORKER' && canSubmit && Boolean(order.completedAt) && !openRevision(order);

  if (claims.length === 0 && !canSend) return null;

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-white p-[16px] text-ink shadow-sm">
      <h3 className="text-[13px] font-semibold">পার্টস / খরচের হিসাব</h3>
      {claims.length === 0 && (
        <p className="mt-[6px] text-[13px] font-medium text-muted">কাজে পার্টস কিনে থাকলে বা অন্য খরচ হলে জমা দিন। এডমিন অনুমোদন দিলে সেই খরচ বাদ দিয়ে কমিশন হিসাব হবে।</p>
      )}

      {claims.length > 0 && (
        <div className="mt-[10px] flex flex-col gap-[10px]">
          {claims.map((claim) => <ClaimSummary key={claim.id} claim={claim} />)}
        </div>
      )}

      {canSend && claims.some((claim) => claim.status === 'APPROVED') && (
        <p className="mt-[10px] text-[13px] font-medium text-muted">রিভিশনে বাড়তি কাজ বিল হয়েছে। সেই কাজে পার্টস বা খরচ লাগলে জমা দিন, একই নিয়মে কমিশন থেকে বাদ যাবে।</p>
      )}
      {canSend && (
        <button type="button" onClick={() => openPanel(order.id, 'expenseClaim')} className="mt-[12px] h-[36px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90">
          {claims.length > 0 ? 'আবার খরচ পাঠান' : 'পার্টস / খরচ জমা দিন'}
        </button>
      )}
      {viewer === 'ADMIN' && pending && canReviewExpenses && (
        <button type="button" onClick={() => openPanel(order.id, 'expenseReview')} className="mt-[12px] h-[36px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90">
          রিভিউ করুন
        </button>
      )}
    </article>
  );
}
