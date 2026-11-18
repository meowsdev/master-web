import { apiClient } from '@/lib/axios';

export type AssignmentMode = 'OFFER' | 'ASSIGN';

export interface AssignableProvider {
  /** The provider profile id the assign call is made with. */
  id: string;
  companyName: string | null;
  rating: number;
  user: { id: string; name: string | null; username: string | null; mobileNumber: string; profilePhoto: string | null };
  /** Why this provider cannot be given the order; null when they can. */
  blockedReason: string | null;
  canAssign: boolean;
  coversUpazila: boolean;
  coversDistrict: boolean;
  hasOpenOffer: boolean;
}

/* Staff-only. The backend repeats every check (who may receive an order, that it is still unaccepted). */
export const adminOrdersService = {
  getAssignableProviders: async (orderId: string) => (await apiClient.get<AssignableProvider[]>(`/admin/orders/${orderId}/assignable-providers`)).data,

  assign: async (orderId: string, providerId: string, mode: AssignmentMode) =>
    (await apiClient.post<{ orderId: string; providerId: string; mode: AssignmentMode }>(`/admin/orders/${orderId}/assign`, { providerId, mode })).data,
};
