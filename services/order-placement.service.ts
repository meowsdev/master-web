import { apiClient } from '@/lib/axios';
import { Order } from '@/types/order.types';
import { OrderCatalog, PlaceOrderRequest, PriceQuote, QuoteRequest } from '@/types/order-placement.types';

/** An admin's order for a service that is not in the catalog. */
export interface AdminCustomOrderRequest {
  customerPhone: string;
  customerName?: string;
  mainServiceName: string;
  subServiceName: string;
  description?: string;
  price: number;
  districtId: number;
  upazilaId: number;
  addressDetail: string;
  scheduledDate: string;
  timeSlot: string;
}

/** Who books for a customer by phone number: staff (dispatched as usual) or a provider (the order is theirs). */
export type OrderBooker = 'admin' | 'provider';

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

  /**
   * A service that is not in the catalog, typed by hand with its price. An admin's goes to every provider in the
   * area; a provider's (`by: 'provider'`) is theirs at once.
   */
  placeCustomOrderForCustomer: async (body: AdminCustomOrderRequest, by: OrderBooker = 'admin') => {
    const response = await apiClient.post<{ order: Order; quote: PriceQuote }>(`/order-placement/${by}/custom`, body);
    return response.data;
  },

  /** The same order, placed for a customer identified by phone number (created if new), by an admin or a provider. */
  placeOrderForCustomer: async (request: PlaceOrderRequest, customer: { customerPhone: string; customerName?: string }, by: OrderBooker = 'admin') => {
    const response = await apiClient.post<{ order: Order; quote: PriceQuote }>(`/order-placement/${by}`, { ...request, ...customer });
    return response.data;
  },

  placeOrder: async (request: PlaceOrderRequest) => {
    const response = await apiClient.post<{ order: Order; quote: PriceQuote }>('/order-placement', request);
    return response.data;
  },
};
