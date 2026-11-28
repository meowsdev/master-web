'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Invoice01Icon, PlusSignIcon, UserAdd01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
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
}

/*
 * Work Complete (Revision Done in a revision): only while the job is in progress, priced, and not waiting for an
 * online payment. It now lives in the order's status box; its panel takes the payment as before.
 */
export function workCompleteState(order: Order): { label: string; isEnabled: boolean } {
  const isWaitingForOnlinePayment = order.paymentAndTip?.paymentMode === 'ONLINE' && order.orderStatus !== OrderStatus.COMPLETED;
  const isInRevision = Boolean(openRevision(order));
  return {
    label: isWaitingForOnlinePayment ? 'Waiting for payment...' : isInRevision ? 'Revision Done' : 'Work Complete',
    isEnabled: order.orderStatus === OrderStatus.IN_PROGRESS && !isWaitingForOnlinePayment && !order.isPricePending,
  };
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
export function ProviderOrderComposer({ order, draft, onDraftChange, onSubmit, canSend, onChooseAction, canAssignWorker = true, canSendCosts = false }: ProviderOrderComposerProps) {
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
            </div>
          )}
        </div>
      }
    />
  );
}
