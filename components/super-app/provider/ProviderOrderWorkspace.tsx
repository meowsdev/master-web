'use client';

import { useEffect, useRef } from 'react';
import { useExtraCharges } from '@/hooks/useExtraCharges';
import { useOrderChat } from '@/hooks/useOrderChat';
import { useOrderTimeline } from '@/hooks/useOrderTimeline';
import { Order, OrderStatus } from '@/types/order.types';
import { ConversationHeader } from '../ConversationHeader';
import { AdvancePaymentCard } from '../order-chat/AdvancePaymentCard';
import { ExtraChargeCard } from '../order-chat/ExtraChargeCard';
import { MessageBubble } from '../order-chat/MessageBubble';
import { ReviewCard } from '../order-chat/ReviewCard';
import { CustomerAvatar } from './CustomerAvatar';
import { CustomerRatingCard } from './CustomerRatingCard';
import { ProviderOrderComposer, workCompleteState } from './ProviderOrderComposer';
import { QuoteCard } from '../order-chat/QuoteCard';
import { ProviderOrderPanels } from './ProviderOrderPanels';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { ProviderPendingActions } from './ProviderPendingActions';
import { ProviderOrderInfoCard } from './ProviderOrderInfoCard';
import { OrderHoldBanner } from '../order-chat/OrderHoldBar';
import { OrderStatusBox } from '../order-chat/OrderStatusBox';
import { OrderStatusHistory } from '../order-chat/OrderStatusHistory';
import { OrderStatusRequestBar } from '../order-chat/OrderStatusRequestBar';
import { ProviderPaymentNote } from './ProviderPaymentNote';
import { providerOrderTitle } from './provider-order-filters';
import { RevisionCard } from '../order-chat/RevisionCard';
import { ExpenseClaimsCard } from '../order-chat/ExpenseClaimsCard';
import { useExpenseClaims } from '@/hooks/useExpenseClaims';

interface ProviderOrderWorkspaceProps {
  order: Order;
  userId: string;
  onBack: () => void;
  onUpdateStatus: (status: OrderStatus) => Promise<void>;
  isUpdatingStatus: boolean;
  /** Kept for callers; the voice / video items left with the ⋮ menu (the owner chose the status box instead). */
  onStartCall?: (type: 'voice' | 'video') => void;
  /** A technician works the order too, but cannot assign workers or rate the customer. */
  viewer?: 'PROVIDER' | 'TECHNICIAN';
}

/*
 * One order for the provider: its full info, the extra charges and payment so far, and the live chat
 * with the customer, all on one timeline (oldest first). Accept / Decline sit on the order card; assign, extra charge and finish are in the + menu of the message box.
 */
export function ProviderOrderWorkspace({ order, userId, onBack, onUpdateStatus, isUpdatingStatus, viewer = 'PROVIDER' }: ProviderOrderWorkspaceProps) {
  const isProviderViewer = viewer === 'PROVIDER';
  const { messages, draft, setDraft, submit, canSend } = useOrderChat(order, userId, 'PROVIDER');
  const { requests: extraCharges } = useExtraCharges(order.id, userId);
  const timeline = useOrderTimeline(order, messages, extraCharges);
  const openPanel = useOrderPanelStore((state) => state.open);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Shares the cache with the costs card below, so the + menu knows whether costs can still be sent.
  const { canSubmit: canSendCosts } = useExpenseClaims(order.id, userId);
  // The status box: the order's provider and technician hold / resume, cancel, and complete (through Work Complete).
  const workComplete = workCompleteState(order);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [timeline.length]);

  return (
    <>
      <ConversationHeader
        picture={<CustomerAvatar order={order} sizeClass="size-[36px]" />}
        title={providerOrderTitle(order)}
        ratingLabel="New"
        backLabel="Back to orders"
        onBack={onBack}
        onOpenTitle={() => openPanel(order.id, 'orderDetails')}
        menuItems={[]}
        trailing={
          <OrderStatusBox
            order={order}
            isWorker
            onComplete={() => openPanel(order.id, 'complete')}
            canComplete={workComplete.isEnabled}
            completeLabel={workComplete.label}
          />
        }
      />
      <OrderHoldBanner order={order} />
      {/* Their own Hold / Cancel request, waiting for an admin. */}
      <OrderStatusRequestBar order={order} />

      <div className="flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto bg-surface p-[16px]">
        {timeline.map((entry) => {
          switch (entry.kind) {
            case 'order':
              return <ProviderOrderInfoCard key={entry.key} order={order} actions={<ProviderPendingActions order={order} userId={userId} onUpdateStatus={onUpdateStatus} isUpdatingStatus={isUpdatingStatus} />} />;
            case 'extraCharge':
              return <ExtraChargeCard key={entry.key} request={entry.request} viewer="PROVIDER" isAnswering={false} onApprove={() => {}} onReject={() => {}} />;
            case 'advance':
              return <AdvancePaymentCard key={entry.key} order={order} index={entry.index} viewer="PROVIDER" />;
            case 'completion':
              return <ProviderPaymentNote key={entry.key} order={order} />;
            case 'review':
              return order.providerReview ? <ReviewCard key={entry.key} order={order} userId={userId} /> : null;
            case 'message':
              return <MessageBubble key={entry.key} message={entry.message} isMine={entry.message.senderId === userId} />;
            default:
              return null;
          }
        })}
        {/* Completed: the provider rates the customer. */}
        {/* Provider or technician: whoever rates first, once per order. */}
        <CustomerRatingCard order={order} userId={userId} />
        {/* 7-day warranty: what the customer sent back. Finished with "Revision Done" in the + menu. */}
        <QuoteCard order={order} userId={userId} viewer="PROVIDER" />
        <RevisionCard order={order} />
        {/* After the job: parts / costs for the admin to review (commission is then taken on total - costs). */}
        <ExpenseClaimsCard order={order} userId={userId} viewer={viewer} />
        <OrderStatusHistory orderId={order.id} showRequests />
        <div ref={bottomRef} />
      </div>

      <ProviderOrderComposer order={order} draft={draft} onDraftChange={setDraft} onSubmit={submit} canSend={canSend} onChooseAction={(kind) => openPanel(order.id, kind)} canAssignWorker={isProviderViewer} canSendCosts={canSendCosts} />
      <ProviderOrderPanels order={order} userId={userId} viewer={viewer} />
    </>
  );
}
