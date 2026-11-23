'use client';

import { Order } from '@/types/order.types';
import { buildOrderTabLabel } from './order-labels';

/** The id the Services tab stands for in the tab selection (order tabs use the order id). */
export const SERVICES_TAB = 'services';

interface OrderTabsBarProps {
  orders: Order[];
  /** SERVICES_TAB or an order id. */
  selectedTab: string;
  onSelect: (tab: string) => void;
}

const tabClass = (isSelected: boolean) =>
  `h-[32px] shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-[12px] text-[12px] font-medium transition-colors ${
    isSelected ? 'border-secondary bg-secondary text-ink' : 'border-line bg-white text-muted hover:bg-surface'
  }`;

/*
 * Tab row of a main service's chat: the fixed "Services" tab (its sub-service cards), then one pill per running
 * order, oldest first so tabs keep their place. Several orders can run at once, each with its own chat.
 */
export function OrderTabsBar({ orders, selectedTab, onSelect }: OrderTabsBarProps) {
  return (
    <nav aria-label="Chat tabs" className="no-scrollbar flex shrink-0 items-center gap-[8px] overflow-x-auto border-b border-line bg-white px-[12px] py-[8px]">
      <button type="button" onClick={() => onSelect(SERVICES_TAB)} aria-current={selectedTab === SERVICES_TAB ? 'page' : undefined} className={tabClass(selectedTab === SERVICES_TAB)}>
        Services
      </button>
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => onSelect(order.id)}
          aria-current={selectedTab === order.id ? 'page' : undefined}
          className={tabClass(selectedTab === order.id)}
        >
          {order.isPricePending && <span className="mr-[6px] inline-block size-[6px] rounded-full bg-amber-500 align-middle" aria-label="Waiting for price" />}
          {buildOrderTabLabel(order)}
        </button>
      ))}
    </nav>
  );
}
