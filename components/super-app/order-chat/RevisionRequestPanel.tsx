'use client';

import { useState } from 'react';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { fieldControlClass } from '@/components/modals/place-order/OrderField';
import { useOrderRevision } from '@/hooks/useOrderRevision';
import { REVISION_WINDOW_DAYS } from '@/lib/revision';
import { Order } from '@/types/order.types';

/* "Send for revision": what is wrong, in a right-hand panel. Used by the customer and by an admin. */
export function RevisionRequestPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const [issue, setIssue] = useState('');
  const { request } = useOrderRevision(order.id);
  const isReady = issue.trim().length >= 5 && !request.isPending;

  return (
    <SidePanelShell title="রিভিশনে পাঠান" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          request.mutate(issue.trim(), { onSuccess: onClose });
        }}
      >
        <p className="text-[13px] font-medium leading-relaxed text-[#697586]">
          {REVISION_WINDOW_DAYS} দিনের সার্ভিস ওয়ারেন্টির মধ্যে অর্ডারটি আবার প্রোভাইডারের কাছে যাবে (রি-টাচ / রি-ওয়ার্ক)। এর জন্য নতুন কোনো চার্জ লাগবে না।
        </p>

        <p className="mb-[6px] mt-[16px] text-[14px] font-semibold text-[#202939]">কী সমস্যা হচ্ছে?</p>
        <div className="rounded-[10px] border border-[#cecece] bg-white px-[12px] py-[8px]">
          <textarea
            value={issue}
            onChange={(event) => setIssue(event.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="যেমন: এসি আবার ঠান্ডা হচ্ছে না"
            className={`${fieldControlClass} resize-none`}
          />
        </div>

        <div className="mt-[24px] flex justify-center">
          <button
            type="submit"
            disabled={!isReady}
            className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {request.isPending ? 'পাঠানো হচ্ছে...' : 'রিভিশনে পাঠান'}
          </button>
        </div>
      </form>
    </SidePanelShell>
  );
}
