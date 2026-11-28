import { Order } from '@/types/order.types';

export const hasOpenRevision = (order: Order) =>
  Boolean(order.revisions?.some((revision) => revision.revisionStatus === 'REQUESTED' || revision.revisionStatus === 'ACCEPTED'));

/** "#J2BLMN | Alif Khan" - the order id and the customer's name. */
export const providerOrderTitle = (order: Order) => `#${order.referenceCode} | ${order.customer?.user?.name || order.customer?.user?.username || 'Customer'}`;
