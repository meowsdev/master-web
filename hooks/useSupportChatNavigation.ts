'use client';

import { Dispatch, SetStateAction, useCallback } from 'react';
import { RailTab } from '@/types/super-app.types';

interface Options {
  setActiveRailTab: Dispatch<SetStateAction<RailTab>>;
  setMobileView: (view: 'LIST' | 'CHAT') => void;
  /** Clears the selected service / order / counselor chat. */
  deselectChats: () => void;
}

/*
 * Support is a pinned row of the chat list: opening it deselects every other chat, and picking another
 * chat (or the Chats icon) closes it again.
 */
export function useSupportChatNavigation({ setActiveRailTab, setMobileView, deselectChats }: Options) {
  const openSupportChat = useCallback(() => {
    deselectChats();
    setActiveRailTab('SUPPORT');
    setMobileView('CHAT');
  }, [deselectChats, setActiveRailTab, setMobileView]);

  const leaveSupportChat = useCallback(() => setActiveRailTab((tab) => (tab === 'SUPPORT' ? 'CHATS' : tab)), [setActiveRailTab]);

  return { openSupportChat, leaveSupportChat };
}
