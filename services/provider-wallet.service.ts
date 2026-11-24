import { apiClient } from '@/lib/axios';
import { OnlinePaymentMethod } from '@/services/order-completion.service';
import { NewWithdrawal, ProviderEarnings, ProviderLevelProgress, WithdrawalRequest, WithdrawalStatus } from '@/types/provider-earnings.types';

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

  listWithdrawals: async () => (await apiClient.get<WithdrawalRequest[]>('/provider-wallet/me/withdrawals')).data,

  /** The amount is held out of the wallet at once; an admin pays it or rejects it. */
  requestWithdrawal: async (input: NewWithdrawal) => (await apiClient.post<WithdrawalRequest>('/provider-wallet/me/withdrawals', input)).data,

  cancelWithdrawal: async (id: string) => (await apiClient.post<WithdrawalRequest>(`/provider-wallet/me/withdrawals/${id}/cancel`)).data,

  payDue: async (method: OnlinePaymentMethod) => {
    const response = await apiClient.post<ProviderWalletSummary>('/provider-wallet/me/pay-due', { method });
    return response.data;
  },
};

/* Admin only: every provider's withdrawal requests. The money is sent outside the app, then marked paid here. */
export const adminWithdrawalsService = {
  list: async (status?: WithdrawalStatus) => (await apiClient.get<WithdrawalRequest[]>('/admin/withdrawals', { params: status ? { status } : {} })).data,
  markPaid: async (id: string, transactionRef: string, note?: string) =>
    (await apiClient.post<WithdrawalRequest>(`/admin/withdrawals/${id}/paid`, { transactionRef, ...(note?.trim() ? { note: note.trim() } : {}) })).data,
  reject: async (id: string, reason: string) => (await apiClient.post<WithdrawalRequest>(`/admin/withdrawals/${id}/reject`, { reason })).data,
};
