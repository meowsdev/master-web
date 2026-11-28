'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Invoice01Icon, PauseCircleIcon, PlayCircleIcon, PlusSignIcon, UserAdd01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { Order, OrderStatus } from '@/types/order.types';
import { openRevision } from '@/lib/revision';
import { OrderChatComposer } from '../order-chat/OrderChatComposer';
import { OrderPanelKind } from '@/store/useOrderPanelStore';

interface ProviderOrderComposerProps {
  order: Order;
  draft: string;
  onDraftChange: (text: string) => void;
  onSubmit: () => void;
  canSend: boolean;
  onChooseAction: (action: OrderPanelKind) => void;
  /** Only the provider picks which technician works an order; a technician does not see "Assign Worker". */
  canAssignWorker?: boolean;
  /** Costs can be sent: the job is complete and no claim is waiting or approved. */
  canSendCosts?: boolean;
  /** "Hold order" / "Resume order" (useOrderHold); missing when the order cannot be held now. */
  holdAction?: { label: string; onSelect: () => void } | null;
}

interface PlusAction {
  id: OrderPanelKind;
  label: string;
  icon: IconSvgElement;
  isEnabled: boolean;
}

/*
 * The provider's message box: the shared box of every role (attach, type, voice, call / send) plus the + menu with
 * the job actions. The menu only asks; the backend decides what
 * is allowed (status flow, who may act, price limits). Entries that do not fit the order's status are greyed.
 */
export function ProviderOrderComposer({ order, draft, onDraftChange, onSubmit, canSend, onChooseAction, canAssignWorker = true, canSendCosts = false, holdAction = null }: ProviderOrderComposerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isMenuOpen]);

  const isRunning = order.orderStatus === OrderStatus.ACCEPTED || order.orderStatus === OrderStatus.IN_PROGRESS;
  const isInProgress = order.orderStatus === OrderStatus.IN_PROGRESS;
  const isWaitingForOnlinePayment = order.paymentAndTip?.paymentMode === 'ONLINE' && order.orderStatus !== OrderStatus.COMPLETED;
  // In revision: the job was already paid, so "Work Complete" becomes "Revision Done". The warranty covers the
  // service only, so parts or a bigger problem found during a revision can still be billed as an Extra Charge.
  const isInRevision = Boolean(openRevision(order));
  // A customer's custom order has no price yet: the provider sends one after the visit, and the job cannot be
  // completed until the customer accepts it.
  const isPricePending = Boolean(order.isPricePending);
  const actions: PlusAction[] = [
    ...(isPricePending ? [{ id: 'quote' as const, label: 'দাম পাঠান', icon: Invoice01Icon, isEnabled: isRunning }] : []),
    ...(canAssignWorker ? [{ id: 'assign' as const, label: 'Assign Worker', icon: UserAdd01Icon, isEnabled: isRunning }] : []),
    { id: 'extraCharge', label: 'Extra Charge', icon: Wallet01Icon, isEnabled: isInProgress && !isWaitingForOnlinePayment },
    { id: 'complete', label: isWaitingForOnlinePayment ? 'Waiting for payment...' : isInRevision ? 'Revision Done' : 'Work Complete', icon: CheckmarkCircle02Icon, isEnabled: isInProgress && !isWaitingForOnlinePayment && !isPricePending },
    // After the job: parts bought and other costs, for the admin to review (the backend refuses a second claim).
    // Off while a revision is open: parts found then are billed to the customer as an Extra Charge.
    { id: 'expenseClaim', label: 'পার্টস / খরচ', icon: Invoice01Icon, isEnabled: Boolean(order.completedAt) && canSendCosts && !isInRevision },
  ];

  return (
    <OrderChatComposer
      draft={draft}
      onDraftChange={onDraftChange}
      onSubmit={onSubmit}
      canSend={canSend}
      isDisabled={order.isChatOpen === false}
      disabledHint={order.orderStatus === OrderStatus.PENDING ? 'অর্ডার accept করলে চ্যাট চালু হবে' : undefined}
      actions={
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            aria-label="Order actions"
            aria-expanded={isMenuOpen}
            className="btn-raised flex size-[40px] cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />
          </button>

          {isMenuOpen && (
            <div role="menu" className="absolute bottom-[48px] right-0 z-30 w-[220px] rounded-[12px] border border-line bg-white p-[6px] shadow-lg">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  role="menuitem"
                  disabled={!action.isEnabled}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onChooseAction(action.id);
                  }}
                  className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left text-[14px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <HugeiconsIcon icon={action.icon} size={18} />
                  {action.label}
                </button>
              ))}
              {/* Pause a running job (parts late, customer away) with a reason, or carry on with it. */}
              {holdAction && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    holdAction.onSelect();
                  }}
                  className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left text-[14px] font-semibold text-ink hover:bg-surface"
                >
                  <HugeiconsIcon icon={order.isOnHold ? PlayCircleIcon : PauseCircleIcon} size={18} />
                  {holdAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}
