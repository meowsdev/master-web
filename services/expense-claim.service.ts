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

  /** Admin: back to the provider, with a note and (optionally) the amounts the admin thinks are right. */
  reject: async (claimId: string, note?: string, items?: ExpenseItem[]) =>
    (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/reject`, { note, items })).data,

  /** Provider: accept (amounts may change) and pass it to the admin. */
  providerAccept: async (claimId: string, items: ExpenseItem[], note?: string) =>
    (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/provider-accept`, { items, note })).data,

  /** Provider: send the technician's costs back to them. */
  providerReturn: async (claimId: string, note?: string) =>
    (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/provider-return`, { note })).data,

  /** Technician: change the costs the provider sent back and send them to the provider again. */
  resubmit: async (claimId: string, items: ExpenseItem[]) =>
    (await apiClient.patch<ExpenseClaim>(`/orders/expense-claims/${claimId}/resubmit`, { items })).data,
};
