'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useServiceAreaLabel } from '@/hooks/useServiceAreaLabel';
import { Order, OrderStatus, OrderUserProfile } from '@/types/order.types';
import { Fact, Section } from '../admin/member/MemberParts';
import { ORDER_STATUS_LABEL } from '../order-history/order-status';
import { formatScheduleDate } from './order-labels';

export type OrderDetailsViewer = 'CUSTOMER' | 'PROVIDER' | 'TECHNICIAN' | 'ADMIN';

const formatDateTime = (isoDate?: string | null) =>
  isoDate ? new Date(isoDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const personName = (person?: OrderUserProfile | null) =>
  person ? person.name || (person.username ? `@${person.username}` : person.maskedPhone) || '—' : '—';

const PAYMENT_STATUS_TEXT: Record<string, string> = { UNPAID: 'Unpaid', PARTIAL: 'Partly paid', PAID: 'Paid', REFUNDED: 'Refunded' };

/*
 * The right-hand "Order details" panel, the same for every order whatever its state (waiting, running,
 * completed, cancelled): who the customer is, which provider and technician are on it, what was ordered,
 * where and when, the money, and the reviews. Phone numbers are shown to staff only.
 */
export function OrderDetailsPanel({ order, viewer, onClose }: { order: Order; viewer: OrderDetailsViewer; onClose: () => void }) {
  const detail = order.bookingDetail;
  const status = ORDER_STATUS_LABEL[order.orderStatus];
  const areaLabel = useServiceAreaLabel(detail?.districtId, detail?.upazilaId);
  const isStaff = viewer === 'ADMIN';
  const customer = order.customer?.user;
  const provider = order.provider;
  const technician = order.technician?.user;
  const providerRating = Number(provider?.rating);
  const isCancelled = order.orderStatus === OrderStatus.CANCELLED;
  const review = order.providerReview;
  const customerRating = order.customerRating;

  return (
    <SidePanelShell title="Order details" onClose={onClose}>
      <div className="flex items-center justify-between gap-[12px] pb-[16px]">
        <div className="flex min-w-0 flex-col gap-[4px]">
          <p className="truncate text-[18px] font-semibold tracking-[-0.36px] text-[#202939]">#{order.referenceCode}</p>
          <p className="truncate text-[13px] font-medium text-[#697586]">{order.service?.category?.name ?? order.service?.name ?? 'Service'}</p>
        </div>
        <span className={`shrink-0 rounded-[8px] bg-[#f7f5f3] px-[10px] py-[4px] text-[13px] font-semibold ${status.className}`}>{status.text}</span>
      </div>

      <Section title="Customer">
        <Fact label="Name">{personName(customer)}</Fact>
        {customer?.username && customer.name && <Fact label="Username">@{customer.username}</Fact>}
        {isStaff && customer?.mobileNumber && <Fact label="Phone">{customer.mobileNumber}</Fact>}
      </Section>

      <Section title="Provider">
        {/* Until a provider accepts, the provider on the order is only a stand-in, so nobody is named. */}
        {order.isAccepted === false ? (
          <p className="text-[14px] font-medium text-[#b7791f]">{isCancelled ? 'No provider took this order.' : 'Waiting for a provider to accept.'}</p>
        ) : (
          <>
            <Fact label="Name">{provider?.companyName || personName(provider?.user)}</Fact>
            {provider?.user?.username && <Fact label="Username">@{provider.user.username}</Fact>}
            <Fact label="Rating">{providerRating > 0 ? `★ ${providerRating.toFixed(1)}` : 'New'}</Fact>
            {isStaff && provider?.user?.mobileNumber && <Fact label="Phone">{provider.user.mobileNumber}</Fact>}
          </>
        )}
      </Section>

      {order.isAccepted !== false && (
        <Section title="Technician">
          {technician ? (
            <>
              <Fact label="Name">{personName(technician)}</Fact>
              {isStaff && technician.mobileNumber && <Fact label="Phone">{technician.mobileNumber}</Fact>}
            </>
          ) : (
            <p className="text-[14px] font-medium text-[#697586]">The provider is doing the work; no technician assigned.</p>
          )}
        </Section>
      )}

      <Section title="Service">
        <Fact label="Service">{order.service?.category?.name ?? order.service?.name ?? '—'}</Fact>
        {(detail?.priceBreakdown ?? []).map((line) => (
          <Fact key={line.label} label={line.count > 1 ? `${line.label} × ${line.count}` : line.label}>
            {formatTaka(line.amount)}
          </Fact>
        ))}
        {detail?.description && <p className="mt-[8px] text-[14px] font-medium leading-relaxed text-[#202939]">{detail.description}</p>}
      </Section>

      {detail && (
        <Section title="Where and when">
          <Fact label="Address">{areaLabel ? `${areaLabel} · ${detail.addressDetail}` : detail.addressDetail}</Fact>
          <Fact label="Date">{formatScheduleDate(detail.scheduledDate)}</Fact>
          <Fact label="Time">{detail.timeSlot}</Fact>
        </Section>
      )}

      <Section title="Payment">
        <Fact label="Total">{formatTaka(order.totalPrice)}</Fact>
        {Number(order.advancePaid) > 0 && <Fact label="Paid in advance">{formatTaka(order.advancePaid)}</Fact>}
        <Fact label="Due">{formatTaka(order.dueAmount)}</Fact>
        <Fact label="Status">{PAYMENT_STATUS_TEXT[order.paymentStatus] ?? order.paymentStatus}</Fact>
        {order.paymentAndTip && <Fact label="Paid by">{order.paymentAndTip.paymentMode}</Fact>}
        {order.paymentAndTip && Number(order.paymentAndTip.tipAmount) > 0 && <Fact label="Tip">{formatTaka(order.paymentAndTip.tipAmount)}</Fact>}
      </Section>

      <Section title="Timeline">
        <Fact label="Placed">{formatDateTime(order.createdAt)}</Fact>
        {order.acceptedAt && <Fact label="Accepted">{formatDateTime(order.acceptedAt)}</Fact>}
        {order.completedAt && <Fact label="Completed">{formatDateTime(order.completedAt)}</Fact>}
        {isCancelled && <Fact label="Cancelled">{formatDateTime(order.updatedAt)}</Fact>}
      </Section>

      {(review || customerRating) && (
        <Section title="Reviews">
          {review && (
            <div className="rounded-[10px] bg-[#f7f5f3] p-[10px]">
              <p className="text-[12px] font-medium text-[#697586]">Customer → provider</p>
              <p className="text-[14px] font-semibold text-[#f5a524]">
                {'★'.repeat(review.customerRating)}
                <span className="text-[#cecece]">{'★'.repeat(Math.max(0, 5 - review.customerRating))}</span>
              </p>
              {review.reviewComment && <p className="mt-[2px] text-[14px] font-medium text-[#202939]">{review.reviewComment}</p>}
            </div>
          )}
          {customerRating && (
            <div className="mt-[8px] rounded-[10px] bg-[#f7f5f3] p-[10px]">
              <p className="text-[12px] font-medium text-[#697586]">Provider → customer</p>
              <p className="text-[14px] font-semibold text-[#f5a524]">
                {'★'.repeat(customerRating.rating)}
                <span className="text-[#cecece]">{'★'.repeat(Math.max(0, 5 - customerRating.rating))}</span>
              </p>
              {customerRating.comment && <p className="mt-[2px] text-[14px] font-medium text-[#202939]">{customerRating.comment}</p>}
            </div>
          )}
        </Section>
      )}
    </SidePanelShell>
  );
}
