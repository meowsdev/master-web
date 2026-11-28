'use client';

import { ReactNode, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { PauseCircleIcon } from '@hugeicons/core-free-icons';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';
import { HeaderMenuItem } from '../HeaderOptionsMenu';
import { isOrderOnHold } from '../order-list-filters';

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/** Every role's order list; each refreshes after a hold or resume. */
const ORDER_LIST_KEYS = ['provider-assigned-orders', 'admin-orders', 'my-orders-drawer'];

const barClass = 'flex shrink-0 items-center justify-between gap-[12px] border-b border-line bg-[#fff4e5] px-[16px] py-[8px]';
const barButtonClass = 'h-[34px] shrink-0 cursor-pointer rounded-[10px] px-[14px] text-[13px] font-semibold disabled:cursor-not-allowed';

/*
 * Order hold, the same on every role's order screen. While an order is held, a bar under the header tells everyone
 * (the customer too) that it is paused and why. Its technician, its provider and admins / managers (canManage) get
 * "Hold order" / "Resume order" in the ⋮ menu; holding asks for the reason in that bar. The backend checks the same
 * rule, and only an accepted or in-progress order can be held.
 */
export function useOrderHold(order: Order, canManage: boolean): { menuItem: HeaderMenuItem | null; bar: ReactNode } {
  const queryClient = useQueryClient();
  const [isAsking, setIsAsking] = useState(false);
  const [reason, setReason] = useState('');
  const isRunning = order.orderStatus === OrderStatus.ACCEPTED || order.orderStatus === OrderStatus.IN_PROGRESS;
  const isHeld = isOrderOnHold(order);

  const change = useMutation({
    mutationFn: (onHold: boolean) => ordersService.setHold(order.id, onHold, reason.trim()),
    onSuccess: (_, onHold) => {
      ORDER_LIST_KEYS.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
      toast.success(onHold ? 'Order hold-এ রাখা হয়েছে' : 'Order আবার চালু হয়েছে');
      setIsAsking(false);
      setReason('');
    },
    onError: (error, onHold) => toast.error(apiErrorMessage(error, onHold ? 'Order hold করা যায়নি' : 'Order resume করা যায়নি')),
  });

  const menuItem: HeaderMenuItem | null =
    canManage && isRunning
      ? { label: isHeld ? 'Resume order' : 'Hold order', onSelect: () => (isHeld ? change.mutate(false) : setIsAsking(true)) }
      : null;

  let bar: ReactNode = null;
  if (canManage && isRunning && !isHeld && isAsking) {
    bar = (
      <form
        className={barClass}
        onSubmit={(event) => {
          event.preventDefault();
          if (reason.trim().length >= 3) change.mutate(true);
        }}
      >
        <input
          autoFocus
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={300}
          placeholder="কেন hold করছেন? যেমন: পার্টস আসতে দেরি"
          className="h-[34px] min-w-0 flex-1 rounded-[8px] border border-line bg-white px-[10px] text-[13px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary"
        />
        <button type="button" onClick={() => setIsAsking(false)} className={`${barButtonClass} bg-white text-ink hover:bg-surface`}>
          বাতিল
        </button>
        <button type="submit" disabled={reason.trim().length < 3 || change.isPending} className={`${barButtonClass} bg-primary text-white hover:bg-primary/90 disabled:bg-primary-disabled`}>
          {change.isPending ? '...' : 'Hold'}
        </button>
      </form>
    );
  } else if (isHeld) {
    bar = (
      <div className={barClass}>
        <p className="flex min-w-0 items-center gap-[6px] text-[13px] font-medium text-[#b7791f]">
          <HugeiconsIcon icon={PauseCircleIcon} size={18} strokeWidth={1.8} className="shrink-0" />
          <span className="min-w-0 truncate">
            <span className="font-semibold">Hold-এ আছে</span>
            {order.holdReason ? ` · ${order.holdReason}` : ''}
          </span>
        </p>
        {canManage && (
          <button type="button" onClick={() => change.mutate(false)} disabled={change.isPending} className={`${barButtonClass} bg-primary text-white hover:bg-primary/90 disabled:bg-primary-disabled`}>
            {change.isPending ? '...' : 'Resume'}
          </button>
        )}
      </div>
    );
  }

  return { menuItem, bar };
}
