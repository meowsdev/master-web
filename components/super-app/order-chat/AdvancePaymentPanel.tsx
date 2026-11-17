'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Wallet01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { OnlinePaymentMethod, orderCompletionService } from '@/services/order-completion.service';
import { Order } from '@/types/order.types';
import { PaymentMethodPicker } from './PaymentMethodPicker';

const QUICK_AMOUNTS = [500, 1000, 2000];

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'Payment could not be completed';
};

/*
 * Pay Now: the customer pays part of the bill early (before the work starts, or in the middle of it) with an
 * amount of their own. The final payment is only what is left, because the due drops by this amount.
 * The backend checks the amount against the due; the limit here is only to save a pointless request.
 */
export function AdvancePaymentPanel({ order, userId, onClose }: { order: Order; userId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [amountText, setAmountText] = useState('');
  const [method, setMethod] = useState<OnlinePaymentMethod | null>(null);

  const dueAmount = Number(order.dueAmount);
  const paidSoFar = (order.advancePayments ?? []).reduce((sum, payment) => sum + Number(payment.amount), 0);
  const amount = Number(amountText) || 0;
  const isAmountValid = amount >= 1 && amount <= dueAmount;

  const pay = useMutation({
    mutationFn: () => orderCompletionService.payAdvance(order.id, amount, method!),
    onSuccess: (result) => {
      toast.success(`${formatTaka(amount)} paid. Remaining due: ${formatTaka(result.dueAmount)}`);
      queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] });
      onClose();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <SidePanelShell title="Pay in advance" onClose={onClose}>
      <div className="rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px]">
        <div className="flex justify-between text-[13px] font-medium text-[#697586]"><span>Total bill</span><span>{formatTaka(order.totalPrice)}</span></div>
        <div className="mt-[6px] flex justify-between text-[13px] font-medium text-[#697586]"><span>Already paid in advance</span><span>{formatTaka(paidSoFar)}</span></div>
        <div className="mt-[8px] flex justify-between border-t border-[#e5e5e5] pt-[8px] text-[15px] font-semibold text-[#202939]"><span>Due now</span><span>{formatTaka(dueAmount)}</span></div>
      </div>

      <OrderField icon={Wallet01Icon}>
        <input
          inputMode="numeric"
          value={amountText}
          onChange={(event) => setAmountText(event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 7))}
          placeholder="How much do you want to pay? (৳)"
          className={fieldControlClass}
        />
      </OrderField>
      {amount > dueAmount && <p className="mt-[6px] text-[12px] font-medium text-[#d64545]">The amount cannot be more than {formatTaka(dueAmount)}.</p>}

      <div className="mt-[14px] flex flex-wrap gap-[8px]">
        {QUICK_AMOUNTS.filter((quick) => quick < dueAmount).map((quick) => (
          <button key={quick} type="button" onClick={() => setAmountText(String(quick))} className="cursor-pointer rounded-[8px] bg-[#a9e5cf] px-[12px] py-[6px] text-[13px] font-semibold text-[#202939]">
            {formatTaka(quick)}
          </button>
        ))}
        <button type="button" onClick={() => setAmountText(String(Math.floor(dueAmount)))} className="cursor-pointer rounded-[8px] bg-[#a9e5cf] px-[12px] py-[6px] text-[13px] font-semibold text-[#202939]">
          Full due
        </button>
      </div>

      <p className="mt-[24px] text-[14px] font-semibold text-[#202939]">Pay with</p>
      <div className="mt-[10px]"><PaymentMethodPicker selected={method} onSelect={setMethod} /></div>

      <p className="mt-[16px] text-[12px] font-medium text-[#697586]">The final payment will ask only for what is left after this advance.</p>

      <div className="mt-[28px] flex justify-center">
        <button
          type="button"
          disabled={!isAmountValid || !method || pay.isPending}
          onClick={() => pay.mutate()}
          className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pay.isPending ? 'Processing...' : `Pay ${formatTaka(amount)}`}
        </button>
      </div>
    </SidePanelShell>
  );
}
