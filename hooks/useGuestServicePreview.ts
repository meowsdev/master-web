'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Service } from '@/types/service.types';

interface GuestServicePreviewOptions {
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onOpenChat: (service: Service) => void;
}

/**
 * Visitors who are logged out get the service's public page instead of its chat.
 * "Contact Now" sends them through login, and once they are in, this opens the
 * chat of the service they asked about.
 */
export function useGuestServicePreview({ isAuthenticated, onOpenAuth, onOpenChat }: GuestServicePreviewOptions) {
  const [previewService, setPreviewService] = useState<Service | null>(null);
  // Which service the visitor pressed "Contact Now" on. A ref: it only matters at the
  // moment they become logged in, and changing it must not trigger a render.
  const contactServiceRef = useRef<Service | null>(null);

  const handleContactNow = useCallback(
    (service: Service) => {
      contactServiceRef.current = service;
      setPreviewService(null);
      onOpenAuth();
    },
    [onOpenAuth],
  );

  // Logged in after pressing Contact Now: go straight to that service's chat.
  useEffect(() => {
    const service = contactServiceRef.current;
    if (!isAuthenticated || !service) return;
    contactServiceRef.current = null;
    onOpenChat(service);
  }, [isAuthenticated, onOpenChat]);

  // The login panel was dismissed without logging in: forget the pending contact,
  // so a later, unrelated login doesn't suddenly open a chat. A successful login also
  // closes the panel, and the store already says "authenticated" by then, so that
  // case keeps the contact for the effect above.
  const cancelContact = useCallback(() => {
    if (!useAuthStore.getState().isAuthenticated) contactServiceRef.current = null;
  }, []);

  return {
    previewService,
    openPreview: setPreviewService,
    closePreview: () => setPreviewService(null),
    handleContactNow,
    cancelContact,
  };
}
