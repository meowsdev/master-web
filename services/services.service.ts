import { apiClient } from '@/lib/axios';
import { Service, ServiceCategory } from '@/types/service.types';

export interface DiscoverProvidersParams {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  search?: string;
  serviceId?: string;
  categoryId?: string;
}

export interface DiscoveredProvider {
  id: string;
  userId: string;
  rating: number;
  isAvailable: boolean;
  level: string;
  experienceYears: number;
  distanceKm: number | null;
  user: {
    id: string;
    name: string | null;
    profilePhoto: string | null;
    mobileNumber: string;
    addresses: Array<{
      id: string;
      addressText: string;
      latitude: number | null;
      longitude: number | null;
      isDefault?: boolean;
    }>;
  };
}

export const servicesService = {
  getCategories: async () => {
    const response = await apiClient.get<ServiceCategory[]>('/category/all');
    return response.data;
  },

  getServices: async (categoryId?: string) => {
    const response = await apiClient.get<Service[]>('/service/all', {
      params: { categoryId },
    });
    return response.data;
  },

  getServiceById: async (id: string) => {
    const response = await apiClient.get<Service>(`/service/${id}`);
    return response.data;
  },

  discoverProviders: async (params: DiscoverProvidersParams) => {
    const response = await apiClient.get<DiscoveredProvider[]>(
      '/service/providers/discover',
      { params }
    );
    return response.data;
  },
};
