'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportChatService } from '@/services/support-chat.service';
import { SupportMemberRole } from '@/types/support-chat.types';

// New messages arrive by polling: support chat is low-traffic, so no socket room is needed for it.
const OPEN_CHAT_POLL_MS = 4000;
const LIST_POLL_MS = 15000;

/* Every query key carries the user id (AGENTS.md §7) so one account never reads another's cache. */

export function useSupportDirectory(userId: string, role: SupportMemberRole, search: string) {
  return useQuery({
    queryKey: ['support-directory', userId, role, search],
    queryFn: () => supportChatService.getDirectory(role, search),
    refetchInterval: LIST_POLL_MS,
  });
}

/** A provider/customer's own thread id and unread count, for the rail's dot. */
export function useMySupportThread(userId: string, isEnabled: boolean) {
  return useQuery({
    queryKey: ['support-mine', userId],
    queryFn: supportChatService.getMine,
    enabled: isEnabled,
    refetchInterval: LIST_POLL_MS,
  });
}

/** Messages of one thread, kept fresh while it is open, and marked read as new ones arrive. */
export function useSupportMessages(userId: string, threadId: string | null) {
  const queryClient = useQueryClient();
  const messagesQuery = useQuery({
    queryKey: ['support-messages', userId, threadId],
    queryFn: () => supportChatService.getMessages(threadId!),
    enabled: threadId !== null,
    refetchInterval: OPEN_CHAT_POLL_MS,
  });

  const messageCount = messagesQuery.data?.length ?? 0;
  useEffect(() => {
    if (!threadId || messageCount === 0) return;
    void supportChatService.markRead(threadId).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['support-directory', userId] });
      void queryClient.invalidateQueries({ queryKey: ['support-mine', userId] });
    });
  }, [threadId, messageCount, userId, queryClient]);

  return messagesQuery;
}

export function useSendSupportMessage(userId: string, threadId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => supportChatService.sendMessage(threadId!, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['support-messages', userId, threadId] });
      void queryClient.invalidateQueries({ queryKey: ['support-directory', userId] });
    },
  });
}
