'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { HEADER_BAR_HEIGHT_CLASS } from '@/components/modals/side-panel';
import { useSendSupportMessage, useSupportMessages } from '@/hooks/useSupportChat';
import { SupportMessage } from '@/types/support-chat.types';
import { OrderChatComposer } from '../order-chat/OrderChatComposer';

interface SupportChatWindowProps {
  userId: string;
  threadId: string | null;
  title: string;
  subtitle?: string;
  avatar: ReactNode;
  /** true when the person looking at the window is platform staff, so "mine" means the support side. */
  isViewerSupport: boolean;
  onBack?: () => void;
  /** Staff: opens the person's details panel when their name or picture is pressed. */
  onOpenProfile?: () => void;
  /** Shown above the (empty) message list, e.g. who they are talking to. */
  emptyHint: string;
}

const formatTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

function SupportBubble({ message, isMine }: { message: SupportMessage; isMine: boolean }) {
  return (
    <div className={`max-w-[75%] rounded-[12px] px-[12px] py-[8px] text-ink ${isMine ? 'ml-auto bg-secondary' : 'bg-white'}`}>
      <p className="whitespace-pre-wrap break-words text-[14px] font-medium">{message.text}</p>
      <time className="mt-[2px] block text-right text-[11px] font-medium text-muted">{formatTime(message.createdAt)}</time>
    </div>
  );
}

/* One support conversation: header, messages and the message box. Used by staff and by providers/customers alike. */
export function SupportChatWindow({ userId, threadId, title, subtitle, avatar, isViewerSupport, onBack, onOpenProfile, emptyHint }: SupportChatWindowProps) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useSupportMessages(userId, threadId);
  const sendMessage = useSendSupportMessage(userId, threadId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || sendMessage.isPending) return;
    sendMessage.mutate(text, {
      onSuccess: () => setDraft(''),
      onError: (error) => {
        const message = (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message;
        toast.error((Array.isArray(message) ? message[0] : message) ?? 'Message could not be sent');
      },
    });
  };

  return (
    <>
      <header className={`flex ${HEADER_BAR_HEIGHT_CLASS} shrink-0 items-center gap-[10px] border-b border-line bg-white px-[16px]`}>
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Back" className="cursor-pointer md:hidden">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} className="text-ink" />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenProfile}
          disabled={!onOpenProfile}
          title={onOpenProfile ? 'View details' : undefined}
          className="flex min-w-0 cursor-pointer items-center gap-[10px] text-left disabled:cursor-default"
        >
          {avatar}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{title}</span>
            {subtitle && <span className="truncate text-[12px] font-medium text-muted">{subtitle}</span>}
          </span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto bg-surface p-[16px]">
        {isLoading && <p className="m-auto text-[14px] font-medium text-muted">Loading messages...</p>}
        {!isLoading && messages.length === 0 && <p className="m-auto text-center text-[14px] font-medium text-muted">{emptyHint}</p>}
        {messages.map((message) => (
          <SupportBubble key={message.id} message={message} isMine={message.fromSupport === isViewerSupport} />
        ))}
        <div ref={bottomRef} />
      </div>

      <OrderChatComposer draft={draft} onDraftChange={setDraft} onSubmit={handleSend} canSend={draft.trim().length > 0 && threadId !== null && !sendMessage.isPending} isDisabled={threadId === null} />
    </>
  );
}
