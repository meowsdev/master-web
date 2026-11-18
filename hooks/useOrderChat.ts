'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatService } from '@/services/chat.service';
import { Order } from '@/types/order.types';

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(message) ? message[0] : message || fallback;
};

/**
 * The messages of one order's tab, and sending into it, for either side of the chat.
 * The customer opens (or creates) their per-service conversation; the provider opens the same one
 * through their order, and the backend lets them in only for orders they handle (so does a technician put on
 * the order). An admin opens the
 * existing one for any order.
 * Messages carry the order id, so they never mix with General Chat. Keys carry the user id (rule 7).
 */
export function useOrderChat(order: Order, userId: string, viewer: 'CUSTOMER' | 'PROVIDER' | 'TECHNICIAN' | 'ADMIN') {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const serviceId = order.service?.id ?? order.serviceId;

  const { data: conversation } = useQuery({
    queryKey: ['order-conversation', userId, viewer === 'CUSTOMER' ? order.service?.categoryId : order.id],
    queryFn: () => (viewer === 'CUSTOMER' ? chatService.getOrCreateConversation({ serviceId }) : chatService.getOrderConversation(order.id)),
    staleTime: Infinity,
  });

  const messagesKey = ['order-chat-messages', userId, order.id];
  const { data: messages = [] } = useQuery({
    queryKey: messagesKey,
    queryFn: () => chatService.getMessages(conversation!.id, order.id),
    enabled: Boolean(conversation),
    refetchInterval: 4000,
  });

  const sendMessage = useMutation({
    mutationFn: (text: string) => chatService.sendMessage({ conversationId: conversation!.id, orderId: order.id, text }),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: messagesKey });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Message could not be sent')),
  });

  const submit = () => {
    if (draft.trim() && conversation) sendMessage.mutate(draft.trim());
  };

  return {
    messages,
    draft,
    setDraft,
    submit,
    canSend: Boolean(draft.trim() && conversation) && !sendMessage.isPending,
  };
}
