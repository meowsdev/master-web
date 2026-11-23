import { apiClient } from '@/lib/axios';
import { PriceUnit } from '@/types/service.types';

export interface AdminFaq {
  id: string;
  question: string;
  questionBn?: string | null;
  answer: string;
  answerBn?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminVariant {
  id: string;
  name: string;
  nameBn?: string | null;
  imageUrl?: string | null;
  price: string | number;
  originalPrice?: string | number | null;
  priceUnit: PriceUnit;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminSubService {
  id: string;
  categoryId: string;
  name: string;
  nameBn?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  basePrice: string | number;
  isActive: boolean;
  sortOrder: number;
  included: string[];
  excluded: string[];
  details?: string | null;
  variants: AdminVariant[];
  faqs: AdminFaq[];
}

export interface AdminMainService {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  groupId: string | null;
  isActive: boolean;
  sortOrder: number;
  included: string[];
  excluded: string[];
  howToOrder: string[];
  details?: string | null;
  faqs: AdminFaq[];
  services: AdminSubService[];
}

export interface AdminGroup {
  id: string;
  name: string;
  nameBn?: string | null;
  iconUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  categories: AdminMainService[];
}

export type ReorderLevel = 'group' | 'mainService' | 'subService' | 'variant' | 'faq';

export interface VariantInput {
  serviceId?: string;
  name: string;
  nameBn?: string;
  price: number;
  originalPrice?: number | null;
  priceUnit?: PriceUnit;
  isActive?: boolean;
}

export interface FaqInput {
  categoryId?: string;
  serviceId?: string;
  question: string;
  answer: string;
}

/** Admin / manager writes for the four-level catalog (backend /catalog/admin). */
export const catalogAdminService = {
  tree: async () => (await apiClient.get<AdminGroup[]>('/catalog/admin/tree')).data,
  ungrouped: async () => (await apiClient.get<AdminMainService[]>('/catalog/admin/ungrouped')).data,

  createGroup: async (body: { name: string; nameBn?: string; iconUrl?: string }) => (await apiClient.post('/catalog/admin/groups', body)).data,
  updateGroup: async (id: string, body: Partial<{ name: string; nameBn: string; iconUrl: string; isActive: boolean }>) => (await apiClient.patch(`/catalog/admin/groups/${id}`, body)).data,
  deleteGroup: async (id: string) => (await apiClient.delete(`/catalog/admin/groups/${id}`)).data,

  updateMainService: async (id: string, body: Partial<{ groupId: string; included: string[]; excluded: string[]; howToOrder: string[]; details: string; isActive: boolean }>) =>
    (await apiClient.patch(`/catalog/admin/main-services/${id}`, body)).data,
  updateSubService: async (id: string, body: Partial<{ included: string[]; excluded: string[]; details: string; isActive: boolean }>) =>
    (await apiClient.patch(`/catalog/admin/sub-services/${id}`, body)).data,

  createVariant: async (body: VariantInput) => (await apiClient.post('/catalog/admin/variants', body)).data,
  updateVariant: async (id: string, body: Partial<VariantInput>) => (await apiClient.patch(`/catalog/admin/variants/${id}`, body)).data,
  deleteVariant: async (id: string) => (await apiClient.delete(`/catalog/admin/variants/${id}`)).data,

  createFaq: async (body: FaqInput) => (await apiClient.post('/catalog/admin/faqs', body)).data,
  deleteFaq: async (id: string) => (await apiClient.delete(`/catalog/admin/faqs/${id}`)).data,

  reorder: async (level: ReorderLevel, items: Array<{ id: string; sortOrder: number }>) => (await apiClient.post('/catalog/admin/reorder', { level, items })).data,
};
