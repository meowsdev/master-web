import { apiClient } from '@/lib/axios';
import { MyReviews } from '@/types/review.types';

export interface CreateReviewDto {
  orderId: string;
  providerId?: string;
  customerId?: string;
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

  /** The signed-in person's own average and latest reviews, with who wrote each. */
  getMyReviews: async () => {
    const response = await apiClient.get<MyReviews>('/provider-review/me/received');
    return response.data;
  },

  getProviderReviews: async (providerId: string) => {
    const response = await apiClient.get(
      `/provider-review/provider/${providerId}`
    );
    return response.data;
  },
};
