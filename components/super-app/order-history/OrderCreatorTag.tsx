import { Order, OrderCreator } from '@/types/order.types';

const CREATOR_LABEL: Record<OrderCreator, string> = { CUSTOMER: 'Customer', PROVIDER: 'Provider', ADMIN: 'Admin' };

/** "Provider: Rahim" or just "Customer". Old orders carry no creator and count as the customer's. */
export function orderCreatorLabel(order: Pick<Order, 'createdByRole' | 'createdBy'>, withName = true): string {
  const label = CREATOR_LABEL[order.createdByRole ?? 'CUSTOMER'];
  const name = order.createdBy?.name?.trim();
  return withName && name ? `${label}: ${name}` : label;
}

/* Who created the order, as a small chip: every role sees it on the order list and in the order details. */
export function OrderCreatorTag({ order, withName = false }: { order: Pick<Order, 'createdByRole' | 'createdBy'>; withName?: boolean }) {
  return (
    <span title={`Created by ${orderCreatorLabel(order)}`} className="inline-flex max-w-full shrink-0 items-center truncate rounded-full bg-secondary px-[8px] py-[1px] text-[11px] font-semibold text-ink">
      {orderCreatorLabel(order, withName)}
    </span>
  );
}
