'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerKycService } from '@/services/provider-kyc.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { myKycQueryKey } from './ProviderKycPanel';
import { kycStatusView } from './KycStatusCard';

const autoOpenedKey = (userId: string) => `kyc-auto-opened:${userId}`;

/** Opens the verification panel. */
export const openProviderKyc = () => useOrderPanelStore.getState().open(null, 'providerKyc');

/*
 * Top of the provider's list until they are verified: where their verification stands and a button to it.
 * Not sent yet or rejected: the panel also opens by itself once per browser session after login (closing it
 * is allowed; this banner stays as the reminder).
 */
export function ProviderKycBanner({ userId }: { userId: string }) {
  const { data } = useQuery({ queryKey: myKycQueryKey(userId), queryFn: providerKycService.getMine, staleTime: 30_000 });
  const needsAction = Boolean(data && (!data.kyc || data.kyc.status === 'REJECTED'));

  useEffect(() => {
    if (!needsAction) return;
    try {
      if (sessionStorage.getItem(autoOpenedKey(userId))) return;
      sessionStorage.setItem(autoOpenedKey(userId), '1');
    } catch {
      // No session storage (private mode): opening once per page load is fine too.
    }
    // Never over a panel the provider already opened.
    if (!useOrderPanelStore.getState().kind) openProviderKyc();
  }, [needsAction, userId]);

  if (!data || data.kyc?.status === 'APPROVED') return null;
  const view = kycStatusView(data);
  const isWaiting = data.kyc?.status === 'PENDING';

  return (
    <div className={`mt-[8px] rounded-[12px] p-[12px] ${isWaiting ? 'bg-[#fff4e5]' : 'bg-[#fdecec]'}`}>
      <p className={`text-[14px] font-semibold ${isWaiting ? 'text-[#b7791f]' : 'text-[#d64545]'}`}>{view.title}</p>
      <p className="mt-[2px] text-[12px] font-medium leading-relaxed text-ink">{view.text}</p>
      <button type="button" onClick={openProviderKyc} className="mt-[8px] h-[32px] cursor-pointer rounded-[8px] bg-primary px-[12px] text-[13px] font-semibold text-white hover:bg-primary/90">
        {isWaiting ? 'জমা দেওয়া তথ্য দেখুন' : 'এখনই ভেরিফাই করুন'}
      </button>
    </div>
  );
}
