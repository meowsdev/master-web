import { apiClient } from '@/lib/axios';
import { Order, OrderStatus, OrderStatusLogEntry, OrderStatusRequestEntry, PaymentStatus } from '@/types/order.types';

export interface CreateCustomOrderDto {
  providerId?: string;
  customerId?: string;
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

  getProviderOrders: async (providerId: string) => {
    const response = await apiClient.get<Order[]>(`/orders/provider/${providerId}`);
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

  /** The order's status box: a new status, or hold / resume (onHold). The reason is required and logged. */
  changeStatus: async (id: string, body: { status?: OrderStatus; onHold?: boolean; reason: string }) => {
    const response = await apiClient.patch<Order>(`/orders/${id}/status-change`, body);
    return response.data;
  },

  /** Who changed the order's status and why, newest first. */
  getStatusLog: async (id: string) => (await apiClient.get<OrderStatusLogEntry[]>(`/orders/${id}/status-log`)).data,

  /** Hold / cancel requests of an order with the admin's answers (provider, technician and staff only). */
  getStatusRequests: async (id: string) => (await apiClient.get<OrderStatusRequestEntry[]>(`/orders/${id}/status-requests`)).data,

  /** Admin: carry out a provider's / technician's hold or cancel request. */
  approveStatusRequest: async (requestId: string) => (await apiClient.patch<Order>(`/orders/status-requests/${requestId}/approve`)).data,

  /** Admin: turn the request down, saying why. */
  rejectStatusRequest: async (requestId: string, note: string) => (await apiClient.patch<Order>(`/orders/status-requests/${requestId}/reject`, { note })).data,

  /** Provider: turn down the offer of a new order. The order stays open for the other providers. */
  declineOffer: async (id: string) => {
    const response = await apiClient.post<{ declined: true }>(`/orders/${id}/decline-offer`);
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
