import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { CreditCardIcon, Invoice01Icon, Money01Icon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { Order } from '@/types/order.types';

function Line({ icon, children }: { icon: IconSvgElement; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-[10px] text-[14px] font-semibold text-ink">
      <HugeiconsIcon icon={icon} size={18} className="shrink-0" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

const METHOD_LABEL: Record<string, string> = { BKASH: 'bKash', NAGAD: 'Nagad', CARD: 'Card' };
const formatTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

/*
 * Receipt of one advance payment: what was paid now, the bill, what has been paid so far and what is left.
 * The customer and the provider see the same figures. The bill and the remainder come from the moment of
 * payment, so an extra charge added later does not rewrite an old receipt.
 */
export function AdvancePaymentCard({ order, index, viewer }: { order: Order; index: number; viewer: 'CUSTOMER' | 'PROVIDER' }) {
  const payment = order.advancePayments?.[index];
  if (!payment) return null;

  const paidNow = Number(payment.amount);
  // Receipts made before the snapshot fields existed are rebuilt from the payments up to this one.
  const paidThroughThis = (order.advancePayments ?? []).slice(0, index + 1).reduce((sum, advance) => sum + Number(advance.amount), 0);
  const billAtPayment = payment.totalAtPayment != null ? Number(payment.totalAtPayment) : Number(order.totalPrice);
  const dueAfter = payment.dueAfter != null ? Number(payment.dueAfter) : billAtPayment - paidThroughThis;
  const paidSoFar = billAtPayment - dueAfter;
  const isMine = viewer === 'CUSTOMER';

  return (
    <article className={`w-full max-w-[460px] rounded-[16px] p-[16px] text-ink ${isMine ? 'ml-auto bg-secondary' : 'bg-white shadow-sm'}`}>
      <h3 className="text-[14px] font-semibold">{isMine ? 'অগ্রিম পেমেন্ট সম্পন্ন হয়েছে' : 'কাস্টমার অগ্রিম পেমেন্ট করেছেন'}</h3>

      <ul className="mt-[14px] flex flex-col gap-[12px]">
        <Line icon={Money01Icon}>এই পেমেন্ট: {formatTaka(paidNow)}</Line>
        <Line icon={CreditCardIcon}>পেমেন্ট পদ্ধতি: অনলাইন ({METHOD_LABEL[payment.method] ?? payment.method})</Line>
        <Line icon={Invoice01Icon}>মোট বিল: {formatTaka(billAtPayment)}</Line>
        <Line icon={Wallet01Icon}>এ পর্যন্ত পরিশোধ: {formatTaka(paidSoFar)}</Line>
      </ul>

      <footer className="mt-[16px] flex items-end justify-between">
        <time className="text-[12px] font-medium text-muted">{formatTime(payment.createdAt)}</time>
        <span className={`rounded-[10px] px-[16px] py-[8px] text-[15px] font-semibold text-muted ${isMine ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : 'bg-surface'}`}>
          বাকি- {formatTaka(dueAfter)}
        </span>
      </footer>
    </article>
  );
}
