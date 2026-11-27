'use client';

import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useExpenseClaims } from '@/hooks/useExpenseClaims';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { ExpenseClaim, ExpenseClaimStep, ExpenseItem } from '@/types/expense-claim.types';
import { Order } from '@/types/order.types';
import { openRevision } from '@/lib/revision';

export type ExpenseClaimViewer = 'PROVIDER' | 'TECHNICIAN' | 'ADMIN';

const STATUS_LABEL: Record<ExpenseClaim['status'], { text: string; className: string }> = {
  PROVIDER_REVIEW: { text: 'প্রোভাইডারের রিভিউয়ের অপেক্ষায়', className: 'text-[#b7791f]' },
  RETURNED_TO_TECHNICIAN: { text: 'টেকনিশিয়ানের কাছে ফেরত গেছে', className: 'text-[#b7791f]' },
  PENDING: { text: 'এডমিন রিভিউয়ের অপেক্ষায়', className: 'text-[#b7791f]' },
  APPROVED: { text: 'অনুমোদিত', className: 'text-primary' },
  REJECTED: { text: 'ফেরত পাঠানো হয়েছে', className: 'text-[#d64545]' },
};

const STEP_TEXT: Record<ExpenseClaimStep['action'], string> = {
  SUBMITTED: 'পাঠিয়েছে',
  RESUBMITTED: 'ঠিক করে আবার পাঠিয়েছে',
  PROVIDER_ACCEPTED: 'Accept করে এডমিনকে পাঠিয়েছে',
  PROVIDER_RETURNED: 'টেকনিশিয়ানকে ফেরত পাঠিয়েছে',
  ADMIN_RETURNED: 'প্রোভাইডারকে ফেরত পাঠিয়েছে',
  ADMIN_APPROVED: 'অনুমোদন দিয়েছে',
};
const ROLE_TEXT: Record<ExpenseClaimStep['byRole'], string> = { TECHNICIAN: 'টেকনিশিয়ান', PROVIDER: 'প্রোভাইডার', ADMIN: 'এডমিন' };

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

/* Who did what, with the total at each step, so a changed amount is never a surprise. */
function ClaimHistory({ steps }: { steps: ExpenseClaimStep[] }) {
  if (steps.length < 2) return null;
  return (
    <ol className="mt-[8px] flex flex-col gap-[4px] border-l-2 border-line pl-[10px] text-[12px] font-medium text-muted">
      {steps.map((step, index) => (
        <li key={`${step.at}-${index}`}>
          <span className="font-semibold text-ink">{ROLE_TEXT[step.byRole]}</span> {STEP_TEXT[step.action]} · {formatTaka(step.total)}
          {step.note && <span className="block">“{step.note}”</span>}
        </li>
      ))}
    </ol>
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
        <div className="flex justify-between"><dt>{isApproved ? 'দাবি করা খরচ' : 'এখনকার খরচ'}</dt><dd>{formatTaka(claim.claimedTotal)}</dd></div>
        {isApproved && (
          <>
            <div className="flex justify-between font-semibold text-ink"><dt>অনুমোদিত খরচ</dt><dd>{formatTaka(claim.approvedTotal ?? 0)}</dd></div>
            <div className="flex justify-between"><dt>কমিশন</dt><dd>{formatTaka(claim.commissionBefore ?? 0)} → {formatTaka(claim.commissionAfter ?? 0)}</dd></div>
          </>
        )}
      </dl>
      <ClaimHistory steps={claim.history ?? []} />
      {/* Older claims have no history: their notes show here instead. */}
      {(claim.history ?? []).length < 2 && claim.reviewNote && <p className="mt-[6px] text-[12px] font-medium text-muted">এডমিনের নোট: {claim.reviewNote}</p>}
    </div>
  );
}

const buttonClass = 'mt-[12px] h-[36px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90';

/*
 * Job costs on the order timeline, one card for everyone who handles them (the customer never sees it):
 * - technician: sends costs (they go to the provider); fixes and sends again what the provider sent back;
 * - provider: sends their own costs (straight to the admin); reviews what the technician sent or the admin sent back;
 * - admin: reviews what reaches them, and approves or sends it back to the provider.
 */
export function ExpenseClaimsCard({ order, userId, viewer }: { order: Order; userId: string; viewer: ExpenseClaimViewer }) {
  const { claims, canSubmit } = useExpenseClaims(order.id, userId);
  const { canReviewExpenses } = useStaffPermissions();
  const openPanel = useOrderPanelStore((state) => state.open);
  const waitingFor = (status: ExpenseClaim['status']) => claims.some((claim) => claim.status === status);
  // Closed while a revision is open: parts found then are billed to the customer as an Extra Charge.
  const canSend = viewer !== 'ADMIN' && canSubmit && Boolean(order.completedAt) && !openRevision(order);

  if (claims.length === 0 && !canSend) return null;

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-white p-[16px] text-ink shadow-sm">
      <h3 className="text-[13px] font-semibold">পার্টস / খরচের হিসাব</h3>
      {claims.length === 0 && (
        <p className="mt-[6px] text-[13px] font-medium text-muted">
          {viewer === 'TECHNICIAN'
            ? 'কাজে পার্টস কিনে থাকলে বা অন্য খরচ হলে জমা দিন। প্রোভাইডার দেখে এডমিনের কাছে পাঠাবে।'
            : 'কাজে পার্টস কিনে থাকলে বা অন্য খরচ হলে জমা দিন। এডমিন অনুমোদন দিলে সেই খরচ বাদ দিয়ে কমিশন হিসাব হবে।'}
        </p>
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
        <button type="button" onClick={() => openPanel(order.id, 'expenseClaim')} className={buttonClass}>
          {claims.length > 0 ? 'আবার খরচ পাঠান' : 'পার্টস / খরচ জমা দিন'}
        </button>
      )}
      {viewer === 'TECHNICIAN' && waitingFor('RETURNED_TO_TECHNICIAN') && (
        <button type="button" onClick={() => openPanel(order.id, 'expenseClaim')} className={buttonClass}>
          ঠিক করে আবার পাঠান
        </button>
      )}
      {viewer === 'PROVIDER' && waitingFor('PROVIDER_REVIEW') && (
        <button type="button" onClick={() => openPanel(order.id, 'expenseReview')} className={buttonClass}>
          রিভিউ করুন
        </button>
      )}
      {viewer === 'ADMIN' && waitingFor('PENDING') && canReviewExpenses && (
        <button type="button" onClick={() => openPanel(order.id, 'expenseReview')} className={buttonClass}>
          রিভিউ করুন
        </button>
      )}
    </article>
  );
}
