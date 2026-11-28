'use client';

import { VerifiedMark } from '../VerifiedMark';
import { ReactNode } from 'react';
import { Order, OrderStatus } from '@/types/order.types';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { buildOrderTabLabel } from '@/components/super-app/order-chat/order-labels';
import { OrderAvatar } from './OrderAvatar';
import { OrderCreatorTag } from './OrderCreatorTag';
import { ORDER_STATUS_LABEL } from './order-status';
import { isOrderOnHold } from '../order-list-filters';

interface OrderHistoryListItemProps {
  order: Order;
  isSelected: boolean;
  onSelect: (order: Order) => void;
  /** Defaults to the customer's label (#ref | technician | provider). */
  title?: string;
  /** Defaults to the order's assignee / service picture. */
  avatar?: ReactNode;
  /** Replaces the status text, e.g. "Revision" for the provider. */
  statusOverride?: { text: string; className: string };
}

/* One row of the Orders list, in the same shape as a service row: picture, title, subtitle, status. */
export function OrderHistoryListItem({ order, isSelected, onSelect, title, avatar, statusOverride }: OrderHistoryListItemProps) {
  // A held order says so on every role's list, before any other note.
  const status = isOrderOnHold(order) ? { text: 'Hold', className: 'text-[#b7791f]' } : statusOverride ?? ORDER_STATUS_LABEL[order.orderStatus];

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      aria-current={isSelected ? 'true' : undefined}
      className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[16px] px-[12px] py-[10px] text-left transition-colors ${
        isSelected ? 'bg-surface' : 'hover:bg-surface/60'
      }`}
    >
      {avatar ?? <OrderAvatar order={order} />}

      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <div className="flex items-center justify-between gap-[8px]">
          <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{title ?? buildOrderTabLabel(order)}</span>
          <span className={`flex shrink-0 items-center gap-[4px] text-[12px] font-semibold ${status.className}`}>
            {order.orderStatus === OrderStatus.COMPLETED && (
              <VerifiedMark size={18} />
            )}
            {status.text}
          </span>
        </div>

        <div className="flex items-center justify-between gap-[8px] text-[13px] font-medium text-muted">
          <span className="flex min-w-0 items-center gap-[6px]">
            <OrderCreatorTag order={order} />
            <span className="truncate">{order.service?.category?.name ?? order.service?.name}</span>
          </span>
          <span className="shrink-0">{formatTaka(order.totalPrice)}</span>
        </div>
      </div>
    </button>
  );
}
