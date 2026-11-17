import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { CreditCardIcon, Invoice01Icon, Money01Icon, UserIcon, Wallet01Icon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { Order } from '@/types/order.types';

function Line({ icon, children }: { icon: IconSvgElement; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-[10px] text-[14px] font-semibold text-[#202939]">
      <HugeiconsIcon icon={icon} size={18} className="shrink-0" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

const METHOD_LABEL: Record<string, string> = { CASH: 'ক্যাশ', BKASH: 'অনলাইন (bKash)', NAGAD: 'অনলাইন (Nagad)', CARD: 'অনলাইন (Card)', ONLINE: 'অনলাইন' };

/*
 * What was paid, and how much of it was tip. The customer and the provider see the same figures:
 * the bill, the tip and the total, so neither has to work them out. The customer's own card is the
 * mint bubble on the right; the provider's is the white incoming card on the left.
 */
export function PaymentSummaryCard({ order, viewer }: { order: Order; viewer: 'CUSTOMER' | 'PROVIDER' }) {
  const payment = order.paymentAndTip;
  if (!payment) return null;

  const billAmount = Number(payment.serviceAmountPaid);
  const tipAmount = Number(payment.tipAmount);
  const totalPaid = billAmount + tipAmount;
  const isMine = viewer === 'CUSTOMER';
  // Cash goes to the provider, so the platform's share becomes their due. Online money reaches the platform first.
  const companyShare = Number(order.adminCommission);
  const providerOwesCompany = viewer === 'PROVIDER' && payment.paymentMode === 'CASH' && companyShare > 0;

  return (
    <article className={`w-full max-w-[460px] rounded-[16px] p-[16px] text-[#202939] ${isMine ? 'ml-auto bg-[#ade2cf]' : 'bg-white shadow-sm'}`}>
      <h3 className="text-[14px] font-semibold">{isMine ? 'সার্ভিস সফলভাবে সম্পন্ন হয়েছে!' : 'কাস্টমারের পেমেন্ট সম্পন্ন হয়েছে'}</h3>

      <ul className="mt-[14px] flex flex-col gap-[12px]">
        <Line icon={Invoice01Icon}>সার্ভিস ও পার্টস খরচ: {formatTaka(billAmount)}</Line>
        <Line icon={UserIcon}>টিপস: {tipAmount > 0 ? formatTaka(tipAmount) : 'নেই'}</Line>
        <Line icon={Wallet01Icon}>মোট পেমেন্ট: {formatTaka(totalPaid)}</Line>
        <Line icon={CreditCardIcon}>পেমেন্ট পদ্ধতি: {METHOD_LABEL[payment.paymentMode] ?? payment.paymentMode}</Line>
        {providerOwesCompany && <Line icon={Money01Icon}>কোম্পানিকে দিতে হবে: {formatTaka(companyShare)}</Line>}
      </ul>

      {providerOwesCompany && (
        <p className="mt-[10px] text-[12px] font-medium text-[#697586]">ক্যাশ আপনি পেয়েছেন, তাই এই পরিমাণ আপনার প্রোফাইলের ডিউতে যোগ হয়েছে। Pay Now দিয়ে কোম্পানিকে পরিশোধ করুন।</p>
      )}

      <footer className="mt-[16px] flex justify-end">
        <span className={`rounded-[10px] px-[16px] py-[8px] text-[15px] font-semibold text-[#9aa4b2] ${isMine ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : 'bg-[#f7f5f3]'}`}>
          {isMine ? 'Paid' : 'Received'}- {formatTaka(totalPaid)}
        </span>
      </footer>
    </article>
  );
}
