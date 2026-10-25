import { apiClient } from '@/lib/axios';
import { Service } from '@/types/service.types';

export interface ServiceAssigneeItem {
  id: string;
  userId: string;
  serviceId: string;
  isActive: boolean;
  service?: Service;
}

export const serviceAssigneeService = {
  getMySkills: async (): Promise<ServiceAssigneeItem[]> => {
    const response = await apiClient.get<ServiceAssigneeItem[]>('/service-assignee/my-skills');
    return response.data;
  },

  syncMySkills: async (serviceIds: string[]): Promise<ServiceAssigneeItem[]> => {
    const response = await apiClient.post<ServiceAssigneeItem[]>('/service-assignee/sync-my-skills', {
      serviceIds,
    });
    return response.data;
  },
};
