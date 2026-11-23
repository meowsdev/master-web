import { Order } from '@/types/order.types';

/**
 * "#A94K2B | @manik05 | Master" - the order id, the provider's username, then their company
 * (or their own name without a company). Until a provider accepts, only "#A94K2B".
 */
export function buildOrderTabLabel(order: Order): string {
  const { providerUsername, providerName } = order.assignee ?? { providerUsername: null, providerName: null };
  return [`#${order.referenceCode}`, providerUsername, providerName].filter(Boolean).join(' | ');
}

/** The scheduled day in Bengali, e.g. "২০ নভেম্বর ২০২৬". */
export function formatScheduleDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** "11.14 AM": the time under every chat message and card, in the viewer's time zone. */
export const formatMessageTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
