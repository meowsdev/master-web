'use client';

import { useState } from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { CreditCardIcon, Invoice01Icon, Tick02Icon, UserIcon } from '@hugeicons/core-free-icons';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { useOrderPayment } from '@/hooks/useOrderPayment';
import { OnlinePaymentMethod } from '@/services/order-completion.service';
import { Order } from '@/types/order.types';
import { PaymentMethodPicker } from './PaymentMethodPicker';

const TIP_PRESETS = [50, 100];
/** Same limit the backend enforces (MAX_TIP_AMOUNT). */
const MAX_TIP = 5000;

function Line({ icon, children }: { icon: IconSvgElement; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-[10px] text-[14px] font-semibold text-[#202939]">
      <HugeiconsIcon icon={icon} size={18} className="shrink-0" />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/*
 * "Service completed" card, shown once the provider finishes.
 * - Cash: nothing to do, the order is already completed (disabled "Accepted & Completed").
 * - Online, unpaid: tip chips, then Accept & Pay -> pick bKash / Nagad / card -> pay.
 * - Online, paid: payment success and a disabled "Paid" button.
 */
export function CompletionCard({ order, userId }: { order: Order; userId: string }) {
  const payment = order.paymentAndTip;
  // The chip and the typed amount are kept apart. Deriving the box from the total made "500" -> backspace
  // -> "50" match the ৳50 chip and blank the whole box.
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState('');
  const tipAmount = customTip ? Number(customTip) : (selectedPreset ?? 0);
  const [isChoosingMethod, setIsChoosingMethod] = useState(false);
  const [method, setMethod] = useState<OnlinePaymentMethod | null>(null);
  const pay = useOrderPayment(order.id, userId);

  if (!payment) return null;

  const isCash = payment.paymentMode === 'CASH';
  const isAwaitingPayment = payment.paymentMode === 'ONLINE' && payment.confirmationStatus === 'PENDING' && !pay.isSuccess;
  const payableAmount = Number(order.dueAmount) + tipAmount;

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-gradient-to-b from-white to-[#eefaf5] p-[16px] text-[#202939] shadow-sm">
      <h3 className="text-[14px] font-semibold">সার্ভিস সফলভাবে সম্পন্ন হয়েছে!</h3>

      <ul className="mt-[14px] flex flex-col gap-[12px]">
        <Line icon={Invoice01Icon}>বিল সামারি: সার্ভিস ও পার্টস খরচ: {formatTaka(order.totalPrice)}</Line>
        <Line icon={CreditCardIcon}>পেমেন্ট পদ্ধতি: {isCash ? 'ক্যাশ' : 'অনলাইন'}</Line>
        {isAwaitingPayment && (
          <li className="flex flex-wrap items-center gap-[8px] text-[14px] font-semibold">
            <HugeiconsIcon icon={UserIcon} size={18} className="shrink-0" />
            <span>টেকনিশিয়ানকে টিপস দিন:</span>
            {TIP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelectedPreset(selectedPreset === preset ? null : preset);
                  setCustomTip('');
                }}
                aria-pressed={selectedPreset === preset && !customTip}
                className={`cursor-pointer rounded-[8px] px-[10px] py-[4px] text-[13px] font-semibold ${
                  selectedPreset === preset && !customTip ? 'bg-[#1daa61] text-white' : 'bg-[#a9e5cf]'
                }`}
              >
                {formatTaka(preset)}
              </button>
            ))}
            <input
              inputMode="numeric"
              value={customTip}
              onChange={(event) => {
                // Digits only, capped at the backend's tip limit; an empty box falls back to the chip.
                const digits = event.target.value.replace(/\D/g, '').replace(/^0+/, '');
                setCustomTip(Number(digits) > MAX_TIP ? String(MAX_TIP) : digits);
                setSelectedPreset(null);
              }}
              placeholder="৳ ২৫০..."
              className="w-[90px] border-b border-[#202939] bg-transparent text-[13px] outline-none"
            />
          </li>
        )}
        {!isAwaitingPayment && !isCash && Number(payment.tipAmount) > 0 && (
          <Line icon={UserIcon}>টিপস: {formatTaka(payment.tipAmount)}</Line>
        )}
      </ul>

      {isAwaitingPayment && isChoosingMethod && (
        <div className="mt-[14px]">
          <p className="mb-[8px] text-[13px] font-semibold">পেমেন্ট মাধ্যম বেছে নিন</p>
          <PaymentMethodPicker selected={method} onSelect={setMethod} />
        </div>
      )}

      <footer className="mt-[16px] flex items-center justify-end gap-[10px]">
        {!isAwaitingPayment && (
          <span className="flex items-center gap-[6px] text-[13px] font-semibold text-[#1daa61]">
            <HugeiconsIcon icon={Tick02Icon} size={16} />
            {isCash ? 'ক্যাশে সম্পন্ন' : 'পেমেন্ট সফল হয়েছে'}
          </span>
        )}
        <button
          type="button"
          disabled={!isAwaitingPayment || pay.isPending || (isChoosingMethod && !method)}
          onClick={() => {
            if (!isChoosingMethod) return setIsChoosingMethod(true);
            if (method) pay.mutate({ method, tipAmount });
          }}
          className="cursor-pointer rounded-[10px] bg-black px-[18px] py-[10px] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#202939]/30"
        >
          {isCash && 'Accepted & Completed'}
          {!isCash && !isAwaitingPayment && `Paid- ${formatTaka(Number(payment.serviceAmountPaid) + Number(payment.tipAmount))}`}
          {isAwaitingPayment && (isChoosingMethod ? (pay.isPending ? 'Processing...' : `Pay- ${formatTaka(payableAmount)}`) : `Accept & Pay- ${formatTaka(payableAmount)}`)}
        </button>
      </footer>
    </article>
  );
}
