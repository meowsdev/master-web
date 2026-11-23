'use client';

import { useMySupportThread } from '@/hooks/useSupportChat';

interface SupportChatRowProps {
  userId: string;
  isActive: boolean;
  onOpen: () => void;
}

const formatDay = (isoDate: string) => {
  const date = new Date(isoDate);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

/*
 * The platform's support team as a chat of its own, pinned above every other chat like a WhatsApp
 * pinned chat. It sits outside the search and the filter chips, so it is on top in every category.
 */
export function SupportChatRow({ userId, isActive, onOpen }: SupportChatRowProps) {
  const { data: support } = useMySupportThread(userId, true);
  const unreadCount = support?.unreadCount ?? 0;
  const lastMessage = support?.lastMessage ?? null;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={isActive ? 'page' : undefined}
      className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] p-[10px] text-left transition-colors hover:bg-surface ${isActive ? 'bg-surface' : ''}`}
    >
      <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-primary text-[18px] font-semibold text-white">S</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center justify-between gap-[8px]">
          <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">Support</span>
          {lastMessage && <time className={`shrink-0 text-[12px] font-medium ${unreadCount > 0 ? 'text-primary' : 'text-muted'}`}>{formatDay(lastMessage.createdAt)}</time>}
        </span>
        <span className="flex items-center justify-between gap-[8px]">
          <span className="truncate text-[13px] font-medium text-muted">{lastMessage?.text ?? 'Chat with our team'}</span>
          {unreadCount > 0 && (
            <span className="flex min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-[6px] py-[1px] text-[12px] font-semibold text-white">{unreadCount}</span>
          )}
        </span>
      </span>
    </button>
  );
}
