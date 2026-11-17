import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderCompletionService, OnlinePaymentMethod } from '@/services/order-completion.service';

/** The customer's online payment. Success refetches the order, which is then COMPLETED. */
export function useOrderPayment(orderId: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ method, tipAmount }: { method: OnlinePaymentMethod; tipAmount: number }) =>
      orderCompletionService.payOnline(orderId, method, tipAmount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] }),
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) || 'Payment could not be completed');
    },
  });
}
