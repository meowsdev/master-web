import { apiClient } from '@/lib/axios';

/** One upazila a provider takes orders in (the district is kept so offers can fall back to the whole district). */
export interface ProviderServiceArea {
  districtId: number;
  upazilaId: number;
}

export const providerAreasService = {
  getMyAreas: async () => (await apiClient.get<ProviderServiceArea[]>('/providers/me/service-areas')).data,

  /** Replaces the whole set; the backend validates every district/upazila pair. */
  saveMyAreas: async (areas: ProviderServiceArea[]) =>
    (await apiClient.put<ProviderServiceArea[]>('/providers/me/service-areas', { areas })).data,
};
