import { apiClient } from '@/lib/axios';
import { Order, OrderStatus, PaymentStatus } from '@/types/order.types';

export interface CreateCustomOrderDto {
  providerId: string;
  customerId: string;
  serviceId: string;
  technicianId?: string;
  originalPrice: number;
  adminCommission?: number;
  additionalPrice?: number;
  advancePaid?: number;
}

export interface UpdateOrderDto {
  technicianId?: string;
  originalPrice?: number;
  adminCommission?: number;
  additionalPrice?: number;
  advancePaid?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export const ordersService = {
  getOrders: async () => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (dto: CreateCustomOrderDto) => {
    const response = await apiClient.post<Order>('/orders', dto);
    return response.data;
  },

  updateOrder: async (id: string, dto: UpdateOrderDto) => {
    const response = await apiClient.patch<Order>(`/orders/${id}`, dto);
    return response.data;
  },

  updateStatus: async (id: string, orderStatus: OrderStatus) => {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, {
      orderStatus,
    });
    return response.data;
  },

  acceptPrice: async (id: string) => {
    const response = await apiClient.patch<Order>(`/orders/${id}/accept-price`);
    return response.data;
  },

  rejectPrice: async (id: string) => {
    const response = await apiClient.patch<Order>(`/orders/${id}/reject-price`);
    return response.data;
  },
};
