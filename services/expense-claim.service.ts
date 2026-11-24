import { apiClient } from '@/lib/axios';
import { ExpenseClaim, ExpenseItem } from '@/types/expense-claim.types';

/** Job costs. Who may do what (provider/technician sends, admin reviews) is checked by the backend. */
export const expenseClaimService = {
  list: async (orderId: string) => (await apiClient.get<ExpenseClaim[]>(`/orders/${orderId}/expense-claims`)).data,

  /** Costs go once per billing: after the job, and again after a revision billed extra work. */
  status: async (orderId: string) =>
    (await apiClient.get<{ canSubmit: boolean; reason: string | null; approvedCosts: number }>(`/orders/${orderId}/expense-claims/status`)).data,

  submit: async (orderId: string, items: ExpenseItem[]) => (await apiClient.post<ExpenseClaim>(`/orders/${orderId}/expense-claims`, { items })).data,

  approve: async (claimId: string, items: ExpenseItem[], note?: string) =>
    (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/approve`, { items, note })).data,

  reject: async (claimId: string, note?: string) => (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/reject`, { note })).data,
};
