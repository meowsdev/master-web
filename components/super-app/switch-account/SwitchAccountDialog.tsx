'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Briefcase01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { SwitchPrompt } from './useSwitchAccount';

const TEXT: Record<SwitchPrompt, { title: string; body: string; yes: string; no: string; isProvider: boolean }> = {
  BECOME_PROVIDER: {
    title: 'আপনি কি প্রোভাইডার হতে চান?',
    body: 'একই নম্বরে প্রোভাইডার হিসেবে কাজ করতে পারবেন। প্রথমে পরিচয় যাচাই (KYC) করতে হবে; এডমিন অনুমোদন দিলে Switch Account দিয়ে প্রোভাইডার অ্যাকাউন্টে যেতে পারবেন। আপনার কাস্টমার অ্যাকাউন্ট যেমন আছে তেমনই থাকবে।',
    yes: 'হ্যাঁ, প্রোভাইডার হতে চাই',
    no: 'না',
    isProvider: true,
  },
  TO_PROVIDER: {
    title: 'প্রোভাইডার অ্যাকাউন্টে যাবেন?',
    body: 'আপনার প্রোভাইডারের অর্ডার, কাজ আর আয় দেখাবে। যেকোনো সময় আবার কাস্টমারে ফিরতে পারবেন।',
    yes: 'প্রোভাইডারে যান',
    no: 'থাক',
    isProvider: true,
  },
  TO_CUSTOMER: {
    title: 'কাস্টমার অ্যাকাউন্টে যাবেন?',
    body: 'কাস্টমার হিসেবে সার্ভিস অর্ডার করতে পারবেন। কাস্টমারে থাকার সময় নতুন কাজের অফার আসবে না; চলমান কাজ দেখতে আবার প্রোভাইডারে ফিরুন।',
    yes: 'কাস্টমারে যান',
    no: 'থাক',
    isProvider: false,
  },
};

/* The one question Switch Account asks; nothing changes unless the person says yes. */
export function SwitchAccountDialog({ prompt, isBusy, onConfirm, onCancel }: { prompt: SwitchPrompt; isBusy: boolean; onConfirm: () => void; onCancel: () => void }) {
  const text = TEXT[prompt];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-[16px]" onClick={isBusy ? undefined : onCancel}>
      <div role="dialog" aria-modal="true" aria-label={text.title} className="w-full max-w-[380px] rounded-[16px] bg-white p-[20px] text-ink shadow-xl" onClick={(event) => event.stopPropagation()}>
        <span className="flex size-[44px] items-center justify-center rounded-full bg-secondary text-primary">
          <HugeiconsIcon icon={text.isProvider ? Briefcase01Icon : UserIcon} size={22} />
        </span>
        <h3 className="mt-[12px] text-[17px] font-semibold">{text.title}</h3>
        <p className="mt-[6px] text-[13px] font-medium leading-relaxed text-muted">{text.body}</p>
        <div className="mt-[20px] flex gap-[10px]">
          <button type="button" disabled={isBusy} onClick={onCancel} className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface disabled:opacity-50">
            {text.no}
          </button>
          <button type="button" disabled={isBusy} onClick={onConfirm} className="h-[40px] flex-1 cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled">
            {isBusy ? 'একটু অপেক্ষা...' : text.yes}
          </button>
        </div>
      </div>
    </div>
  );
}
