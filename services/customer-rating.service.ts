import { apiClient } from '@/lib/axios';

export interface CustomerRatingRecord {
  /** null when the provider has not rated this customer yet. */
  rating: number | null;
  comment?: string | null;
}

export const customerRatingService = {
  get: async (orderId: string) => {
    const response = await apiClient.get<CustomerRatingRecord>(`/orders/${orderId}/customer-rating`);
    return response.data;
  },

  rate: async (orderId: string, rating: number, comment?: string) => {
    const response = await apiClient.post<CustomerRatingRecord>(`/orders/${orderId}/customer-rating`, { rating, comment });
    return response.data;
  },
};
