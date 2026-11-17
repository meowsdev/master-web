'use client';

import { ReactNode } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Alert02Icon, Calendar03Icon, Store01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { Order, OrderStatus } from '@/types/order.types';
import { buildOrderTabLabel, formatScheduleDate } from './order-labels';

const STATUS_TEXT: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.ACCEPTED]: 'Accepted',
  [OrderStatus.IN_PROGRESS]: 'In progress',
  [OrderStatus.COMPLETED]: 'Completed',
};

function Line({ icon, children }: { icon: IconSvgElement; children: ReactNode }) {
  return (
    <li className="flex items-start gap-[10px] text-[14px] font-semibold text-[#202939]">
      <HugeiconsIcon icon={icon} size={18} className="mt-[2px] shrink-0" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/** "11.14 AM", the way the Figma message timestamp reads. */
const formatMessageTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

/*
 * Incoming message that appears once a provider accepts: the technician it was assigned to
 * (or the provider itself), their photo, workshop, shop and the visit time. Everything
 * shown comes from the backend's customer-safe `assignmentCard`.
 */
export function AssignmentCard({ order }: { order: Order }) {
  const card = order.assignmentCard;
  if (!card) return null;
  const detail = order.bookingDetail;
  const roleLabel = card.role === 'TECHNICIAN' ? 'টেকনিশিয়ান' : 'প্রোভাইডার';

  return (
    <article className="w-full max-w-[420px] rounded-[20px] bg-white p-[16px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#202939]">{buildOrderTabLabel(order)}</p>
          <ul className="mt-[12px] flex flex-col gap-[10px]">
            {card.name && <Line icon={UserIcon}>{roleLabel}: {card.name}</Line>}
            {card.workshopAddress && <Line icon={Alert02Icon}>ওয়ার্কশপ: {card.workshopAddress}</Line>}
            {card.shopName && <Line icon={Store01Icon}>দোকানের নাম: {card.shopName}</Line>}
            {detail && (
              <Line icon={Calendar03Icon}>
                {formatScheduleDate(detail.scheduledDate)} | {detail.timeSlot}
              </Line>
            )}
          </ul>
        </div>

        {/* Rounded square, as in the Figma card; the initial stands in when there is no photo. */}
        {card.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary hosts
          <img src={card.photoUrl} alt={card.name ?? ''} className="size-[58px] shrink-0 rounded-[16px] object-cover" />
        ) : (
          <span className="flex size-[58px] shrink-0 items-center justify-center rounded-[16px] bg-[#d7fdd2] text-[22px] font-semibold text-[#205737]">
            {(card.name ?? '?').charAt(0)}
          </span>
        )}
      </div>

      <footer className="mt-[14px] flex items-end justify-between">
        <time className="text-[12px] font-medium text-[#697586]">{formatMessageTime(order.updatedAt)}</time>
        <span className="rounded-[10px] bg-white px-[14px] py-[8px] text-[14px] font-semibold text-[#9aa4b2] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          {STATUS_TEXT[order.orderStatus] ?? order.orderStatus}
        </span>
      </footer>
    </article>
  );
}
