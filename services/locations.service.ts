import { apiClient } from '@/lib/axios';
import { DistrictOption, UpazilaOption } from '@/types/location.types';

export const locationsService = {
  getDistricts: async () => {
    const response = await apiClient.get<DistrictOption[]>('/locations/districts');
    return response.data;
  },

  getUpazilas: async (districtId: number) => {
    const response = await apiClient.get<UpazilaOption[]>(`/locations/districts/${districtId}/upazilas`);
    return response.data;
  },
};
