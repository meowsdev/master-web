import { apiClient } from '@/lib/axios';
import { OnlinePaymentMethod } from '@/services/order-completion.service';
import { ProviderEarnings, ProviderLevelProgress } from '@/types/provider-earnings.types';

export interface ProviderWalletSummary {
  walletBalance: number;
  /** What the provider owes the platform (commission on cash jobs); 0 when nothing is due. */
  dueAmount: number;
}

export const providerWalletService = {
  getSummary: async () => {
    const response = await apiClient.get<ProviderWalletSummary>('/provider-wallet/me');
    return response.data;
  },

  getEarnings: async () => (await apiClient.get<ProviderEarnings>('/provider-wallet/me/earnings')).data,

  getLevel: async () => (await apiClient.get<ProviderLevelProgress>('/provider-leveling/me')).data,

  payDue: async (method: OnlinePaymentMethod) => {
    const response = await apiClient.post<ProviderWalletSummary>('/provider-wallet/me/pay-due', { method });
    return response.data;
  },
};
