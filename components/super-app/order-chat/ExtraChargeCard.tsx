'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { ExtraChargeRequest } from '@/types/extra-charge.types';

interface ExtraChargeCardProps {
  request: ExtraChargeRequest;
  isAnswering: boolean;
  onApprove: () => void;
  onReject: () => void;
}

const ANSWERED_LABEL = { APPROVED: 'Approved', REJECTED: 'Rejected' } as const;

/* The customer's side of an extra-charge request: what was added, the new bill, and Reject / Approve. */
export function ExtraChargeCard({ request, isAnswering, onApprove, onReject }: ExtraChargeCardProps) {
  const previousTotal = Number(request.previousTotal);
  const addedTotal = Number(request.totalAmount);
  const answeredLabel = request.status === 'PENDING' ? null : ANSWERED_LABEL[request.status];

  return (
    <article className="w-full max-w-[420px] rounded-[16px] bg-white p-[14px] text-[#202939] shadow-sm">
      <h3 className="text-[13px] font-semibold">অতিরিক্ত সার্ভিস ও পার্টস সংযোজন রিকয়েস্ট...</h3>

      <ul className="mt-[12px] flex flex-col gap-[4px] text-[14px] font-medium">
        {request.items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex justify-between gap-[12px]">
            <span className="min-w-0">{item.label}</span>
            <span className="shrink-0">{formatTaka(item.amount)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-[12px] flex flex-col gap-[4px] border-t border-[#e5e5e5] pt-[12px] text-[14px] font-medium">
        <div className="flex justify-between"><dt>পূর্বের বিল</dt><dd>{formatTaka(previousTotal)}</dd></div>
        <div className="flex justify-between"><dt>নতুন সংযোজিত খরচ</dt><dd>{formatTaka(addedTotal)}</dd></div>
        <div className="flex justify-between font-semibold"><dt>সর্বমোট নতুন বিল</dt><dd>{formatTaka(previousTotal + addedTotal)}</dd></div>
      </dl>

      <footer className="mt-[14px] flex items-center justify-end gap-[10px]">
        {answeredLabel ? (
          <span className="flex items-center gap-[4px] rounded-[10px] bg-[#f7f5f3] px-[14px] py-[8px] text-[14px] font-semibold text-[#697586]">
            {request.status === 'APPROVED' && <HugeiconsIcon icon={Tick02Icon} size={16} />}
            {answeredLabel}
          </span>
        ) : (
          <>
            <button type="button" onClick={onReject} disabled={isAnswering} className="cursor-pointer rounded-[10px] bg-white px-[16px] py-[8px] text-[15px] font-semibold shadow-sm ring-1 ring-[#e5e5e5] disabled:opacity-60">
              Reject
            </button>
            <button type="button" onClick={onApprove} disabled={isAnswering} className="cursor-pointer rounded-[10px] bg-[#1daa61] px-[16px] py-[8px] text-[15px] font-semibold text-white hover:bg-[#189452] disabled:opacity-60">
              Approve- {formatTaka(previousTotal + addedTotal)}
            </button>
          </>
        )}
      </footer>
    </article>
  );
}
