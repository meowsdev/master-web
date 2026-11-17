import { Order, OrderStatus } from '@/types/order.types';

/** Filter chips of the provider's order list. "All" is added by the shared sidebar top. */
export const PROVIDER_FILTER_CHIPS = ['Active', 'Complete', 'Cancel', 'Hold', 'Schedule', 'Revision'] as const;

const RUNNING: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS];

export const hasOpenRevision = (order: Order) =>
  Boolean(order.revisions?.some((revision) => revision.revisionStatus === 'REQUESTED' || revision.revisionStatus === 'ACCEPTED'));

/** A running order whose visit day is still ahead. */
const isScheduledAhead = (order: Order) => {
  const visitDay = order.bookingDetail?.scheduledDate;
  if (!visitDay || !RUNNING.includes(order.orderStatus)) return false;
  return visitDay.slice(0, 10) > new Date().toISOString().slice(0, 10);
};

/*
 * What each chip shows. The backend has no "hold" status; disputed orders are the ones the
 * platform pauses, so Hold shows those.
 */
export function matchesProviderFilter(order: Order, chip: string): boolean {
  switch (chip) {
    case 'All': return true;
    case 'Active': return RUNNING.includes(order.orderStatus);
    case 'Complete': return order.orderStatus === OrderStatus.COMPLETED;
    case 'Cancel': return order.orderStatus === OrderStatus.CANCELLED;
    case 'Hold': return order.orderStatus === OrderStatus.DISPUTED;
    case 'Schedule': return isScheduledAhead(order);
    case 'Revision': return hasOpenRevision(order);
    default: return false;
  }
}

/** "#J2BLMN | Alif Khan" - the order id and the customer's name. */
export const providerOrderTitle = (order: Order) => `#${order.referenceCode} | ${order.customer?.user?.name || order.customer?.user?.username || 'Customer'}`;
