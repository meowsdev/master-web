'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getChatSocket, disconnectChatSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { Message, ChatSession } from '@/types/chat.types';
import { toast } from 'sonner';

interface UseChatSocketProps {
  activeSessionId: string | null;
}

export function useChatSocket({ activeSessionId }: UseChatSocketProps) {
  const queryClient = useQueryClient();
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentJoinedSessionRef = useRef<string | null>(null);

  // Initialize socket connection & global event listeners
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectChatSocket();
      setIsConnected(false);
      return;
    }

    const socket = getChatSocket(accessToken);
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      // Re-join current active conversation if any
      if (activeSessionId) {
        socket.emit('joinConversation', { conversationId: activeSessionId });
        currentJoinedSessionRef.current = activeSessionId;
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (newMsg: Message) => {
      if (!newMsg || !newMsg.sessionId) return;

      // 1. If message belongs to active chat session, append/update React Query cache instantly
      if (activeSessionId && newMsg.sessionId === activeSessionId) {
        queryClient.setQueryData<Message[]>(
          ['chat-messages', activeSessionId],
          (old = []) => {
            // Check if already in cache (by real ID or temporary optimistic ID)
            const exists = old.some(
              (m) => m.id === newMsg.id || (m.id.startsWith('temp-') && m.text === newMsg.text && m.senderId === newMsg.senderId)
            );
            if (exists) {
              return old.map((m) =>
                m.id === newMsg.id || (m.id.startsWith('temp-') && m.text === newMsg.text && m.senderId === newMsg.senderId)
                  ? newMsg
                  : m
              );
            }
            return [...old, newMsg];
          }
        );
      }

      // 2. Update user-conversations query data so sidebar immediately reflects the latest message
      queryClient.setQueryData<ChatSession[]>(['user-conversations'], (oldConvs = []) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        const convIndex = oldConvs.findIndex((c) => c.id === newMsg.sessionId);
        if (convIndex === -1) {
          // If conversation isn't in sidebar yet, refetch conversations
          queryClient.invalidateQueries({ queryKey: ['user-conversations'] });
          return oldConvs;
        }

        const updatedConv = {
          ...oldConvs[convIndex],
          updatedAt: newMsg.createdAt,
          messages: [newMsg],
        };

        const remaining = oldConvs.filter((_, idx) => idx !== convIndex);
        return [updatedConv, ...remaining];
      });

      // 3. Invalidate orders query if an order was confirmed via system message
      if (newMsg.type === 'SYSTEM') {
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      }

      // 4. Toast notification if message is from the other person and not currently focused/sent by self
      if (user?.id && newMsg.senderId !== user.id) {
        const senderName = (newMsg as any).sender?.name || 'Counselor';
        if (newMsg.type === 'OFFER') {
          toast.info(`💼 New Special Offer from ${senderName}!`, { duration: 4000 });
        } else if (newMsg.type === 'SYSTEM') {
          toast.success(`🎉 Order update in chat!`);
        }
      }
    };

    const handleUserTyping = (data: { conversationId: string; userId: string; userName: string }) => {
      if (data.conversationId === activeSessionId && data.userId !== user?.id) {
        setTypingUser(data.userName || 'Counselor');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeSessionId && data.userId !== user?.id) {
        setTypingUser(null);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    };

    const handleConversationUpdated = (payload: { sessionId: string; message: Message }) => {
      queryClient.invalidateQueries({ queryKey: ['user-conversations'] });
      if (activeSessionId && payload.sessionId === activeSessionId) {
        handleNewMessage(payload.message);
      }
    };

    if (socket.connected) {
      setIsConnected(true);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('newMessage', handleNewMessage);
    socket.on('conversationUpdated', handleConversationUpdated);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('newMessage', handleNewMessage);
      socket.off('conversationUpdated', handleConversationUpdated);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [isAuthenticated, accessToken, activeSessionId, user?.id, queryClient]);

  // Handle joining / leaving room when activeSessionId changes
  useEffect(() => {
    const socket = getChatSocket(accessToken || undefined);
    if (!socket || !socket.connected || !activeSessionId) return;

    // Leave previous room if changed
    if (currentJoinedSessionRef.current && currentJoinedSessionRef.current !== activeSessionId) {
      socket.emit('leaveRoom', { conversationId: currentJoinedSessionRef.current });
    }

    // Join new room
    socket.emit('joinConversation', { conversationId: activeSessionId });
    currentJoinedSessionRef.current = activeSessionId;

    return () => {
      if (activeSessionId) {
        socket.emit('leaveRoom', { conversationId: activeSessionId });
      }
    };
  }, [activeSessionId, accessToken, isConnected]);

  // Typing emitter
  const emitTyping = useCallback(() => {
    const socket = getChatSocket(accessToken || undefined);
    if (socket && socket.connected && activeSessionId) {
      socket.emit('typing', { conversationId: activeSessionId });
    }
  }, [activeSessionId, accessToken]);

  const emitStopTyping = useCallback(() => {
    const socket = getChatSocket(accessToken || undefined);
    if (socket && socket.connected && activeSessionId) {
      socket.emit('stopTyping', { conversationId: activeSessionId });
    }
  }, [activeSessionId, accessToken]);

  return {
    isConnected,
    typingUser,
    emitTyping,
    emitStopTyping,
  };
}
