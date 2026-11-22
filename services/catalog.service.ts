import { apiClient } from '@/lib/axios';
import {
  CatalogGroup,
  CatalogMainService,
  CatalogMainServiceDetail,
  CatalogReviewPage,
  CatalogSubServiceDetail,
  OrderQuote,
} from '@/types/catalog.types';
import { Order } from '@/types/order.types';
import { OrderAnswer, PriceQuote } from '@/types/order-placement.types';

export interface CartItemRequest {
  variantId: string;
  quantity: number;
}

/** Where and when the work is done: shared by a cart order and a custom order. */
export interface OrderPlaceFields {
  districtId: number;
  upazilaId: number;
  addressDetail: string;
  scheduledDate: string;
  timeSlot: string;
  imageUrls?: string[];
}

export interface PlaceCartRequest extends OrderPlaceFields {
  categoryId: string;
  items: CartItemRequest[];
  answers?: OrderAnswer[];
  description?: string;
}

export interface PlaceCustomRequest extends OrderPlaceFields {
  categoryId: string;
  description: string;
}

/** Public reads of the four-level catalog, plus the cart / custom order and quote calls that go with it. */
export const catalogService = {
  getGroups: async () => (await apiClient.get<CatalogGroup[]>('/catalog/groups')).data,

  getMainServices: async (groupId?: string) =>
    (await apiClient.get<CatalogMainService[]>('/catalog/main-services', { params: groupId ? { groupId } : {} })).data,

  getMainService: async (id: string) => (await apiClient.get<CatalogMainServiceDetail>(`/catalog/main-services/${id}`)).data,

  getSubService: async (id: string) => (await apiClient.get<CatalogSubServiceDetail>(`/catalog/sub-services/${id}`)).data,

  getSubServiceReviews: async (id: string, page: number) =>
    (await apiClient.get<CatalogReviewPage>(`/catalog/sub-services/${id}/reviews`, { params: { page } })).data,

  quoteCart: async (body: { categoryId: string; items: CartItemRequest[]; answers?: OrderAnswer[] }) =>
    (await apiClient.post<PriceQuote>('/order-placement/cart/quote', body)).data,

  placeCart: async (body: PlaceCartRequest) => (await apiClient.post<{ order: Order; quote: PriceQuote }>('/order-placement/cart', body)).data,

  placeCustom: async (body: PlaceCustomRequest) => (await apiClient.post<{ order: Order; quote: PriceQuote }>('/order-placement/custom', body)).data,

  getQuotes: async (orderId: string) => (await apiClient.get<OrderQuote[]>(`/orders/${orderId}/quotes`)).data,

  sendQuote: async (orderId: string, body: { items: Array<{ label: string; amount: number }>; note?: string }) =>
    (await apiClient.post<OrderQuote>(`/orders/${orderId}/quotes`, body)).data,

  acceptQuote: async (quoteId: string) => (await apiClient.patch<OrderQuote>(`/orders/quotes/${quoteId}/accept`)).data,

  rejectQuote: async (quoteId: string) => (await apiClient.patch<OrderQuote>(`/orders/quotes/${quoteId}/reject`)).data,
};
