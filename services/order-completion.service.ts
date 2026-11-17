import { apiClient } from '@/lib/axios';

export type CompletionPaymentMode = 'CASH' | 'ONLINE';
export type OnlinePaymentMethod = 'BKASH' | 'NAGAD' | 'CARD';

export const orderCompletionService = {
  /** Provider: the work is done; cash closes the order, online waits for the customer. */
  complete: async (orderId: string, paymentMode: CompletionPaymentMode) => {
    const response = await apiClient.post(`/orders/${orderId}/complete`, { paymentMode });
    return response.data;
  },

  /** Customer: Accept & Pay. The backend charges the due amount plus tip. */
  payOnline: async (orderId: string, method: OnlinePaymentMethod, tipAmount: number) => {
    const response = await apiClient.post(`/orders/${orderId}/pay-online`, { method, tipAmount });
    return response.data;
  },
};
