'use client';

import { useQuery } from '@tanstack/react-query';
import { supportChatService } from '@/services/support-chat.service';
import { SupportChatWindow } from './SupportChatWindow';

/* A provider's or customer's "Support" chat with the platform's staff. The thread is created the first time they open it. */
export function MemberSupportCanvas({ userId, onBack }: { userId: string; onBack: () => void }) {
  const { data: thread } = useQuery({
    queryKey: ['support-own-thread', userId],
    queryFn: supportChatService.openOwnThread,
  });

  return (
    <SupportChatWindow
      userId={userId}
      threadId={thread?.threadId ?? null}
      title="Support"
      subtitle="Chat with our team"
      avatar={<span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-primary text-[16px] font-semibold text-white">S</span>}
      isViewerSupport={false}
      onBack={onBack}
      emptyHint="Write to our team. We will reply here."
    />
  );
}
