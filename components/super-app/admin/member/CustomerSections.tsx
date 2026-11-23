import { formatTaka } from '@/components/modals/place-order/format-taka';
import { OrderStatus } from '@/types/order.types';
import { MemberDetails } from '@/types/admin-member.types';
import { ORDER_STATUS_LABEL } from '../../order-history/order-status';
import { Fact, OrderCounts, ReviewList, Section, formatDate } from './MemberParts';

/* A customer: how much they order, what for, and each recent order. */
export function CustomerSections({ customer }: { customer: NonNullable<MemberDetails['customer']> }) {
  return (
    <>
      <Section title="Orders">
        <Fact label="Total orders">{customer.orderCount}</Fact>
        <Fact label="Spent on completed orders">{formatTaka(customer.totalSpent)}</Fact>
        <Fact label="Rating">{customer.rating > 0 ? `★ ${customer.rating.toFixed(1)}` : 'New'}</Fact>
        <div className="mt-[6px]">
          <OrderCounts byStatus={customer.ordersByStatus} />
        </div>
      </Section>

      <Section title={`Ratings from providers · ${customer.ratings.length}`}>
        <ReviewList reviews={customer.ratings} />
      </Section>

      <Section title="Services they use">
        {customer.services.length === 0 && <p className="text-[14px] font-medium text-muted">Nothing ordered yet.</p>}
        <p className="flex flex-wrap gap-[6px]">
          {customer.services.map((service) => (
            <span key={service.name} className="rounded-full bg-surface px-[10px] py-[3px] text-[12px] font-semibold text-ink">
              {service.name} × {service.count}
            </span>
          ))}
        </p>
      </Section>

      <Section title="Recent orders">
        <ul className="flex flex-col gap-[8px]">
          {customer.recentOrders.map((order) => {
            const status = ORDER_STATUS_LABEL[order.orderStatus as OrderStatus];
            return (
              <li key={order.id} className="rounded-[10px] bg-surface p-[10px]">
                <div className="flex items-center justify-between gap-[8px]">
                  <p className="truncate text-[14px] font-semibold text-ink">#{order.referenceCode} · {order.serviceName}</p>
                  <span className={`shrink-0 text-[12px] font-semibold ${status?.className ?? ''}`}>{status?.text ?? order.orderStatus}</span>
                </div>
                <p className="mt-[2px] text-[12px] font-medium text-muted">
                  {formatDate(order.createdAt)} · {formatTaka(order.totalPrice)}
                  {order.providerName && ` · ${order.providerName}`}
                </p>
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
