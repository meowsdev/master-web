'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Attachment01Icon, CallIcon, CheckmarkCircle02Icon, Mic01Icon, PlusSignIcon, SentIcon, UserAdd01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { Order, OrderStatus } from '@/types/order.types';
import { ComingSoonDialog } from './ComingSoonDialog';
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
}

interface PlusAction {
  id: OrderPanelKind;
  label: string;
  icon: IconSvgElement;
  isEnabled: boolean;
}

/*
 * The provider's message box: attach, type, mic, call and a plus menu with the job actions.
 * Attach, mic and call are not built yet and say so. The menu only asks; the backend decides what
 * is allowed (status flow, who may act, price limits). Entries that do not fit the order's status are greyed.
 */
export function ProviderOrderComposer({ order, draft, onDraftChange, onSubmit, canSend, onChooseAction, canAssignWorker = true }: ProviderOrderComposerProps) {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
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
  const actions: PlusAction[] = [
    ...(canAssignWorker ? [{ id: 'assign' as const, label: 'Assign Worker', icon: UserAdd01Icon, isEnabled: isRunning }] : []),
    { id: 'extraCharge', label: 'Extra Charge', icon: Wallet01Icon, isEnabled: isInProgress && !isWaitingForOnlinePayment },
    { id: 'complete', label: isWaitingForOnlinePayment ? 'Waiting for payment...' : 'Work Complete', icon: CheckmarkCircle02Icon, isEnabled: isInProgress && !isWaitingForOnlinePayment },
  ];

  const comingSoonButton = 'flex size-[32px] shrink-0 cursor-pointer items-center justify-center text-[#202939]';

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="shrink-0 bg-[#f7f5f3] px-[16px] pb-[16px] pt-[8px]"
    >
      <div className="relative flex h-[48px] items-center gap-[8px] rounded-[24px] bg-white px-[12px] shadow-sm">
        <button type="button" onClick={() => setIsComingSoonOpen(true)} aria-label="Attach" className={comingSoonButton}>
          <HugeiconsIcon icon={Attachment01Icon} size={20} />
        </button>

        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          maxLength={1000}
          disabled={order.isChatOpen === false}
          placeholder="Type a message"
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#697586]"
        />

        <button type="button" onClick={() => setIsComingSoonOpen(true)} aria-label="Voice message" className={comingSoonButton}>
          <HugeiconsIcon icon={Mic01Icon} size={20} />
        </button>

        {draft.trim() ? (
          <button type="submit" disabled={!canSend} aria-label="Send message" className="flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1daa61] text-white disabled:opacity-50">
            <HugeiconsIcon icon={SentIcon} size={18} />
          </button>
        ) : (
          <button type="button" onClick={() => setIsComingSoonOpen(true)} aria-label="Call" className="flex size-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1daa61] text-white">
            <HugeiconsIcon icon={CallIcon} size={18} />
          </button>
        )}

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            aria-label="Order actions"
            aria-expanded={isMenuOpen}
            className="flex size-[36px] cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[#1daa61] text-[#1daa61] hover:bg-[#d7fdd2]"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2} />
          </button>

          {isMenuOpen && (
            <div role="menu" className="absolute bottom-[44px] right-0 z-30 w-[220px] rounded-[12px] border border-[#e5e5e5] bg-white p-[6px] shadow-lg">
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
                  className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left text-[14px] font-semibold text-[#202939] hover:bg-[#f7f5f3] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <HugeiconsIcon icon={action.icon} size={18} />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isComingSoonOpen && <ComingSoonDialog onClose={() => setIsComingSoonOpen(false)} />}
    </form>
  );
}
