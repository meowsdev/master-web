'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewService } from '@/services/review.service';

/** Admin: hide a customer review or show it again; every list and rating that shows it is refreshed. */
export function useReviewVisibility() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ reviewId, isPublic }: { reviewId: string; isPublic: boolean }) => reviewService.setVisibility(reviewId, isPublic),
    onSuccess: (result) => {
      toast.success(result.isPublic ? 'রিভিউ আবার পাবলিক হয়েছে।' : 'রিভিউ লুকানো হয়েছে, কাস্টমার আর দেখবে না।');
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = String(query.queryKey[0] ?? '');
          return key.startsWith('admin-member') || key.includes('review') || key.startsWith('catalog-main-service') || key === 'super-app-services';
        },
      });
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) ?? 'করা যায়নি');
    },
  });
  return { toggle: (reviewId: string, isPublic: boolean) => mutation.mutate({ reviewId, isPublic }), busyReviewId: mutation.isPending ? mutation.variables?.reviewId ?? null : null };
}
