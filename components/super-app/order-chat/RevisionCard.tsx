'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { RepeatIcon } from '@hugeicons/core-free-icons';
import { openRevision, revisionDaysLeft, REVISION_WINDOW_DAYS } from '@/lib/revision';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { Order } from '@/types/order.types';

interface RevisionCardProps {
  order: Order;
  /** The customer of the order or an admin: may send it back for revision. Everyone else only sees the status. */
  canRequest: boolean;
}

/*
 * The 7-day service warranty on an order's timeline, the same card for every viewer:
 * - a revision is running: what is wrong (the provider finishes it with "Revision Done" in the + menu);
 * - completed and still under warranty: days left and, for the customer or an admin, "Send for revision".
 * Nothing shows outside the warranty.
 */
export function RevisionCard({ order, canRequest }: RevisionCardProps) {
  const openPanel = useOrderPanelStore((state) => state.open);
  const running = openRevision(order);
  const daysLeft = revisionDaysLeft(order);
  if (!running && daysLeft === null) return null;

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-gradient-to-b from-white to-[#fff4e5] p-[16px] text-[#202939]">
      <div className="flex items-center gap-[8px]">
        <HugeiconsIcon icon={RepeatIcon} size={18} className="text-[#b7791f]" />
        <h3 className="text-[13px] font-semibold">
          {running ? 'রিভিশন চলছে (রি-টাচ / রি-ওয়ার্ক)' : `${REVISION_WINDOW_DAYS} দিনের সার্ভিস ওয়ারেন্টি · আর ${daysLeft} দিন বাকি`}
        </h3>
      </div>

      {running ? (
        <p className="mt-[8px] text-[13px] font-medium text-[#697586]">&ldquo;{running.issueDescription}&rdquo;</p>
      ) : (
        <p className="mt-[8px] text-[13px] font-medium text-[#697586]">কাজে কোনো সমস্যা থাকলে অর্ডারটি আবার প্রোভাইডারের কাছে রিভিশনে পাঠানো যাবে, কোনো চার্জ ছাড়া।</p>
      )}

      {!running && canRequest && (
        <button
          type="button"
          onClick={() => openPanel(order.id, 'revision')}
          className="mt-[12px] h-[36px] cursor-pointer rounded-[10px] bg-[#1daa61] px-[16px] text-[14px] font-semibold text-white hover:bg-[#189452]"
        >
          রিভিশনে পাঠান
        </button>
      )}
    </article>
  );
}
