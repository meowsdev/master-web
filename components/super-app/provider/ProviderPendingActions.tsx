'use client';

import { Order, OrderStatus } from '@/types/order.types';

interface ProviderPendingActionsProps {
  order: Order;
  onUpdateStatus: (status: OrderStatus) => Promise<void>;
  isUpdatingStatus: boolean;
}

/*
 * Accept / Decline for a new order, on its card. Accepting starts the work at once (there is no
 * separate Start Work step). The backend decides whether the provider may take the order.
 */
export function ProviderPendingActions({ order, onUpdateStatus, isUpdatingStatus }: ProviderPendingActionsProps) {
  if (order.orderStatus !== OrderStatus.PENDING) return null;

  return (
    <div className="flex items-center gap-[8px]">
      <button type="button" disabled={isUpdatingStatus} onClick={() => onUpdateStatus(OrderStatus.IN_PROGRESS)} className="cursor-pointer rounded-[10px] bg-[#1daa61] px-[18px] py-[8px] text-[14px] font-semibold text-white hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
        Accept
      </button>
      <button type="button" disabled={isUpdatingStatus} onClick={() => onUpdateStatus(OrderStatus.CANCELLED)} className="cursor-pointer rounded-[10px] border border-[#cecece] bg-white px-[18px] py-[8px] text-[14px] font-semibold text-[#202939] hover:bg-[#f7f5f3] disabled:cursor-not-allowed disabled:opacity-50">
        Decline
      </button>
    </div>
  );
}
