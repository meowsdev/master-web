'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { OnlinePaymentMethod } from '@/services/order-completion.service';
import { providerWalletService } from '@/services/provider-wallet.service';

/** The provider's own wallet (what they owe the platform) and paying it off. Scoped by user id. */
export function useProviderWallet(userId: string | undefined) {
  const queryClient = useQueryClient();
  const key = ['provider-wallet', userId];

  const { data } = useQuery({
    queryKey: key,
    queryFn: providerWalletService.getSummary,
    enabled: Boolean(userId),
    refetchInterval: 15000,
  });

  const payDue = useMutation({
    mutationFn: (method: OnlinePaymentMethod) => providerWalletService.payDue(method),
    onSuccess: () => {
      toast.success('Due paid. Thank you!');
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) || 'Payment could not be completed');
    },
  });

  return { dueAmount: data?.dueAmount ?? 0, payDue };
}
