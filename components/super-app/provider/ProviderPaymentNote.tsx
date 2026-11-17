import { Order } from '@/types/order.types';
import { PaymentSummaryCard } from '../order-chat/PaymentSummaryCard';

/* The provider's view of the payment: a waiting note while the customer has not paid, then the bill / tip / total card. */
export function ProviderPaymentNote({ order, viewer = 'PROVIDER' }: { order: Order; viewer?: 'PROVIDER' | 'ADMIN' }) {
  const payment = order.paymentAndTip;
  if (!payment) return null;

  const isWaiting = payment.paymentMode === 'ONLINE' && payment.confirmationStatus === 'PENDING';
  if (!isWaiting) return <PaymentSummaryCard order={order} viewer={viewer} />;

  return (
    <p className="ml-auto max-w-[460px] rounded-[16px] bg-[#fff4d6] px-[14px] py-[10px] text-[14px] font-semibold text-[#202939]">
      Waiting for the customer to pay online...
    </p>
  );
}
