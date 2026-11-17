'use client';

import Image from 'next/image';
import { Order, OrderStatus } from '@/types/order.types';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { buildOrderTabLabel } from '@/components/super-app/order-chat/order-labels';
import { OrderAvatar } from './OrderAvatar';
import { ORDER_STATUS_LABEL } from './order-status';

interface OrderHistoryListItemProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
}

/* One row of the Orders list, in the same shape as a service row: picture, title, subtitle, status. */
export function OrderHistoryListItem({ order, isSelected, onSelect }: OrderHistoryListItemProps) {
  const status = ORDER_STATUS_LABEL[order.orderStatus];

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      aria-current={isSelected ? 'true' : undefined}
      className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[16px] px-[12px] py-[10px] text-left transition-colors ${
        isSelected ? 'bg-[#f7f5f3]' : 'hover:bg-[#f7f5f3]/60'
      }`}
    >
      <OrderAvatar order={order} />

      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <div className="flex items-center justify-between gap-[8px]">
          <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{buildOrderTabLabel(order)}</span>
          <span className={`flex shrink-0 items-center gap-[4px] text-[12px] font-semibold ${status.className}`}>
            {order.orderStatus === OrderStatus.COMPLETED && (
              <span className="flex size-[16px] items-center justify-center rounded-full bg-black p-[2px]">
                <Image src="/chat-list/completed-check.svg" alt="" width={10} height={9} style={{ width: 'auto', height: 'auto' }} />
              </span>
            )}
            {status.text}
          </span>
        </div>

        <div className="flex items-center justify-between gap-[8px] text-[13px] font-medium text-[#697586]">
          <span className="truncate">{order.service?.category?.name ?? order.service?.name}</span>
          <span className="shrink-0">{formatTaka(order.totalPrice)}</span>
        </div>
      </div>
    </button>
  );
}
