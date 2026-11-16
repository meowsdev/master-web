import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { ChatSession } from '@/types/chat.types';
import { Service } from '@/types/service.types';

interface UseServiceSelectionReadSyncArgs {
  userId?: string;
  conversationByServiceId: Map<string, ChatSession>;
  selectService: (service: Service) => void;
}

/**
 * Opening a service chat also clears its unread badge: the cache is zeroed
 * immediately so the list feels instant, then the backend is told.
 */
export function useServiceSelectionReadSync({
  userId,
  conversationByServiceId,
  selectService,
}: UseServiceSelectionReadSyncArgs) {
  const queryClient = useQueryClient();

  return useCallback(
    (service: Service) => {
      selectService(service);
      const conversation = conversationByServiceId.get(service.id);
      if (!conversation || (conversation.unreadCount ?? 0) === 0) return;

      queryClient.setQueryData<ChatSession[]>(['user-conversations', userId], (old = []) =>
        Array.isArray(old) ? old.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c)) : old
      );
      chatService
        .markConversationAsRead(conversation.id)
        .then(() => queryClient.invalidateQueries({ queryKey: ['user-conversations', userId] }))
        .catch((error) => console.error('Failed to mark conversation as read', error));
    },
    [selectService, conversationByServiceId, queryClient, userId]
  );
}
