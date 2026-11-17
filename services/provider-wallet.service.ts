import { apiClient } from '@/lib/axios';
import { OnlinePaymentMethod } from '@/services/order-completion.service';

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

  payDue: async (method: OnlinePaymentMethod) => {
    const response = await apiClient.post<ProviderWalletSummary>('/provider-wallet/me/pay-due', { method });
    return response.data;
  },
};
