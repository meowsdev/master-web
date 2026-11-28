'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';
import { ordersService } from '@/services/orders.service';
import { Order } from '@/types/order.types';

const KEYS_TO_REFRESH = ['provider-assigned-orders', 'admin-orders', 'my-orders-drawer'];
const ROLE_LABEL: Record<string, string> = { PROVIDER: 'Provider', TECHNICIAN: 'Technician' };

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

const barButtonClass = 'h-[34px] shrink-0 cursor-pointer rounded-[10px] px-[14px] text-[13px] font-semibold disabled:cursor-not-allowed';

/*
 * Under the order header while a provider's / technician's Hold or Cancel waits for an admin: what was asked and why.
 * The order runs as before until then. An admin (canAnswer) approves it, or rejects it with a note the provider sees
 * in the status history. Not shown to the customer: nothing has changed for them.
 */
export function OrderStatusRequestBar({ order, canAnswer = false }: { order: Order; canAnswer?: boolean }) {
  const queryClient = useQueryClient();
  const [isRejecting, setIsRejecting] = useState(false);
  const [note, setNote] = useState('');
  const request = order.statusRequests?.[0];

  const refresh = () => {
    KEYS_TO_REFRESH.forEach((key) => void queryClient.invalidateQueries({ queryKey: [key] }));
    void queryClient.invalidateQueries({ queryKey: ['order-status-log', order.id] });
    void queryClient.invalidateQueries({ queryKey: ['order-status-requests', order.id] });
  };
  const approve = useMutation({
    mutationFn: () => ordersService.approveStatusRequest(request!.id),
    onSuccess: () => {
      refresh();
      toast.success('অনুমোদন দেওয়া হয়েছে');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'অনুমোদন দেওয়া যায়নি')),
  });
  const reject = useMutation({
    mutationFn: () => ordersService.rejectStatusRequest(request!.id, note.trim()),
    onSuccess: () => {
      refresh();
      setIsRejecting(false);
      setNote('');
      toast.success('অনুরোধ বাতিল করা হয়েছে');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'অনুরোধ বাতিল করা যায়নি')),
  });

  if (!request) return null;
  const asked = request.onHold ? 'Hold' : 'Cancel';
  const who = request.requestedByName || ROLE_LABEL[request.requestedByRole] || 'Provider';
  const isBusy = approve.isPending || reject.isPending;

  return (
    <div className="flex shrink-0 flex-col gap-[8px] border-b border-line bg-[#fff4e5] px-[16px] py-[10px]">
      <div className="flex items-center justify-between gap-[12px]">
        <p className="flex min-w-0 items-start gap-[6px] text-[13px] font-medium text-[#b7791f]">
          <HugeiconsIcon icon={Clock01Icon} size={18} strokeWidth={1.8} className="mt-[1px] shrink-0" />
          <span className="min-w-0">
            <span className="font-semibold">
              {who} ({ROLE_LABEL[request.requestedByRole] ?? request.requestedByRole}) {asked} করতে চায়
            </span>
            {` · ${request.reason}`}
            {!canAnswer && <span className="block text-[12px]">Admin-এর অনুমোদনের অপেক্ষায়; ততক্ষণ order আগের মতোই চলবে।</span>}
          </span>
        </p>
        {canAnswer && !isRejecting && (
          <div className="flex shrink-0 gap-[8px]">
            <button type="button" disabled={isBusy} onClick={() => setIsRejecting(true)} className={`${barButtonClass} border border-chip bg-white text-ink hover:bg-surface`}>
              Reject
            </button>
            <button type="button" disabled={isBusy} onClick={() => approve.mutate()} className={`${barButtonClass} bg-primary text-white hover:bg-primary/90 disabled:bg-primary-disabled`}>
              {approve.isPending ? '...' : 'Approve'}
            </button>
          </div>
        )}
      </div>

      {canAnswer && isRejecting && (
        <form
          className="flex items-center gap-[8px]"
          onSubmit={(event) => {
            event.preventDefault();
            if (note.trim().length >= 3) reject.mutate();
          }}
        >
          <input
            autoFocus
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder="কেন বাতিল করছেন? (Provider দেখতে পাবে)"
            className="h-[34px] min-w-0 flex-1 rounded-[8px] border border-line bg-white px-[10px] text-[13px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary"
          />
          <button type="button" onClick={() => setIsRejecting(false)} className={`${barButtonClass} bg-white text-ink hover:bg-surface`}>
            পেছনে
          </button>
          <button type="submit" disabled={note.trim().length < 3 || isBusy} className={`${barButtonClass} bg-[#d64545] text-white hover:bg-[#d64545]/90 disabled:opacity-50`}>
            {reject.isPending ? '...' : 'Reject'}
          </button>
        </form>
      )}
    </div>
  );
}
