import { Order } from '@/types/order.types';

const WAITING_LABEL = 'Waiting...';

/** "#A94K2B | @hamid115 | SmartCool" — technician first, provider after; "Waiting..." until someone is assigned. */
export function buildOrderTabLabel(order: Order): string {
  const { technician, provider } = order.assignee ?? { technician: null, provider: null };
  const parts = [`#${order.referenceCode}`, technician ?? provider ?? WAITING_LABEL];
  if (technician && provider) parts.push(provider);
  if (!technician && !provider) parts.push(WAITING_LABEL);
  return parts.join(' | ');
}

/** The scheduled day in Bengali, e.g. "২০ নভেম্বর ২০২৬". */
export function formatScheduleDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
