import { apiClient } from '@/lib/axios';

export interface CreateRevisionDto {
  orderId: string;
  issueDescription: string;
  attachedImages?: string[];
}

export const revisionService = {
  createRevision: async (dto: CreateRevisionDto) => {
    const response = await apiClient.post('/service-revision', dto);
    return response.data;
  },

  postFeedback: async (id: string, continueWithProvider: boolean) => {
    const response = await apiClient.post(`/service-revision/${id}/feedback`, {
      continueWithProvider,
    });
    return response.data;
  },
};
