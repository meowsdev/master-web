import { apiClient } from '@/lib/axios';

export interface CreateReviewDto {
  orderId: string;
  providerId: string;
  customerRating: number;
  providerRating?: number;
  reviewComment?: string;
  continueWithProvider?: boolean;
}

export const reviewService = {
  createReview: async (dto: CreateReviewDto) => {
    const response = await apiClient.post('/provider-review', dto);
    return response.data;
  },

  getProviderReviews: async (providerId: string) => {
    const response = await apiClient.get(
      `/provider-review/provider/${providerId}`
    );
    return response.data;
  },
};
