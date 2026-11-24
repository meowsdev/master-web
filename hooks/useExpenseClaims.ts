'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { expenseClaimService } from '@/services/expense-claim.service';
import { ExpenseItem } from '@/types/expense-claim.types';

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/**
 * An order's job-cost claims and what can be done with them: the provider / technician sends,
 * an admin approves (with reviewed amounts) or rejects. Keys carry the user id (one login, one cache).
 */
export function useExpenseClaims(orderId: string, userId: string) {
  const queryClient = useQueryClient();
  const key = ['expense-claims', userId, orderId];

  const { data: claims = [] } = useQuery({
    queryKey: key,
    queryFn: () => expenseClaimService.list(orderId),
    refetchInterval: 10000,
  });

  const { data: status } = useQuery({
    queryKey: [...key, 'status'],
    queryFn: () => expenseClaimService.status(orderId),
    refetchInterval: 10000,
  });

  // The commission (and a cash provider's due) changes on approval, so the order lists and wallet refresh too.
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key });
    void queryClient.invalidateQueries({ predicate: (query) => typeof query.queryKey[0] === 'string' && (query.queryKey[0].includes('order') || query.queryKey[0] === 'provider-wallet') });
  };

  const submit = useMutation({
    mutationFn: (items: ExpenseItem[]) => expenseClaimService.submit(orderId, items),
    onSuccess: () => {
      toast.success('খরচের হিসাব এডমিনের কাছে রিভিউয়ের জন্য পাঠানো হয়েছে।');
      refresh();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'খরচ পাঠানো যায়নি।')),
  });

  const approve = useMutation({
    mutationFn: ({ claimId, items, note }: { claimId: string; items: ExpenseItem[]; note?: string }) => expenseClaimService.approve(claimId, items, note),
    onSuccess: () => {
      toast.success('খরচ অনুমোদিত। কমিশন নতুন করে হিসাব হয়েছে।');
      refresh();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'অনুমোদন করা যায়নি।')),
  });

  const reject = useMutation({
    mutationFn: ({ claimId, note }: { claimId: string; note?: string }) => expenseClaimService.reject(claimId, note),
    onSuccess: () => {
      toast.info('খরচের হিসাব ফেরত পাঠানো হয়েছে।');
      refresh();
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'ফেরত পাঠানো যায়নি।')),
  });

  // The backend decides: none waiting, and nothing approved yet or a revision billed extra work since.
  const canSubmit = status?.canSubmit ?? false;
  /** Costs approved by earlier claims (the job's, before a revision's extra work). */
  const approvedCosts = status?.approvedCosts ?? 0;
  return { claims, canSubmit, approvedCosts, submit, approve, reject };
}
