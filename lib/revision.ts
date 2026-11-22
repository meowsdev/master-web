import { Order, OrderStatus, ServiceRevision } from '@/types/order.types';

/*
 * The 7-day service warranty, as the screens show it. The backend decides (service-revision/revision-window.ts);
 * these helpers only choose what to show.
 */

export const REVISION_WINDOW_DAYS = 7;

/** The revision the provider is still working on, if any. */
export const openRevision = (order: Order): ServiceRevision | undefined =>
  order.revisions?.find((revision) => revision.revisionStatus === 'REQUESTED' || revision.revisionStatus === 'ACCEPTED');

/** Whole days left to ask for a revision (rounded up), or null when the window is closed or never opened. */
export function revisionDaysLeft(order: Order, now = Date.now()): number | null {
  if (order.orderStatus !== OrderStatus.COMPLETED || !order.revisionDeadline || openRevision(order)) return null;
  const msLeft = new Date(order.revisionDeadline).getTime() - now;
  return msLeft > 0 ? Math.ceil(msLeft / (24 * 60 * 60 * 1000)) : null;
}
