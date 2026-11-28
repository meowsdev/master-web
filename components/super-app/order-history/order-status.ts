import { OrderStatus } from '@/types/order.types';

export const ORDER_STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
  [OrderStatus.PENDING]: { text: 'Pending', className: 'text-[#b7791f]' },
  [OrderStatus.ACCEPTED]: { text: 'Accepted', className: 'text-primary' },
  [OrderStatus.IN_PROGRESS]: { text: 'In progress', className: 'text-primary' },
  [OrderStatus.COMPLETED]: { text: 'Complete', className: 'text-ink' },
  [OrderStatus.CANCELLED]: { text: 'Cancel', className: 'text-[#d64545]' },
  [OrderStatus.DISPUTED]: { text: 'Reject', className: 'text-[#d64545]' },
};
