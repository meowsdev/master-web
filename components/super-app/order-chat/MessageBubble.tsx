import { Message } from '@/types/chat.types';

/** "11.14 AM", the same style as the cards' timestamps. */
const formatMessageTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

/** WhatsApp gives each group member their own name colour; the same person always gets the same one. */
const NAME_COLORS = ['#1f7aec', '#d6336c', '#e8590c', '#2b8a3e', '#7048e8', '#0c8599', '#c2255c', '#5c940d'];
const nameColor = (senderId: string) => {
  let hash = 0;
  for (const char of senderId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
};

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  PROVIDER: 'Provider',
  TECHNICIAN: 'Technician',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SUPPORT: 'Support',
  COUNSELOR: 'Counselor',
};

/* A typed chat message: mine on the right (mint), theirs on the left (white) with the sender's name on top. */
export function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  const senderName = message.sender?.displayName || message.sender?.name;
  const roleLabel = message.sender?.role ? ROLE_LABELS[message.sender.role] : undefined;

  return (
    <div
      className={`max-w-[75%] rounded-[12px] px-[12px] py-[8px] text-ink ${isMine ? 'ml-auto bg-secondary' : 'bg-white'}`}
    >
      {!isMine && senderName && (
        <p className="mb-[2px] flex items-baseline gap-[6px] text-[13px] font-semibold leading-tight">
          <span className="truncate" style={{ color: nameColor(message.senderId) }}>
            {senderName}
          </span>
          {roleLabel && <span className="shrink-0 text-[11px] font-medium text-muted">{roleLabel}</span>}
        </p>
      )}
      <p className="whitespace-pre-wrap break-words text-[14px] font-medium">{message.text}</p>
      <time className="mt-[2px] block text-right text-[11px] font-medium text-muted">{formatMessageTime(message.createdAt)}</time>
    </div>
  );
}
