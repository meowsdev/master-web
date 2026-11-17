'use client';

import { useEffect, useState } from 'react';
import { Alert02Icon, Calendar03Icon, Home01Icon, Note01Icon, ScaleIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { Order, OrderStatus, PaymentStatus } from '@/types/order.types';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { buildOrderTabLabel, formatScheduleDate } from './order-labels';
import { OrderDetailLine } from './OrderDetailLine';

interface OrderDetailCardProps {
  order: Order;
  onPayNow: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}

/**
 * "mm.ss" since the order was placed. It ticks while the order waits and freezes at the
 * moment of acceptance (`stoppedAt`), so the customer sees how long the provider took.
 */
function useWaitingTime(since: string, stoppedAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  const isTicking = !stoppedAt;
  useEffect(() => {
    if (!isTicking) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isTicking]);
  const endTime = stoppedAt ? new Date(stoppedAt).getTime() : now;
  const seconds = Math.max(0, Math.floor((endTime - new Date(since).getTime()) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}.${String(seconds % 60).padStart(2, '0')}`;
}

/* The mint order card of the Figma chat: reference, what was ordered, where and when, and what is due. */
export function OrderDetailCard({ order, onPayNow, onCancel, isCancelling }: OrderDetailCardProps) {
  const detail = order.bookingDetail;
  const isWaiting = order.orderStatus === OrderStatus.PENDING;
  const isCancelled = order.orderStatus === OrderStatus.CANCELLED;
  // Payment state is the backend's call (paymentStatus / dueAmount), never guessed on screen.
  const isPaid = order.paymentStatus === PaymentStatus.PAID || Number(order.dueAmount) <= 0;
  // An advance needs a provider on the job and an order that is not settled yet (the backend enforces the same).
  const canPayAdvance = order.orderStatus === OrderStatus.ACCEPTED || order.orderStatus === OrderStatus.IN_PROGRESS;
  const statusLabel = order.orderStatus === OrderStatus.COMPLETED ? 'Completed' : 'Accepted';
  const waitingTime = useWaitingTime(order.createdAt, isWaiting ? null : order.acceptedAt ?? order.updatedAt);
  const [problemLine, ...surchargeLines] = detail?.priceBreakdown ?? [];

  return (
    <article className="ml-auto w-full max-w-[420px] rounded-[16px] bg-[#ade2cf] p-[14px] text-[#202939] shadow-sm">
      <header className="flex items-center justify-between gap-[8px]">
        <span className="min-w-0 truncate text-[12px] font-medium">{buildOrderTabLabel(order)}</span>
        <div className="flex shrink-0 items-center gap-[6px]">
          {isPaid ? (
            <span className="rounded-[8px] bg-white px-[8px] py-[4px] text-[12px] font-semibold text-[#1daa61]">Paid</span>
          ) : (
            <span className="rounded-[8px] bg-white px-[8px] py-[4px] text-[12px] font-semibold">
              {formatTaka(order.dueAmount)} <span className="rounded-full border border-[#202939]/40 px-[5px] text-[10px]">Due</span>
            </span>
          )}
          {/* Nothing left to pay (or the order is cancelled): the button stays but cannot be pressed. */}
          <button
            type="button"
            onClick={onPayNow}
            disabled={isPaid || isCancelled || !canPayAdvance}
            title={!canPayAdvance && !isPaid && !isCancelled ? 'You can pay once a provider accepts your order' : undefined}
            className="cursor-pointer rounded-[8px] bg-[#202939] px-[12px] py-[6px] text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#202939]/30"
          >
            {isPaid ? 'Paid' : 'Pay Now'}
          </button>
        </div>
      </header>

      <ul className="mt-[14px] flex flex-col gap-[10px]">
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
      </ul>

      {!isCancelled && (
        <footer className="mt-[14px] flex items-center justify-end gap-[12px]">
          <span className="text-[13px] font-medium">
            {isWaiting ? 'Waiting time' : 'Accepted in'}: {waitingTime}
          </span>
          {/* Once a provider has accepted, cancelling is no longer possible: the button stays but is disabled. */}
          <button
            type="button"
            onClick={onCancel}
            disabled={!isWaiting || isCancelling}
            className="cursor-pointer rounded-[10px] bg-white px-[14px] py-[8px] text-[14px] font-semibold disabled:cursor-not-allowed disabled:text-[#9aa4b2] disabled:opacity-80"
          >
            {isWaiting ? 'Cancel Order' : statusLabel}
          </button>
        </footer>
      )}
    </article>
  );
}
