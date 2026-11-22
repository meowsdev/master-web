import { apiClient } from '@/lib/axios';
import { ExpenseClaim, ExpenseItem } from '@/types/expense-claim.types';

/** Job costs. Who may do what (provider/technician sends, admin reviews) is checked by the backend. */
export const expenseClaimService = {
  list: async (orderId: string) => (await apiClient.get<ExpenseClaim[]>(`/orders/${orderId}/expense-claims`)).data,

  submit: async (orderId: string, items: ExpenseItem[]) => (await apiClient.post<ExpenseClaim>(`/orders/${orderId}/expense-claims`, { items })).data,

  approve: async (claimId: string, items: ExpenseItem[], note?: string) =>
    (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/approve`, { items, note })).data,

  reject: async (claimId: string, note?: string) => (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/reject`, { note })).data,
};
