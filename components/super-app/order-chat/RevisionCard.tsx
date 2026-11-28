'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { RepeatIcon } from '@hugeicons/core-free-icons';
import { openRevision } from '@/lib/revision';
import { Order } from '@/types/order.types';

/*
 * A running revision on an order's timeline, the same card for every viewer: what is wrong (the provider finishes it
 * with Revision Done in the status box). Asking for a revision is in the order's status box (the customer, or an
 * admin who may), so this card no longer offers it.
 */
export function RevisionCard({ order }: { order: Order }) {
  const running = openRevision(order);
  if (!running) return null;

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-gradient-to-b from-white to-[#fff4e5] p-[16px] text-ink">
      <div className="flex items-center gap-[8px]">
        <HugeiconsIcon icon={RepeatIcon} size={18} className="text-[#b7791f]" />
        <h3 className="text-[13px] font-semibold">
          রিভিশন চলছে (রি-টাচ / রি-ওয়ার্ক)
        </h3>
      </div>

      <p className="mt-[8px] text-[13px] font-medium text-muted">&ldquo;{running.issueDescription}&rdquo;</p>
    </article>
  );
}
