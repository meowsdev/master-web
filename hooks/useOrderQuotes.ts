'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogService } from '@/services/catalog.service';
import { orderErrorMessage } from '@/hooks/useOrderPlaceFields';
import { Order } from '@/types/order.types';

/**
 * The prices sent for a custom order, and the customer's answer. While the order waits for a price the list is
 * checked every 10 seconds, so a quote the provider sends from the site shows up without a reload.
 */
export function useOrderQuotes(order: Pick<Order, 'id' | 'isPricePending'>, userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['order-quotes', userId, order.id];
  const { data: quotes = [] } = useQuery({
    queryKey,
    queryFn: () => catalogService.getQuotes(order.id),
    enabled: Boolean(userId),
    refetchInterval: order.isPricePending ? 10_000 : false,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
    // The order's price and status change with the answer: tabs, the order card and the list follow.
    queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] });
  };

  const accept = useMutation({
    mutationFn: catalogService.acceptQuote,
    onSuccess: () => {
      toast.success('দাম Accept হয়েছে, কাজ শুরু হবে');
      refresh();
    },
    onError: (error) => toast.error(orderErrorMessage(error, 'Could not accept the price')),
  });
  const reject = useMutation({
    mutationFn: catalogService.rejectQuote,
    onSuccess: () => {
      toast.info('দাম Reject করা হয়েছে, অর্ডার বাতিল। কোনো চার্জ নেই।');
      refresh();
    },
    onError: (error) => toast.error(orderErrorMessage(error, 'Could not reject the price')),
  });

  return { quotes, accept, reject, isAnswering: accept.isPending || reject.isPending, refresh };
}
