'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { providerKycService } from '@/services/provider-kyc.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { User, UserRole } from '@/types/auth.types';
import { myKycQueryKey } from '../kyc/ProviderKycPanel';

/** What the Switch Account dialog is asking. */
export type SwitchPrompt = 'BECOME_PROVIDER' | 'TO_PROVIDER' | 'TO_CUSTOMER';

const apiError = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

const isNotFound = (error: unknown) => (error as { response?: { status?: number } })?.response?.status === 404;

/*
 * Switch Account for one number with two sides. A customer who is a verified provider too is asked to switch to
 * provider; one who is not is asked whether they want to become one (Yes opens the KYC; one already sent opens
 * straight to where it stands). A provider is asked to switch to customer. Every press asks the server first, so an
 * approval that just happened is seen at once. Technicians and staff have no Switch Account button at all.
 */
export function useSwitchAccount({ user, onSwitched }: { user: User | null; onSwitched: (me: User) => void }) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState<SwitchPrompt | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const openKyc = () => useOrderPanelStore.getState().open(null, 'providerKyc');

  const start = async () => {
    if (!user || isBusy) return;
    setIsBusy(true);
    try {
      const me = await authService.getMe();
      if (me.role === UserRole.PROVIDER) setPrompt('TO_CUSTOMER');
      else if (me.role === UserRole.CUSTOMER && me.availableRoles?.includes(UserRole.PROVIDER)) setPrompt('TO_PROVIDER');
      else if (me.role === UserRole.CUSTOMER) {
        // Already applied: show where the KYC stands instead of asking again.
        const kyc = await providerKycService.getMine().catch((error: unknown) => (isNotFound(error) ? null : Promise.reject(error)));
        if (kyc?.kyc) {
          queryClient.setQueryData(myKycQueryKey(user.id), kyc);
          openKyc();
        } else setPrompt('BECOME_PROVIDER');
      }
    } catch (error) {
      toast.error(apiError(error, 'এখন সুইচ করা যাচ্ছে না, একটু পরে চেষ্টা করুন।'));
    } finally {
      setIsBusy(false);
    }
  };

  const confirm = async () => {
    if (!user || !prompt) return;
    setIsBusy(true);
    try {
      if (prompt === 'BECOME_PROVIDER') {
        queryClient.setQueryData(myKycQueryKey(user.id), await providerKycService.apply());
        setPrompt(null);
        openKyc();
        return;
      }
      const me = await authService.switchProfile(prompt === 'TO_PROVIDER' ? UserRole.PROVIDER : UserRole.CUSTOMER);
      setPrompt(null);
      // Every list and screen belongs to the side just left: start them all again on the new side.
      await queryClient.invalidateQueries();
      onSwitched(me);
      toast.success(me.role === UserRole.PROVIDER ? 'প্রোভাইডার অ্যাকাউন্টে আছেন।' : 'কাস্টমার অ্যাকাউন্টে আছেন।');
    } catch (error) {
      toast.error(apiError(error, 'সুইচ করা যায়নি।'));
    } finally {
      setIsBusy(false);
    }
  };

  return { prompt, isBusy, start, confirm, cancel: () => setPrompt(null) };
}
