import { OrderStatus } from '@/types/order.types';

/*
 * The app's six order states: Pending, Active, Revision, Complete, Cancel, Hold. ACCEPTED (old orders) reads as Active
 * and DISPUTED (old orders) as Hold; neither is written any more. Revision and Hold come from the order itself (an open
 * revision, the hold flag), so the list rows and the status box show those over this.
 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
  [OrderStatus.PENDING]: { text: 'Pending', className: 'text-[#b7791f]' },
  [OrderStatus.ACCEPTED]: { text: 'Active', className: 'text-primary' },
  [OrderStatus.IN_PROGRESS]: { text: 'Active', className: 'text-primary' },
  [OrderStatus.COMPLETED]: { text: 'Complete', className: 'text-ink' },
  [OrderStatus.CANCELLED]: { text: 'Cancel', className: 'text-[#d64545]' },
  [OrderStatus.DISPUTED]: { text: 'Hold', className: 'text-[#b7791f]' },
};
