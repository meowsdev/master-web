import { Message } from '@/types/chat.types';

/** "11.14 AM", the same style as the cards' timestamps. */
const formatMessageTime = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

/* A typed chat message: mine on the right (mint), theirs on the left (white), with its time. */
export function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <div
      className={`max-w-[75%] rounded-[12px] px-[12px] py-[8px] text-[#202939] ${isMine ? 'ml-auto bg-[#ade2cf]' : 'bg-white'}`}
    >
      <p className="whitespace-pre-wrap break-words text-[14px] font-medium">{message.text}</p>
      <time className="mt-[2px] block text-right text-[11px] font-medium text-[#697586]">{formatMessageTime(message.createdAt)}</time>
    </div>
  );
}
