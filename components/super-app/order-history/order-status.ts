import { OrderStatus } from '@/types/order.types';

/** Filter chips of the Orders list. "All" is added by the shared sidebar top. */
export const ORDER_FILTER_CHIPS = ['Active', 'Accept', 'Complete', 'Cancel', 'Reject'] as const;

/*
 * Which statuses each chip shows. The backend has no separate "rejected" status:
 * a provider declining ends as CANCELLED, so "Reject" shows disputed orders for now.
 */
const STATUSES_BY_CHIP: Record<string, OrderStatus[]> = {
  Active: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS],
  Accept: [OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS],
  Complete: [OrderStatus.COMPLETED],
  Cancel: [OrderStatus.CANCELLED],
  Reject: [OrderStatus.DISPUTED],
};

export const matchesOrderFilter = (status: OrderStatus, chip: string) =>
  chip === 'All' || (STATUSES_BY_CHIP[chip]?.includes(status) ?? false);

export const ORDER_STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
  [OrderStatus.PENDING]: { text: 'Pending', className: 'text-[#b7791f]' },
  [OrderStatus.ACCEPTED]: { text: 'Accepted', className: 'text-primary' },
  [OrderStatus.IN_PROGRESS]: { text: 'In progress', className: 'text-primary' },
  [OrderStatus.COMPLETED]: { text: 'Complete', className: 'text-ink' },
  [OrderStatus.CANCELLED]: { text: 'Cancel', className: 'text-[#d64545]' },
  [OrderStatus.DISPUTED]: { text: 'Reject', className: 'text-[#d64545]' },
};
