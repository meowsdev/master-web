import { formatTaka } from '@/components/modals/place-order/format-taka';
import { Order } from '@/types/order.types';

/* The provider's view of how the customer settles the job: waiting for an online payment, or settled. */
export function ProviderPaymentNote({ order }: { order: Order }) {
  const payment = order.paymentAndTip;
  if (!payment) return null;

  const isWaiting = payment.paymentMode === 'ONLINE' && payment.confirmationStatus === 'PENDING';
  const tip = Number(payment.tipAmount);
  const text = isWaiting
    ? 'Waiting for the customer to pay online...'
    : payment.paymentMode === 'CASH'
      ? `Cash collected: ${formatTaka(payment.serviceAmountPaid)}`
      : `Paid online (${payment.paymentMode}): ${formatTaka(payment.serviceAmountPaid)}${tip > 0 ? ` + ${formatTaka(tip)} tip` : ''}`;

  return (
    <p className={`ml-auto max-w-[460px] rounded-[16px] px-[14px] py-[10px] text-[14px] font-semibold text-[#202939] ${isWaiting ? 'bg-[#fff4d6]' : 'bg-[#ade2cf]'}`}>
      {text}
    </p>
  );
}
