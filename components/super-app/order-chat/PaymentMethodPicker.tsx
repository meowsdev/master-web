'use client';

import { OnlinePaymentMethod } from '@/services/order-completion.service';

const METHODS: Array<{ id: OnlinePaymentMethod; label: string; accent: string }> = [
  // Brand colors of the wallets, so customers recognise them at a glance.
  { id: 'BKASH', label: 'bKash', accent: 'border-[#e2136e] text-[#e2136e]' },
  { id: 'NAGAD', label: 'Nagad', accent: 'border-[#f6921e] text-[#f6921e]' },
  { id: 'CARD', label: 'Card', accent: 'border-[#202939] text-[#202939]' },
];

interface PaymentMethodPickerProps {
  selected: OnlinePaymentMethod | null;
  onSelect: (method: OnlinePaymentMethod) => void;
}

/* Second step of "Accept & Pay": which wallet or card the customer pays with. */
export function PaymentMethodPicker({ selected, onSelect }: PaymentMethodPickerProps) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="flex gap-[8px]">
      {METHODS.map((method) => (
        <button
          key={method.id}
          type="button"
          role="radio"
          aria-checked={selected === method.id}
          onClick={() => onSelect(method.id)}
          className={`h-[40px] flex-1 cursor-pointer rounded-[10px] border bg-white text-[14px] font-semibold ${method.accent} ${
            selected === method.id ? 'ring-2 ring-current' : 'opacity-70'
          }`}
        >
          {method.label}
        </button>
      ))}
    </div>
  );
}
