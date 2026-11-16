'use client';

import { Order } from '@/types/order.types';
import { buildOrderTabLabel } from './order-labels';

interface OrderTabsBarProps {
  orders: Order[];
  /** null = General Chat */
  selectedOrderId: string | null;
  onSelect: (orderId: string | null) => void;
}

const tabClass = (isSelected: boolean) =>
  `h-[32px] shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-[12px] text-[12px] font-medium transition-colors ${
    isSelected ? 'border-[#bccdba] bg-[#a9e5cf] text-[#202939]' : 'border-[#cecece] bg-white text-[#697586] hover:bg-[#f7f5f3]'
  }`;

/* Figma chat tab row: General Chat first, then one pill per running order of this service. */
export function OrderTabsBar({ orders, selectedOrderId, onSelect }: OrderTabsBarProps) {
  return (
    <nav aria-label="Chat tabs" className="no-scrollbar flex shrink-0 items-center gap-[8px] overflow-x-auto border-b border-[#e5e5e5] bg-white px-[12px] py-[8px]">
      <button type="button" onClick={() => onSelect(null)} className={tabClass(selectedOrderId === null)}>
        General Chat
      </button>
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => onSelect(order.id)}
          aria-current={selectedOrderId === order.id ? 'page' : undefined}
          className={tabClass(selectedOrderId === order.id)}
        >
          {buildOrderTabLabel(order)}
        </button>
      ))}
    </nav>
  );
}
