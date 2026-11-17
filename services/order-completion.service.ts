import { apiClient } from '@/lib/axios';

export type CompletionPaymentMode = 'CASH' | 'ONLINE';
export type OnlinePaymentMethod = 'BKASH' | 'NAGAD' | 'CARD';

export const orderCompletionService = {
  /** Provider: the work is done; cash closes the order, online waits for the customer. */
  complete: async (orderId: string, paymentMode: CompletionPaymentMode, tipAmount?: number) => {
    const response = await apiClient.post(`/orders/${orderId}/complete`, { paymentMode, tipAmount });
    return response.data;
  },

  /** Customer: pay part of the bill early. The backend checks the amount against what is due. */
  payAdvance: async (orderId: string, amount: number, method: OnlinePaymentMethod) => {
    const response = await apiClient.post<{ advancePaid: number; dueAmount: number }>(`/orders/${orderId}/advance-payment`, { amount, method });
    return response.data;
  },

  /** Customer: Accept & Pay. The backend charges the due amount plus tip. */
  payOnline: async (orderId: string, method: OnlinePaymentMethod, tipAmount: number) => {
    const response = await apiClient.post(`/orders/${orderId}/pay-online`, { method, tipAmount });
    return response.data;
  },
};
