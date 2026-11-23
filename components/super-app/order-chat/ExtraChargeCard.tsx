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

/** "৩:৪৫ PM": when an app-less customer's request approves itself. */
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });

/* The customer's side of an extra-charge request: what was added, the new bill, and Reject / Approve. */
export function ExtraChargeCard({ request, viewer = 'CUSTOMER', isAnswering, onApprove, onReject }: ExtraChargeCardProps) {
  const previousTotal = Number(request.previousTotal);
  const addedTotal = Number(request.totalAmount);
  const isAnswered = request.status !== 'PENDING';

  return (
    <article className="w-full max-w-[420px] rounded-[16px] bg-white p-[14px] text-ink shadow-sm">
      <h3 className="text-[13px] font-semibold">অতিরিক্ত সার্ভিস ও পার্টস সংযোজন রিকয়েস্ট...</h3>

      <ul className="mt-[12px] flex flex-col gap-[4px] text-[14px] font-medium">
        {request.items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex justify-between gap-[12px]">
            <span className="min-w-0">{item.label}</span>
            <span className="shrink-0">{formatTaka(item.amount)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-[12px] flex flex-col gap-[4px] border-t border-line pt-[12px] text-[14px] font-medium">
        <div className="flex justify-between"><dt>পূর্বের বিল</dt><dd>{formatTaka(previousTotal)}</dd></div>
        <div className="flex justify-between"><dt>নতুন সংযোজিত খরচ</dt><dd>{formatTaka(addedTotal)}</dd></div>
        <div className="flex justify-between font-semibold"><dt>সর্বমোট নতুন বিল</dt><dd>{formatTaka(previousTotal + addedTotal)}</dd></div>
      </dl>

      {/* The customer does not use the app (e.g. an admin placed the order): it approves itself after 15 minutes. */}
      {request.status === 'PENDING' && request.autoApproveAt && (
        <p className="mt-[10px] rounded-[10px] bg-[#fff4e5] px-[10px] py-[6px] text-[12px] font-medium text-[#b7791f]">
          কাস্টমার অ্যাপে নেই। {formatTime(request.autoApproveAt)} এর মধ্যে উত্তর না এলে এটি অটো-অ্যাপ্রুভ হবে।
        </p>
      )}
      {request.isAutoApproved && (
        <p className="mt-[10px] rounded-[10px] bg-secondary px-[10px] py-[6px] text-[12px] font-medium text-primary">
          অটো-অ্যাপ্রুভড: কাস্টমার অ্যাপে ছিলেন না, নির্ধারিত সময়ে উত্তর আসেনি।
        </p>
      )}

      {viewer === 'PROVIDER' ? (
        <footer className="mt-[14px] flex justify-end">
          <span className="rounded-[10px] bg-surface px-[14px] py-[8px] text-[14px] font-semibold text-muted">
            {request.status === 'PENDING' ? 'Waiting for the customer' : request.status === 'APPROVED' ? (request.isAutoApproved ? 'Auto-approved' : 'Customer approved') : 'Customer rejected'}
          </span>
        </footer>
      ) : (
      <footer className="mt-[14px] flex items-center justify-end gap-[10px]">
        <button
          type="button"
          onClick={onReject}
          disabled={isAnswered || isAnswering}
          className="cursor-pointer rounded-[10px] bg-white px-[16px] py-[8px] text-[15px] font-semibold shadow-sm ring-1 ring-line disabled:cursor-not-allowed disabled:text-muted disabled:ring-0"
        >
          {request.status === 'REJECTED' ? 'Rejected' : 'Reject'}
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isAnswered || isAnswering}
          className="cursor-pointer rounded-[10px] bg-primary px-[16px] py-[8px] text-[15px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-secondary disabled:hover:bg-secondary"
        >
          {request.status === 'APPROVED' ? 'Accepted' : 'Approve'}- {formatTaka(previousTotal + addedTotal)}
        </button>
      </footer>
      )}
    </article>
  );
}
