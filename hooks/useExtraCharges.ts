import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extraChargeService } from '@/services/extra-charge.service';

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(message) ? message[0] : message || fallback;
};

/**
 * Extra-charge requests of one order, plus the customer's approve/reject actions.
 * Query keys carry the user id so one login never sees another's cache (rule 7).
 * Approving changes the order total on the backend, so the order lists are refetched.
 */
export function useExtraCharges(orderId: string, userId: string) {
  const queryClient = useQueryClient();
  const requestsKey = ['extra-charges', userId, orderId];

  const { data: requests = [] } = useQuery({
    queryKey: requestsKey,
    queryFn: () => extraChargeService.list(orderId),
    refetchInterval: 4000,
  });

  const refreshAfterAnswer = () => {
    queryClient.invalidateQueries({ queryKey: requestsKey });
    queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] });
  };

  const approve = useMutation({
    mutationFn: extraChargeService.approve,
    onSuccess: refreshAfterAnswer,
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not approve the extra charge')),
  });

  const reject = useMutation({
    mutationFn: extraChargeService.reject,
    onSuccess: refreshAfterAnswer,
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not reject the extra charge')),
  });

  return { requests, approve, reject, isAnswering: approve.isPending || reject.isPending };
}
