'use client';

import { Alert02Icon, Calendar03Icon, CreditCardIcon, Home01Icon, Note01Icon, ScaleIcon, UserIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { ReactNode } from 'react';
import { Order } from '@/types/order.types';
import { formatScheduleDate } from '../order-chat/order-labels';
import { OrderDetailLine } from '../order-chat/OrderDetailLine';
import { ORDER_STATUS_LABEL } from '../order-history/order-status';
import { providerOrderTitle } from './provider-order-filters';

interface ProviderOrderInfoCardProps {
  order: Order;
  /** What the provider can do next; lives on the card so every step happens in one place. */
  actions?: ReactNode;
}

/* Everything the provider needs to know about the job: who, what, where, when and the money. The customer's phone number is never shown; the backend does not send it either. */
export function ProviderOrderInfoCard({ order, actions }: ProviderOrderInfoCardProps) {
  const detail = order.bookingDetail;
  const customer = order.customer?.user;
  const status = ORDER_STATUS_LABEL[order.orderStatus];
  const [problemLine, ...surchargeLines] = detail?.priceBreakdown ?? [];

  return (
    <article className="w-full max-w-[460px] rounded-[16px] bg-white p-[14px] text-[#202939] shadow-sm">
      <header className="flex items-center justify-between gap-[8px]">
        <span className="min-w-0 truncate text-[12px] font-medium">{providerOrderTitle(order)}</span>
        <span className={`shrink-0 rounded-[8px] bg-[#f7f5f3] px-[8px] py-[4px] text-[12px] font-semibold ${status.className}`}>{status.text}</span>
      </header>

      <ul className="mt-[14px] flex flex-col gap-[10px]">
        <OrderDetailLine icon={UserIcon}>{customer?.name ?? 'Customer'}</OrderDetailLine>
        <OrderDetailLine icon={Wrench01Icon}>{order.service?.category?.name}</OrderDetailLine>
        {problemLine && (
          <OrderDetailLine icon={Alert02Icon}>
            {problemLine.label}
            {problemLine.count > 1 ? ` × ${problemLine.count}` : ''} ({formatTaka(problemLine.amount)})
          </OrderDetailLine>
        )}
        {detail?.description && <OrderDetailLine icon={Note01Icon}>{detail.description}</OrderDetailLine>}
        {surchargeLines.map((line) => (
          <OrderDetailLine key={line.label} icon={ScaleIcon}>
            {line.label} ({formatTaka(line.amount)})
          </OrderDetailLine>
        ))}
        {detail && <OrderDetailLine icon={Home01Icon}>{detail.addressDetail}</OrderDetailLine>}
        {detail && (
          <OrderDetailLine icon={Calendar03Icon}>
            {formatScheduleDate(detail.scheduledDate)} | {detail.timeSlot}
          </OrderDetailLine>
        )}
        <OrderDetailLine icon={CreditCardIcon}>
          Total {formatTaka(order.totalPrice)} · Due {formatTaka(order.dueAmount)} · {order.paymentStatus}
        </OrderDetailLine>
      </ul>

      {actions && <footer className="mt-[14px]">{actions}</footer>}
    </article>
  );
}
