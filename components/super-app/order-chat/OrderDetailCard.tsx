'use client';

import { ReactNode, useEffect, useState } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Alert02Icon, Calendar03Icon, Home01Icon, Note01Icon, ScaleIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { Order, OrderStatus } from '@/types/order.types';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { buildOrderTabLabel, formatScheduleDate } from './order-labels';

interface OrderDetailCardProps {
  order: Order;
  onPayNow: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}

function DetailLine({ icon, children }: { icon: IconSvgElement; children: ReactNode }) {
  return (
    <li className="flex items-start gap-[10px] text-[14px] font-medium text-[#202939]">
      <HugeiconsIcon icon={icon} size={18} className="mt-[2px] shrink-0" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** Minutes and seconds since the order was placed, ticking while it waits for acceptance. */
function useWaitingTime(since: string, isWaiting: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isWaiting) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isWaiting]);
  const seconds = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}.${String(seconds % 60).padStart(2, '0')}`;
}

/* The mint order card of the Figma chat: reference, what was ordered, where and when, and what is due. */
export function OrderDetailCard({ order, onPayNow, onCancel, isCancelling }: OrderDetailCardProps) {
  const detail = order.bookingDetail;
  const isWaiting = order.orderStatus === OrderStatus.PENDING;
  const waitingTime = useWaitingTime(order.createdAt, isWaiting);
  const [problemLine, ...surchargeLines] = detail?.priceBreakdown ?? [];

  return (
    <article className="ml-auto w-full max-w-[420px] rounded-[16px] bg-[#ade2cf] p-[14px] text-[#202939] shadow-sm">
      <header className="flex items-center justify-between gap-[8px]">
        <span className="min-w-0 truncate text-[12px] font-medium">{buildOrderTabLabel(order)}</span>
        <div className="flex shrink-0 items-center gap-[6px]">
          <span className="rounded-[8px] bg-white px-[8px] py-[4px] text-[12px] font-semibold">
            {formatTaka(order.dueAmount)} <span className="rounded-full border border-[#202939]/40 px-[5px] text-[10px]">Due</span>
          </span>
          <button type="button" onClick={onPayNow} className="cursor-pointer rounded-[8px] bg-[#202939] px-[12px] py-[6px] text-[13px] font-semibold text-white">
            Pay Now
          </button>
        </div>
      </header>

      <ul className="mt-[14px] flex flex-col gap-[10px]">
        <DetailLine icon={Wrench01Icon}>{order.service?.category?.name}</DetailLine>
        {problemLine && (
          <DetailLine icon={Alert02Icon}>
            {problemLine.label}
            {problemLine.count > 1 ? ` × ${problemLine.count}` : ''} ({formatTaka(problemLine.amount)})
          </DetailLine>
        )}
        {detail?.description && <DetailLine icon={Note01Icon}>{detail.description}</DetailLine>}
        {surchargeLines.map((line) => (
          <DetailLine key={line.label} icon={ScaleIcon}>
            {line.label} ({formatTaka(line.amount)})
          </DetailLine>
        ))}
        {detail && <DetailLine icon={Home01Icon}>{detail.addressDetail}</DetailLine>}
        {detail && (
          <DetailLine icon={Calendar03Icon}>
            {formatScheduleDate(detail.scheduledDate)} | {detail.timeSlot}
          </DetailLine>
        )}
      </ul>

      <footer className="mt-[14px] flex items-center justify-end gap-[12px]">
        {isWaiting && (
          <>
            <span className="text-[13px] font-medium">Waiting time: {waitingTime}</span>
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className="cursor-pointer rounded-[10px] bg-white px-[14px] py-[8px] text-[14px] font-semibold disabled:opacity-60"
            >
              Cancel Order
            </button>
          </>
        )}
      </footer>
    </article>
  );
}
