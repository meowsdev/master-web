'use client';

import { formatTaka } from '@/components/modals/place-order/format-taka';
import { ExtraChargeRequest } from '@/types/extra-charge.types';

interface ExtraChargeCardProps {
  request: ExtraChargeRequest;
  /** The provider sees the request and its answer, but never the buttons. */
  viewer?: 'CUSTOMER' | 'PROVIDER';
  isAnswering: boolean;
  onApprove: () => void;
  onReject: () => void;
}

/* The customer's side of an extra-charge request: what was added, the new bill, and Reject / Approve. */
export function ExtraChargeCard({ request, viewer = 'CUSTOMER', isAnswering, onApprove, onReject }: ExtraChargeCardProps) {
  const previousTotal = Number(request.previousTotal);
  const addedTotal = Number(request.totalAmount);
  const isAnswered = request.status !== 'PENDING';

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

      {viewer === 'PROVIDER' ? (
        <footer className="mt-[14px] flex justify-end">
          <span className="rounded-[10px] bg-[#f7f5f3] px-[14px] py-[8px] text-[14px] font-semibold text-[#697586]">
            {request.status === 'PENDING' ? 'Waiting for the customer' : request.status === 'APPROVED' ? 'Customer approved' : 'Customer rejected'}
          </span>
        </footer>
      ) : (
      <footer className="mt-[14px] flex items-center justify-end gap-[10px]">
        <button
          type="button"
          onClick={onReject}
          disabled={isAnswered || isAnswering}
          className="cursor-pointer rounded-[10px] bg-white px-[16px] py-[8px] text-[15px] font-semibold shadow-sm ring-1 ring-[#e5e5e5] disabled:cursor-not-allowed disabled:text-[#9aa4b2] disabled:ring-0"
        >
          {request.status === 'REJECTED' ? 'Rejected' : 'Reject'}
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isAnswered || isAnswering}
          className="cursor-pointer rounded-[10px] bg-[#1daa61] px-[16px] py-[8px] text-[15px] font-semibold text-white hover:bg-[#189452] disabled:cursor-not-allowed disabled:bg-[#a9e5cf] disabled:hover:bg-[#a9e5cf]"
        >
          {request.status === 'APPROVED' ? 'Accepted' : 'Approve'}- {formatTaka(previousTotal + addedTotal)}
        </button>
      </footer>
      )}
    </article>
  );
}
