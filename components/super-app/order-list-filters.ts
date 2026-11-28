import { Order, OrderStatus } from '@/types/order.types';
import { hasOpenRevision } from './provider/provider-order-filters';

/*
 * The order list's filter chips: the same for every role (customer, provider, technician, admin and other staff),
 * each with its count. "All" is added by the shared sidebar top. Every order falls in exactly one of these, so the
 * counts add up to All.
 */
export const ORDER_LIST_CHIPS = ['Active', 'Revision', 'Complete', 'Cancel', 'Hold'] as const;

const RUNNING: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS];

/** Paused by its technician, provider or an admin. A hold only means something while the order is running. */
export const isOrderOnHold = (order: Order) =>
  Boolean(order.isOnHold) && (order.orderStatus === OrderStatus.ACCEPTED || order.orderStatus === OrderStatus.IN_PROGRESS);

/** Hold also keeps the disputed orders the platform paused before holds existed. */
const isHeld = (order: Order) => isOrderOnHold(order) || order.orderStatus === OrderStatus.DISPUTED;
const isInRevision = (order: Order) => !isHeld(order) && hasOpenRevision(order);

export function matchesOrderListFilter(order: Order, chip: string): boolean {
  switch (chip) {
    case 'All': return true;
    case 'Active': return RUNNING.includes(order.orderStatus) && !isHeld(order) && !isInRevision(order);
    case 'Revision': return isInRevision(order);
    case 'Complete': return order.orderStatus === OrderStatus.COMPLETED && !isInRevision(order);
    case 'Cancel': return order.orderStatus === OrderStatus.CANCELLED;
    case 'Hold': return isHeld(order);
    default: return false;
  }
}

/** How many orders each chip (All included) would show. */
export function countOrdersByChip(orders: Order[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const chip of ['All', ...ORDER_LIST_CHIPS]) counts[chip] = orders.filter((order) => matchesOrderListFilter(order, chip)).length;
  return counts;
}
