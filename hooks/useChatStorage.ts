'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/types/super-app.types';

interface UseChatStorageProps {
  userId?: string | null;
}

/**
 * Handles persistent message and activity storage with strict user session isolation.
 * Automatically switches storage keys when userId changes to prevent data leakage.
 */
export function useChatStorage({ userId }: UseChatStorageProps) {
  const storageKey = userId ? `master_msgs_${userId}` : 'master_msgs_guest';
  const activityKey = userId ? `master_act_${userId}` : 'master_act_guest';

  const [serviceMessages, setServiceMessages] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback to empty state on parse error
      }
    }
    return {};
  });

  const [serviceLastActivity, setServiceLastActivity] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(activityKey);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback to empty state on parse error
      }
    }
    return {};
  });

  // User Session Isolation: When user changes or logs out, immediately switch to their scoped storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedMsgs = localStorage.getItem(storageKey);
      setServiceMessages(savedMsgs ? JSON.parse(savedMsgs) : {});
      const savedAct = localStorage.getItem(activityKey);
      setServiceLastActivity(savedAct ? JSON.parse(savedAct) : {});
    } catch {
      setServiceMessages({});
      setServiceLastActivity({});
    }
  }, [storageKey, activityKey]);

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
