'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { PauseCircleIcon } from '@hugeicons/core-free-icons';
import { Order } from '@/types/order.types';
import { isOrderOnHold } from '../order-list-filters';

/*
 * Under the order header on every role's screen while the order is held: that it is paused, and why. Holding and
 * resuming are done from the status box in the header.
 */
export function OrderHoldBanner({ order }: { order: Order }) {
  if (!isOrderOnHold(order)) return null;
  return (
    <div className="flex shrink-0 items-center gap-[6px] border-b border-line bg-[#fff4e5] px-[16px] py-[10px] text-[13px] font-medium text-[#b7791f]">
      <HugeiconsIcon icon={PauseCircleIcon} size={18} strokeWidth={1.8} className="shrink-0" />
      <span className="min-w-0 truncate">
        <span className="font-semibold">Hold-এ আছে</span>
        {order.holdReason ? ` · ${order.holdReason}` : ''}
      </span>
    </div>
  );
}
