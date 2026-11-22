'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderCompletionService } from '@/services/order-completion.service';
import { revisionService } from '@/services/revision.service';

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/** Every order list and order screen, so whoever is looking sees the revision at once. */
const isOrderQuery = (key: readonly unknown[]) => typeof key[0] === 'string' && key[0].includes('order');

/* Sending an order back for revision (customer / admin) and finishing it (provider). The backend checks who and when. */
export function useOrderRevision(orderId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ predicate: (query) => isOrderQuery(query.queryKey) });

  const request = useMutation({
    mutationFn: (issueDescription: string) => revisionService.createRevision({ orderId, issueDescription }),
    onSuccess: () => {
      toast.success('অর্ডারটি রিভিশনে পাঠানো হয়েছে। প্রোভাইডার আবার কাজটি করবেন।');
      void refresh();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'রিভিশন পাঠানো যায়নি।')),
  });

  const finish = useMutation({
    mutationFn: () => orderCompletionService.finishRevision(orderId),
    onSuccess: () => {
      toast.success('রিভিশন সম্পন্ন হয়েছে।');
      void refresh();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'রিভিশন শেষ করা যায়নি।')),
  });

  return { request, finish };
}
