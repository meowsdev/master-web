'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus, PaymentStatus } from '@/types/order.types';
import { isHeld } from '../order-list-filters';
import { hasOpenRevision } from '../provider/provider-order-filters';

/*
 * The six order states, as the status box and its history call them, with their dot colours. ACCEPTED (old orders)
 * reads as Active and DISPUTED (old orders) as Hold; neither is written any more.
 */
export const ORDER_STATUS_BOX_LABEL: Record<OrderStatus | 'HOLD' | 'REVISION', { text: string; dot: string }> = {
  [OrderStatus.PENDING]: { text: 'Pending', dot: 'bg-[#b7791f]' },
  [OrderStatus.ACCEPTED]: { text: 'Active', dot: 'bg-primary' },
  [OrderStatus.IN_PROGRESS]: { text: 'Active', dot: 'bg-primary' },
  [OrderStatus.COMPLETED]: { text: 'Complete', dot: 'bg-ink' },
  [OrderStatus.CANCELLED]: { text: 'Cancel', dot: 'bg-[#d64545]' },
  [OrderStatus.DISPUTED]: { text: 'Hold', dot: 'bg-[#b7791f]' },
  HOLD: { text: 'Hold', dot: 'bg-[#b7791f]' },
  REVISION: { text: 'Revision', dot: 'bg-[#b7791f]' },
};

/*
 * What an admin can set from the box: Pending, Active, Complete, Cancel (Hold / Resume are their own entries).
 * Revision is not set here: it opens from the 7-day warranty (Send for revision), as before.
 */
const SETTABLE_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED, OrderStatus.CANCELLED];
/** Old ACCEPTED orders are Active: the same entry. */
const sameState = (first: OrderStatus, second: OrderStatus) =>
  first === second || ([first, second].every((status) => status === OrderStatus.ACCEPTED || status === OrderStatus.IN_PROGRESS));

/** Every role's order list and this order's history; each refreshes after a change. */
const KEYS_TO_REFRESH = ['provider-assigned-orders', 'admin-orders', 'my-orders-drawer'];

interface StatusOption {
  key: string;
  label: string;
  /** Dot colour of what it leads to. */
  dot: string;
  /** A new status, or hold / resume, or the Work Complete panel (it takes the payment). */
  change: { status: OrderStatus } | { onHold: boolean } | 'complete';
  isEnabled?: boolean;
  /** Shown before confirming: what this change cannot undo. */
  warning?: string;
  /** A provider's / technician's hold or cancel: it is sent to an admin, nothing changes until approved. */
  needsApproval?: boolean;
}

interface OrderStatusBoxProps {
  order: Order;
  /** Admin (canChangeOrderStatus): any status at any time. */
  canSetAnyStatus?: boolean;
  /** The order's provider or technician: hold / resume, cancel, and complete through Work Complete. */
  isWorker?: boolean;
  /** Admins and managers (canHoldOrders): hold / resume. */
  canHold?: boolean;
  /** Worker: open the Work Complete panel, and whether it can be done now (in progress, paid online, priced...). */
  onComplete?: () => void;
  canComplete?: boolean;
  completeLabel?: string;
}

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'Status বদলানো যায়নি';
};

/*
 * The box in an order's header (where the ⋮ menu was), the same on every role's order screen. It always shows the
 * running status, or Hold. Who may change it opens a list: an admin every status, the order's provider and technician
 * Hold / Resume, Cancel and Complete (which opens Work Complete, so the payment is taken as before), managers Hold /
 * Resume. Every change asks why, and the reason is saved in the order's status history. Everyone else only sees it.
 * A provider's or technician's Hold and Cancel are requests: they wait for an admin (one at a time), Resume is at once.
 */
export function OrderStatusBox({ order, canSetAnyStatus = false, isWorker = false, canHold = false, onComplete, canComplete = false, completeLabel = 'Complete' }: OrderStatusBoxProps) {
  const queryClient = useQueryClient();
  const boxRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [chosen, setChosen] = useState<StatusOption | null>(null);
  const [reason, setReason] = useState('');

  const isOrderHeld = isHeld(order);
  const isRunning = order.orderStatus === OrderStatus.ACCEPTED || order.orderStatus === OrderStatus.IN_PROGRESS;
  const current = ORDER_STATUS_BOX_LABEL[isOrderHeld ? 'HOLD' : hasOpenRevision(order) ? 'REVISION' : order.orderStatus];
  const isPaid = order.paymentStatus !== PaymentStatus.UNPAID;
  // The order's provider / technician ask an admin to hold or cancel; staff with the right do it themselves.
  const asksAdmin = isWorker && !canHold && !canSetAnyStatus;
  const hasWaitingRequest = Boolean(order.statusRequests?.length);

  const options: StatusOption[] = [];
  if (isRunning && (canHold || isWorker || canSetAnyStatus)) {
    options.push(
      isOrderHeld
        ? { key: 'resume', label: 'Resume (আবার চালু)', dot: ORDER_STATUS_BOX_LABEL[order.orderStatus].dot, change: { onHold: false } }
        : {
            key: 'hold',
            label: asksAdmin ? 'Hold (Admin অনুমোদন লাগবে)' : 'Hold',
            dot: ORDER_STATUS_BOX_LABEL.HOLD.dot,
            change: { onHold: true },
            needsApproval: asksAdmin,
            isEnabled: !(asksAdmin && hasWaitingRequest),
          },
    );
  }
  if (canSetAnyStatus) {
    for (const status of SETTABLE_STATUSES) {
      if (sameState(status, order.orderStatus)) continue;
      let warning: string | undefined;
      if (order.completedAt && status !== OrderStatus.COMPLETED) warning = 'এই order-এর commission আগেই কাটা হয়েছে; status বদলালেও তা ফেরত যাবে না।';
      else if (status === OrderStatus.COMPLETED) warning = 'Provider-এর commission কাটা হবে, কিন্তু customer-এর payment এখানে নেওয়া হবে না।';
      if (status === OrderStatus.CANCELLED && isPaid) warning = 'Customer টাকা দিয়েছেন; cancel করলে refund নিজে থেকে হবে না।';
      options.push({ key: status, label: ORDER_STATUS_BOX_LABEL[status].text, dot: ORDER_STATUS_BOX_LABEL[status].dot, change: { status }, warning });
    }
  } else if (isWorker && isRunning) {
    options.push({
      key: 'CANCELLED',
      label: 'Cancel (Admin অনুমোদন লাগবে)',
      dot: ORDER_STATUS_BOX_LABEL.CANCELLED.dot,
      change: { status: OrderStatus.CANCELLED },
      needsApproval: true,
      isEnabled: !hasWaitingRequest,
    });
    if (onComplete) options.push({ key: 'complete', label: completeLabel, dot: ORDER_STATUS_BOX_LABEL.COMPLETED.dot, change: 'complete', isEnabled: canComplete });
  }

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setChosen(null);
    setReason('');
  };

  const save = useMutation({
    mutationFn: (change: { status: OrderStatus } | { onHold: boolean }) => ordersService.changeStatus(order.id, { ...change, reason: reason.trim() }),
    onSuccess: () => {
      KEYS_TO_REFRESH.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
      void queryClient.invalidateQueries({ queryKey: ['order-status-log', order.id] });
      void queryClient.invalidateQueries({ queryKey: ['order-status-requests', order.id] });
      toast.success(chosen?.needsApproval ? 'Admin-এর অনুমোদনের জন্য পাঠানো হয়েছে' : 'Status বদলানো হয়েছে');
      close();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const pill = (
    <>
      <span className={`size-[8px] shrink-0 rounded-full ${current.dot}`} />
      <span className="truncate">{current.text}</span>
    </>
  );
  const pillClass = 'flex h-[36px] max-w-[160px] shrink-0 items-center gap-[8px] rounded-[10px] border border-chip bg-white px-[12px] text-[13px] font-semibold text-ink';

  if (options.length === 0) {
    return (
      <div className={pillClass} aria-label={`Order status: ${current.text}`}>
        {pill}
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button type="button" onClick={() => (isOpen ? close() : setIsOpen(true))} aria-expanded={isOpen} aria-label={`Order status: ${current.text}. Change it`} className={`${pillClass} cursor-pointer transition-colors hover:bg-surface`}>
        {pill}
        <HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={2} className="shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[44px] z-30 w-[280px] rounded-[12px] border border-line bg-white p-[6px] shadow-lg">
          {!chosen ? (
            <div role="menu">
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="menuitem"
                  disabled={option.isEnabled === false}
                  onClick={() => {
                    if (option.change === 'complete') {
                      close();
                      onComplete?.();
                      return;
                    }
                    setChosen(option);
                  }}
                  className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left text-[14px] font-semibold text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <span className={`size-[8px] shrink-0 rounded-full ${option.dot}`} />
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <form
              className="flex flex-col gap-[8px] p-[6px]"
              onSubmit={(event) => {
                event.preventDefault();
                if (reason.trim().length >= 3 && chosen.change !== 'complete') save.mutate(chosen.change);
              }}
            >
              <p className="text-[13px] font-semibold text-ink">
                {current.text} → {chosen.label}
              </p>
              {chosen.warning && <p className="rounded-[8px] bg-[#fdecec] px-[10px] py-[8px] text-[12px] font-medium text-[#d64545]">{chosen.warning}</p>}
              {chosen.needsApproval && (
                <p className="rounded-[8px] bg-[#fff4e5] px-[10px] py-[8px] text-[12px] font-medium text-[#b7791f]">
                  এটা Admin-এর কাছে অনুরোধ হিসেবে যাবে। অনুমোদন দিলে তবেই status বদলাবে; ততক্ষণ order আগের মতোই চলবে।
                </p>
              )}
              <textarea
                autoFocus
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="কেন বদলাচ্ছেন? (সবাই দেখতে পাবে)"
                className="w-full resize-none rounded-[8px] border border-line bg-white px-[10px] py-[8px] text-[13px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary"
              />
              <div className="flex gap-[8px]">
                <button type="button" onClick={() => setChosen(null)} className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface">
                  পেছনে
                </button>
                <button
                  type="submit"
                  disabled={reason.trim().length < 3 || save.isPending}
                  className="h-[40px] flex-1 cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
                >
                  {save.isPending ? 'Saving...' : chosen.needsApproval ? 'অনুরোধ পাঠান' : 'Confirm'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
