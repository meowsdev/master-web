import { useMemo } from 'react';
import { ExtraChargeRequest } from '@/types/extra-charge.types';
import { Message } from '@/types/chat.types';
import { Order } from '@/types/order.types';

export type TimelineEntry =
  | { key: string; at: number; kind: 'order' }
  | { key: string; at: number; kind: 'assignment' }
  | { key: string; at: number; kind: 'extraCharge'; request: ExtraChargeRequest }
  | { key: string; at: number; kind: 'completion' }
  | { key: string; at: number; kind: 'review' }
  | { key: string; at: number; kind: 'message'; message: Message };

const toTime = (isoDate?: string | null) => (isoDate ? new Date(isoDate).getTime() : 0);

/**
 * Everything in an order tab (the order card, who accepted, extra charges, the payment card,
 * the review and the typed messages) on ONE timeline, oldest first, newest at the bottom,
 * the way WhatsApp and Fiverr read. Each item sits at the moment it happened.
 */
export function useOrderTimeline(order: Order, messages: Message[], extraCharges: ExtraChargeRequest[]): TimelineEntry[] {
  return useMemo(() => {
    const entries: TimelineEntry[] = [{ key: 'order', at: toTime(order.createdAt), kind: 'order' }];

    if (order.assignmentCard) {
      entries.push({ key: 'assignment', at: toTime(order.acceptedAt ?? order.updatedAt), kind: 'assignment' });
    }
    for (const request of extraCharges) {
      entries.push({ key: `extra-${request.id}`, at: toTime(request.createdAt), kind: 'extraCharge', request });
    }
    if (order.paymentAndTip) {
      entries.push({ key: 'completion', at: toTime(order.paymentAndTip.createdAt), kind: 'completion' });
    }
    if (order.isReviewPending || order.providerReview) {
      // The review is the last thing asked of the customer, so it follows completion; once sent it stays as history.
      entries.push({ key: 'review', at: toTime(order.completedAt ?? order.updatedAt) + 1, kind: 'review' });
    }
    for (const message of messages) {
      entries.push({ key: `message-${message.id}`, at: toTime(message.createdAt), kind: 'message', message });
    }

    return entries.sort((first, second) => first.at - second.at);
  }, [order, messages, extraCharges]);
}
