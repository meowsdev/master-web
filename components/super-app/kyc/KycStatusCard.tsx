import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, CheckmarkBadge01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { MyKyc } from '@/services/provider-kyc.service';

export const formatKycDate = (iso: string) => new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' });

/** Where the provider's verification stands, and what it means for getting orders. */
export function kycStatusView(info: Pick<MyKyc, 'kyc' | 'canReceiveOrders' | 'graceUntil'>) {
  const status = info.kyc?.status;
  const grace = info.graceUntil && info.canReceiveOrders ? ` ${formatKycDate(info.graceUntil)} পর্যন্ত অর্ডার পাবেন।` : '';
  if (status === 'APPROVED') return { tone: 'ok' as const, title: 'ভেরিফাইড', text: 'আপনার পরিচয় যাচাই হয়েছে।' };
  if (status === 'PENDING') return { tone: 'wait' as const, title: 'যাচাই চলছে', text: `এডমিন আপনার তথ্য দেখছে। জমা দেওয়ার ৩ দিনের মধ্যে ভেরিফিকেশন সম্পন্ন হবে। ভেরিফিকেশন ছাড়া কোনো অর্ডার পাবেন না।${grace}` };
  if (status === 'REJECTED') return { tone: 'bad' as const, title: 'আবার জমা দিন', text: `${info.kyc?.rejectReason ?? 'তথ্য ঠিক করে আবার জমা দিন।'}${grace}` };
  return { tone: 'bad' as const, title: 'ভেরিফিকেশন বাকি', text: `ভেরিফিকেশন ছাড়া কোনো অর্ডার পাবেন না। তথ্য জমা দিন; ৩ দিনের মধ্যে যাচাই সম্পন্ন হবে।${grace}` };
}

const TONE = {
  ok: { box: 'bg-secondary/50 text-ink', icon: CheckmarkBadge01Icon, iconClass: 'text-primary' },
  wait: { box: 'bg-[#fff4e5] text-[#b7791f]', icon: Clock01Icon, iconClass: 'text-[#b7791f]' },
  bad: { box: 'bg-[#fdecec] text-[#d64545]', icon: Alert02Icon, iconClass: 'text-[#d64545]' },
};

export function KycStatusCard({ info }: { info: Pick<MyKyc, 'kyc' | 'canReceiveOrders' | 'graceUntil'> }) {
  const view = kycStatusView(info);
  const tone = TONE[view.tone];
  return (
    <div className={`flex items-start gap-[10px] rounded-[12px] p-[12px] ${tone.box}`}>
      <HugeiconsIcon icon={tone.icon} size={20} className={`mt-[1px] shrink-0 ${tone.iconClass}`} />
      <span className="flex flex-col">
        <span className="text-[14px] font-semibold">{view.title}</span>
        <span className="text-[12px] font-medium leading-relaxed">{view.text}</span>
      </span>
    </div>
  );
}
