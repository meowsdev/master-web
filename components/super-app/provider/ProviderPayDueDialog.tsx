'use client';

import { useState } from 'react';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { OnlinePaymentMethod } from '@/services/order-completion.service';
import { PaymentMethodPicker } from '../order-chat/PaymentMethodPicker';

interface ProviderPayDueDialogProps {
  dueAmount: number;
  isPaying: boolean;
  onPay: (method: OnlinePaymentMethod) => void;
  onClose: () => void;
}

/* Small centred dialog: how the provider pays what they owe the platform. */
export function ProviderPayDueDialog({ dueAmount, isPaying, onPay, onClose }: ProviderPayDueDialogProps) {
  const [method, setMethod] = useState<OnlinePaymentMethod | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-[16px]">
      <div role="dialog" aria-label="Pay due" className="w-full max-w-[360px] rounded-[16px] bg-white p-[20px] text-[#202939] shadow-xl">
        <h3 className="text-[16px] font-semibold">Pay your due</h3>
        <p className="mt-[4px] text-[13px] font-medium text-[#697586]">Platform commission on your cash jobs.</p>

        <p className="mt-[16px] text-[26px] font-semibold">{formatTaka(dueAmount)}</p>

        <div className="mt-[16px]">
          <PaymentMethodPicker selected={method} onSelect={setMethod} />
        </div>

        <div className="mt-[20px] flex justify-end gap-[10px]">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-[10px] px-[16px] py-[10px] text-[14px] font-semibold text-[#697586] hover:bg-[#f7f5f3]">
            Cancel
          </button>
          <button
            type="button"
            disabled={!method || isPaying}
            onClick={() => method && onPay(method)}
            className="cursor-pointer rounded-[10px] bg-[#202939] px-[18px] py-[10px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPaying ? 'Processing...' : `Pay ${formatTaka(dueAmount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
