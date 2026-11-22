'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProviderWallet } from '@/hooks/useProviderWallet';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types/order.types';
import { ProviderPayDueDialog } from './ProviderPayDueDialog';

interface ProviderPendingActionsProps {
  order: Order;
  userId: string;
  onUpdateStatus: (status: OrderStatus) => Promise<void>;
  isUpdatingStatus: boolean;
}

/** "1:12" left on the offer, ticking; null when the offer has no end time. */
function useOfferCountdown(expiresAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const seconds = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/*
 * Accept / Decline for a new order, on its card. The order was offered to several providers at once:
 * Accept starts the work if you are first (the backend decides), and Decline only turns down your own
 * offer, so the order stays open for the others. Accepting starts the work at once.
 * With a negative wallet the order still arrives, but Accept becomes "Pay due": once the previous due is
 * paid, Accept comes back (the backend refuses the accept until then anyway).
 */
export function ProviderPendingActions({ order, userId, onUpdateStatus, isUpdatingStatus }: ProviderPendingActionsProps) {
  const queryClient = useQueryClient();
  const timeLeft = useOfferCountdown(order.myOfferExpiresAt);
  const { dueAmount, payDue } = useProviderWallet(userId);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const hasDue = dueAmount > 0;

  const decline = useMutation({
    mutationFn: () => ordersService.declineOffer(order.id),
    onSuccess: () => {
      toast.info('You declined this order. It stays open for other providers.');
      queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders', userId] });
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) || 'Could not decline this order');
    },
  });

  if (order.orderStatus !== OrderStatus.PENDING) return null;
  const isBusy = isUpdatingStatus || decline.isPending;

  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      {hasDue && (
        <p className="w-full text-[13px] font-medium text-[#d64545]">
          আগের ডিউ {formatTaka(dueAmount)} পরিশোধ করুন, তারপর এই অর্ডার accept করতে পারবেন।
        </p>
      )}
      {hasDue ? (
        <button type="button" disabled={isBusy || payDue.isPending} onClick={() => setIsPayOpen(true)} className="cursor-pointer rounded-[10px] bg-[#1daa61] px-[18px] py-[8px] text-[14px] font-semibold text-white hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
          Pay due {formatTaka(dueAmount)}
        </button>
      ) : (
        <button type="button" disabled={isBusy} onClick={() => onUpdateStatus(OrderStatus.IN_PROGRESS)} className="cursor-pointer rounded-[10px] bg-[#1daa61] px-[18px] py-[8px] text-[14px] font-semibold text-white hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
          Accept
        </button>
      )}
      <button type="button" disabled={isBusy} onClick={() => decline.mutate()} className="cursor-pointer rounded-[10px] border border-[#cecece] bg-white px-[18px] py-[8px] text-[14px] font-semibold text-[#202939] hover:bg-[#f7f5f3] disabled:cursor-not-allowed disabled:opacity-50">
        Decline
      </button>
      {timeLeft && <span className="text-[13px] font-medium text-[#697586]">Respond within {timeLeft}</span>}
      {isPayOpen && (
        <ProviderPayDueDialog
          dueAmount={dueAmount}
          isPaying={payDue.isPending}
          onPay={(method) => payDue.mutate(method, { onSuccess: () => setIsPayOpen(false) })}
          onClose={() => setIsPayOpen(false)}
        />
      )}
    </div>
  );
}
