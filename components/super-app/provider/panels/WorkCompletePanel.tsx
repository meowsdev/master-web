'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { CompletionPaymentMode, orderCompletionService } from '@/services/order-completion.service';
import { Order } from '@/types/order.types';
import { useOrderRevision } from '@/hooks/useOrderRevision';
import { openRevision } from '@/lib/revision';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';

const OPTIONS: Array<{ mode: CompletionPaymentMode; title: string; hint: string }> = [
  { mode: 'ONLINE', title: 'অনলাইন পেমেন্ট', hint: 'কাস্টমারের কাছে পেমেন্ট কার্ড যাবে। সে "Accept & Pay" করলে অর্ডার সম্পন্ন হবে।' },
  { mode: 'CASH', title: 'ক্যাশ / অফলাইন', hint: 'আপনি ক্যাশ বুঝে নিয়েছেন। অর্ডার সাথে সাথে সম্পন্ন হবে, কাস্টমারকে কিছু করতে হবে না।' },
];

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।';
};

/*
 * "কাজ শেষ" as a right-hand panel: how the customer pays and, for cash, whether they gave a tip.
 * All rules (status, who may complete, cash vs online) are enforced by the backend.
 */
export function WorkCompletePanel({ order, onClose }: { order: Order; onClose: () => void }) {
  // A revision was already paid for: finishing it only closes the order again.
  if (openRevision(order)) return <RevisionDonePanel order={order} onClose={onClose} />;
  return <PaymentCompletePanel order={order} onClose={onClose} />;
}

const MIN_REASON_LENGTH = 5;

/*
 * "Revision Done": the re-work is finished. The provider / technician writes why the order came back and
 * whether the first job's quality caused it. The warranty covers the service only, so extra charges approved
 * during the revision (parts, a bigger problem) are still due: then they also pick how the customer pays.
 */
function RevisionDonePanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const { finish } = useOrderRevision(order.id);
  const issue = openRevision(order)?.issueDescription;
  const dueAmount = Number(order.dueAmount);
  const isMoneyDue = dueAmount > 0;
  const [reason, setReason] = useState('');
  const [wasQualityIssue, setWasQualityIssue] = useState<boolean | null>(null);
  const [paymentMode, setPaymentMode] = useState<CompletionPaymentMode>('ONLINE');

  const isReasonReady = reason.trim().length >= MIN_REASON_LENGTH;
  const isReady = isReasonReady && wasQualityIssue !== null;

  const submit = () => {
    if (!isReady || wasQualityIssue === null) return;
    finish.mutate(
      { reason: reason.trim(), wasQualityIssue, ...(isMoneyDue ? { paymentMode } : {}) },
      { onSuccess: onClose },
    );
  };

  return (
    <SidePanelShell title="রিভিশন শেষ করুন" onClose={onClose}>
      <p className="text-[13px] font-medium leading-relaxed text-[#697586]">
        কাস্টমারের সমস্যা: &ldquo;{issue}&rdquo;
      </p>

      <p className="mt-[20px] text-[15px] font-semibold text-[#202939]">কাজ শেষ হওয়ার পর কেন আবার রিভিশনে এলো?</p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value.slice(0, 1000))}
        rows={4}
        placeholder="যেমন: প্রথমবার গ্যাস লিক ধরা পড়েনি, তাই ঠান্ডা হচ্ছিল না।"
        className="mt-[10px] w-full resize-none rounded-[10px] border border-[#e5e5e5] p-[12px] text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#9aa4b2] focus:border-[#1daa61]"
      />

      <p className="mt-[16px] text-[15px] font-semibold text-[#202939]">প্রথম কাজের কোয়ালিটিতে কি সমস্যা ছিল?</p>
      <div className="mt-[10px] flex gap-[10px]">
        {[{ label: 'হ্যাঁ, ছিল', value: true }, { label: 'না, অন্য কারণে', value: false }].map((choice) => (
          <button
            key={choice.label}
            type="button"
            aria-pressed={wasQualityIssue === choice.value}
            onClick={() => setWasQualityIssue(choice.value)}
            className={`h-[40px] flex-1 cursor-pointer rounded-[10px] text-[14px] font-semibold ${wasQualityIssue === choice.value ? 'bg-[#1daa61] text-white' : 'bg-[#f7f5f3] text-[#202939]'}`}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {isMoneyDue ? (
        <>
          <p className="mt-[20px] text-[13px] font-medium leading-relaxed text-[#697586]">
            রিভিশনের সময় এক্সট্রা চার্জ যোগ হয়েছে। বাকি: <span className="font-semibold text-[#202939]">{formatTaka(dueAmount)}</span>
          </p>
          <p className="mt-[12px] text-[15px] font-semibold text-[#202939]">কাস্টমার কীভাবে পেমেন্ট করবে?</p>
          <div role="radiogroup" className="mt-[10px] flex flex-col gap-[10px]">
            {OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                role="radio"
                aria-checked={paymentMode === option.mode}
                onClick={() => setPaymentMode(option.mode)}
                className={`w-full cursor-pointer rounded-[12px] border p-[14px] text-left ${paymentMode === option.mode ? 'border-[#1daa61] bg-[#e7fce3]' : 'border-[#e5e5e5]'}`}
              >
                <span className="block text-[14px] font-semibold text-[#202939]">{option.title}</span>
                <span className="mt-[2px] block text-[12px] font-medium text-[#697586]">{option.hint}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-[20px] text-[13px] font-medium leading-relaxed text-[#697586]">
          এটি ওয়ারেন্টির কাজ, তাই নতুন কোনো পেমেন্ট বা কমিশন লাগবে না। পার্টস বা বড় সমস্যা থাকলে আগে &ldquo;Extra Charge&rdquo; পাঠান।
        </p>
      )}

      <div className="mt-[24px] flex justify-center">
        <button
          type="button"
          disabled={!isReady || finish.isPending}
          onClick={submit}
          className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {finish.isPending ? 'সম্পন্ন হচ্ছে...' : 'রিভিশন সম্পন্ন'}
        </button>
      </div>
      {!isReady && (
        <p className="mt-[10px] text-center text-[12px] font-medium text-[#697586]">
          বাকি আছে: {[!isReasonReady && 'কারণ', wasQualityIssue === null && 'কোয়ালিটি'].filter(Boolean).join(', ')}
        </p>
      )}
    </SidePanelShell>
  );
}

/* The first completion: how the customer pays and, for cash, whether they gave a tip. */
function PaymentCompletePanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const queryClient = useQueryClient();
  const openPanel = useOrderPanelStore((state) => state.open);
  const [paymentMode, setPaymentMode] = useState<CompletionPaymentMode>('ONLINE');
  const [hasCashTip, setHasCashTip] = useState(false);
  const [cashTip, setCashTip] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const reportedTip = paymentMode === 'CASH' && hasCashTip ? Number(cashTip) : 0;
    if (paymentMode === 'CASH' && hasCashTip && !(reportedTip > 0)) {
      toast.error('টিপসের পরিমাণ লিখুন।');
      return;
    }
    setIsSubmitting(true);
    try {
      await orderCompletionService.complete(order.id, paymentMode, reportedTip || undefined);
      toast.success(paymentMode === 'CASH' ? 'অর্ডার সম্পন্ন হয়েছে।' : 'কাস্টমারের কাছে পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে।');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['my-orders-drawer'] }),
        // A cash job adds the platform's share to the provider's due, shown in the sidebar header.
        queryClient.invalidateQueries({ queryKey: ['provider-wallet'] }),
      ]);
      // Cash closes the order now: offer the parts / costs form straight away (it can be closed).
      // Online closes when the customer pays; the costs card then appears on the order.
      if (paymentMode === 'CASH') openPanel(order.id, 'expenseClaim');
      else onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidePanelShell title="কাজ শেষ করুন" onClose={onClose}>
      <p className="text-[13px] font-medium text-[#697586]">মোট বিল: {formatTaka(order.totalPrice)} • বাকি: {formatTaka(order.dueAmount)}</p>

      <p className="mt-[20px] text-[15px] font-semibold text-[#202939]">কাস্টমার কীভাবে পেমেন্ট করবে?</p>
      <div role="radiogroup" className="mt-[10px] flex flex-col gap-[10px]">
        {OPTIONS.map((option) => (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={paymentMode === option.mode}
            onClick={() => setPaymentMode(option.mode)}
            className={`w-full cursor-pointer rounded-[12px] border p-[14px] text-left ${paymentMode === option.mode ? 'border-[#1daa61] bg-[#e7fce3]' : 'border-[#e5e5e5]'}`}
          >
            <span className="block text-[14px] font-semibold text-[#202939]">{option.title}</span>
            <span className="mt-[2px] block text-[12px] font-medium text-[#697586]">{option.hint}</span>
          </button>
        ))}
      </div>

      {paymentMode === 'CASH' && (
        <div className="mt-[16px] rounded-[12px] border border-[#e5e5e5] p-[14px]">
          <p className="text-[14px] font-semibold text-[#202939]">কাস্টমার কি টিপস দিয়েছেন?</p>
          <div className="mt-[10px] flex gap-[10px]">
            {[{ label: 'হ্যাঁ', value: true }, { label: 'না', value: false }].map((choice) => (
              <button
                key={choice.label}
                type="button"
                aria-pressed={hasCashTip === choice.value}
                onClick={() => setHasCashTip(choice.value)}
                className={`h-[40px] flex-1 cursor-pointer rounded-[10px] text-[14px] font-semibold ${hasCashTip === choice.value ? 'bg-[#1daa61] text-white' : 'bg-[#f7f5f3] text-[#202939]'}`}
              >
                {choice.label}
              </button>
            ))}
          </div>
          {hasCashTip && (
            <input
              inputMode="numeric"
              value={cashTip}
              onChange={(event) => setCashTip(event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 4))}
              placeholder="কত টাকা টিপস দিয়েছেন? (৳)"
              className="mt-[12px] w-full border-b border-[#202939]/60 bg-transparent pb-[8px] text-[14px] font-medium text-[#202939] outline-none placeholder:text-[#9aa4b2]"
            />
          )}
        </div>
      )}

      <div className="mt-[28px] flex justify-center">
        <button type="button" onClick={submit} disabled={isSubmitting} className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
          {isSubmitting ? 'অপেক্ষা করুন...' : 'কাজ শেষ নিশ্চিত করুন'}
        </button>
      </div>
    </SidePanelShell>
  );
}
