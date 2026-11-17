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
