'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/super-app.types';

interface UseChatStorageProps {
  userId?: string | null;
}

/** Older chats saved the auto greeting and service card (init-1 / init-2); they are gone for good now. */
const withoutGreetings = (stored: Record<string, ChatMessage[]>) =>
  Object.fromEntries(
    Object.entries(stored).map(([serviceId, messages]) => [serviceId, messages.filter((message) => !/^init-\d+$/.test(message.id))]),
  );

/** A saved map from localStorage, or empty (on the server, nothing saved, or unreadable). */
function readSaved<T extends object>(key: string, clean?: (saved: T) => T): T {
  if (typeof window === 'undefined') return {} as T;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return {} as T;
    const parsed = JSON.parse(saved) as T;
    return clean ? clean(parsed) : parsed;
  } catch {
    return {} as T;
  }
}

/**
 * Handles persistent message and activity storage with strict user session isolation.
 * Automatically switches storage keys when userId changes to prevent data leakage.
 */
export function useChatStorage({ userId }: UseChatStorageProps) {
  const storageKey = userId ? `master_msgs_${userId}` : 'master_msgs_guest';
  const activityKey = userId ? `master_act_${userId}` : 'master_act_guest';

  const [serviceMessages, setServiceMessages] = useState<Record<string, ChatMessage[]>>(() => readSaved(storageKey, withoutGreetings));
  const [serviceLastActivity, setServiceLastActivity] = useState<Record<string, number>>(() => readSaved(activityKey));

  // User Session Isolation: when the user changes or logs out, switch to their scoped storage right away. Done while
  // rendering (React's pattern for state that follows a prop), so no effect sets state and nothing renders twice.
  const [loadedKey, setLoadedKey] = useState(storageKey);
  if (loadedKey !== storageKey) {
    setLoadedKey(storageKey);
    setServiceMessages(readSaved(storageKey, withoutGreetings));
    setServiceLastActivity(readSaved(activityKey));
  }

  // Sync activity map to user-scoped localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(serviceLastActivity).length > 0) {
      try {
        localStorage.setItem(activityKey, JSON.stringify(serviceLastActivity));
      } catch {
        // ignore storage quota error
      }
    }
  }, [serviceLastActivity, activityKey]);

  // Sync chat messages to user-scoped localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(serviceMessages).length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(serviceMessages));
      } catch {
        // ignore storage quota error
      }
    }
  }, [serviceMessages, storageKey]);

  // Reset chat session on logout
  const resetChatSession = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(activityKey);
        localStorage.removeItem('master_service_messages');
        localStorage.removeItem('master_service_activity');
      } catch {
        // ignore
      }
    }
    setServiceMessages({});
    setServiceLastActivity({});
  };

  return {
    serviceMessages,
    setServiceMessages,
    serviceLastActivity,
    setServiceLastActivity,
    resetChatSession,
  };
}
