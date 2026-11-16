import { apiClient } from '@/lib/axios';
import { Order } from '@/types/order.types';
import { OrderCatalog, PlaceOrderRequest, PriceQuote, QuoteRequest } from '@/types/order-placement.types';

export const orderPlacementService = {
  getCatalog: async () => {
    const response = await apiClient.get<OrderCatalog>('/order-placement/catalog');
    return response.data;
  },

  getQuote: async (request: QuoteRequest) => {
    const response = await apiClient.post<PriceQuote>('/order-placement/quote', request);
    return response.data;
  },

  placeOrder: async (request: PlaceOrderRequest) => {
    const response = await apiClient.post<{ order: Order; quote: PriceQuote }>('/order-placement', request);
    return response.data;
  },
};
