'use client';

import { useQuery } from '@tanstack/react-query';
import { providerWalletService } from '@/services/provider-wallet.service';

/* The provider's own earnings and level. Keys carry the user id, so a signed-out provider's numbers never reach the next one. */
export function useProviderEarnings(userId: string, enabled: boolean) {
  return useQuery({ queryKey: ['provider-earnings', userId], queryFn: providerWalletService.getEarnings, enabled, refetchInterval: 60000 });
}

export function useProviderLevel(userId: string, enabled: boolean) {
  return useQuery({ queryKey: ['provider-level', userId], queryFn: providerWalletService.getLevel, enabled, refetchInterval: 60000 });
}
