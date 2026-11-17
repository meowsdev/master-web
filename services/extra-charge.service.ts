import { apiClient } from '@/lib/axios';
import { ExtraChargeItem, ExtraChargeRequest } from '@/types/extra-charge.types';

export const extraChargeService = {
  list: async (orderId: string) => {
    const response = await apiClient.get<ExtraChargeRequest[]>(`/orders/${orderId}/extra-charges`);
    return response.data;
  },

  request: async (orderId: string, items: ExtraChargeItem[]) => {
    const response = await apiClient.post<ExtraChargeRequest>(`/orders/${orderId}/extra-charges`, { items });
    return response.data;
  },

  approve: async (requestId: string) => {
    const response = await apiClient.patch<ExtraChargeRequest>(`/orders/extra-charges/${requestId}/approve`);
    return response.data;
  },

  reject: async (requestId: string) => {
    const response = await apiClient.patch<ExtraChargeRequest>(`/orders/extra-charges/${requestId}/reject`);
    return response.data;
  },
};
