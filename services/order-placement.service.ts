import { apiClient } from '@/lib/axios';
import { Order } from '@/types/order.types';
import { OrderCatalog, PlaceOrderRequest, PriceQuote, QuoteRequest } from '@/types/order-placement.types';

/** Who a phone number is, for the admin's New order form. `found: false` = a new number. */
export type CustomerLookup =
  | { found: false }
  | {
      found: true;
      name: string | null;
      role: string;
      status: string;
      districtId: number | null;
      upazilaId: number | null;
      addressDetail: string | null;
    };

export const orderPlacementService = {
  getCatalog: async () => {
    const response = await apiClient.get<OrderCatalog>('/order-placement/catalog');
    return response.data;
  },

  getQuote: async (request: QuoteRequest) => {
    const response = await apiClient.post<PriceQuote>('/order-placement/quote', request);
    return response.data;
  },

  /** Admin: who this number is, with the customer's name and last place, to fill the New order form. */
  lookupCustomer: async (phone: string) => {
    const response = await apiClient.get<CustomerLookup>('/order-placement/admin/customer', { params: { phone } });
    return response.data;
  },

  /** Admin: the same order, placed for a customer identified by phone number (created if new). */
  placeOrderForCustomer: async (request: PlaceOrderRequest, customer: { customerPhone: string; customerName?: string }) => {
    const response = await apiClient.post<{ order: Order; quote: PriceQuote }>('/order-placement/admin', { ...request, ...customer });
    return response.data;
  },

  placeOrder: async (request: PlaceOrderRequest) => {
    const response = await apiClient.post<{ order: Order; quote: PriceQuote }>('/order-placement', request);
    return response.data;
  },
};
