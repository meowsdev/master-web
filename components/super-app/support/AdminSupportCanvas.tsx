'use client';

import { useQuery } from '@tanstack/react-query';
import { supportChatService } from '@/services/support-chat.service';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { useSupportChatStore } from '@/store/useSupportChatStore';
import { SupportMemberRole } from '@/types/support-chat.types';
import { ChatEmptyHeader } from '../ChatEmptyHeader';
import { SupportAvatar } from './SupportAvatar';
import { SupportChatWindow } from './SupportChatWindow';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';

interface AdminSupportCanvasProps {
  userId: string;
  role: SupportMemberRole;
  onBack: () => void;
  onSwitchAccount: () => void;
}

/* Staff's main area on the Providers / Customers chat tabs: the chosen person's thread, or an empty canvas. */
export function AdminSupportCanvas({ userId, role, onBack, onSwitchAccount }: AdminSupportCanvasProps) {
  const selected = useSupportChatStore((state) => state.selected);
  const openPanel = useOrderPanelStore((state) => state.open);
  const { canViewMemberDetails } = useStaffPermissions();
  // Only a person of the tab's own role is shown, so switching tabs never keeps the other list's chat open.
  const member = selected && selected.role === role ? selected : null;

  // Opening is idempotent: it returns the existing shared thread, or starts it on first contact.
  const { data: thread } = useQuery({
    queryKey: ['support-thread', userId, member?.id],
    queryFn: () => supportChatService.openThreadForMember(member!.id),
    enabled: member !== null,
  });

  if (!member) {
    return (
      <>
        <ChatEmptyHeader onSwitchAccount={onSwitchAccount} menuItems={[]} />
        <div className="flex flex-1 items-center justify-center bg-surface text-[14px] font-medium text-muted">
          Choose a {role.toLowerCase()} to start chatting.
        </div>
      </>
    );
  }

  return (
    <SupportChatWindow
      key={member.id}
      userId={userId}
      threadId={thread?.threadId ?? null}
      title={member.name}
      subtitle={member.roleLabel}
      avatar={<SupportAvatar name={member.name} photo={member.photo} sizeClass="size-[36px]" />}
      isViewerSupport
      onBack={onBack}
      onOpenProfile={canViewMemberDetails ? () => openPanel(member.id, 'adminMember') : undefined}
      emptyHint="No messages yet. Say hello!"
    />
  );
}
