'use client';

import { useState } from 'react';
import { useSupportDirectory } from '@/hooks/useSupportChat';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { useSupportChatStore } from '@/store/useSupportChatStore';
import { User } from '@/types/auth.types';
import { SupportMemberRole } from '@/types/support-chat.types';
import { CustomerSidebarTop } from '../CustomerSidebarTop';
import { StaffSidebarHeader } from '../admin/AdminProfileHeader';
import { SupportAvatar } from './SupportAvatar';
import { matchesMemberFilter, MEMBER_STATUS_FILTERS, memberStatusLabel } from './member-status';

interface SupportDirectorySidebarProps {
  user: User;
  role: SupportMemberRole;
  onMemberOpened: () => void;
  onOpenAuth: () => void;
}

const LABELS: Record<SupportMemberRole, { plural: string; placeholder: string }> = {
  PROVIDER: { plural: 'providers', placeholder: 'Search providers...' },
  TECHNICIAN: { plural: 'technicians', placeholder: 'Search technicians...' },
  CUSTOMER: { plural: 'customers', placeholder: 'Search customers...' },
};

const ROLE_LABELS: Record<string, string> = { PROVIDER: 'Provider', TECHNICIAN: 'Technician', CUSTOMER: 'Customer' };

/* Staff's left list: every provider or customer, people you already talk to first, with an unread badge. */
export function SupportDirectorySidebar({ user, role, onMemberOpened, onOpenAuth }: SupportDirectorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterChip, setActiveFilterChip] = useState('All');
  const { data: members = [], isLoading } = useSupportDirectory(user.id, role, searchQuery);
  const selected = useSupportChatStore((state) => state.selected);
  const select = useSupportChatStore((state) => state.select);
  const labels = LABELS[role];
  const openPanel = useOrderPanelStore((state) => state.open);
  const { canAddMembers, canManageTechnicians } = useStaffPermissions();
  const visibleMembers = members.filter((member) => matchesMemberFilter(member, activeFilterChip));
  const isFiltered = searchQuery.trim() !== '' || activeFilterChip !== 'All';

  return (
    <>
      <CustomerSidebarTop
        isAuthenticated
        user={user}
        onOpenAuth={onOpenAuth}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => {}}
        onSearchBlur={() => {}}
        activeFilterChip={activeFilterChip}
        onSelectFilterChip={setActiveFilterChip}
        categoryNames={[...MEMBER_STATUS_FILTERS]}
        isSearchCollapsed={false}
        searchPlaceholder={labels.placeholder}
        profileSlot={
          // Adds one person of this kind. Only an admin may add a technician.
          <StaffSidebarHeader user={user} action={(role === 'TECHNICIAN' ? canManageTechnicians : canAddMembers) ? { label: `Add ${role.toLowerCase()}`, onClick: () => openPanel(role, 'adminAddMember') } : undefined} />
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[8px]">
        {!isLoading && (
          <p className="px-[10px] pb-[4px] pt-[8px] text-[13px] font-semibold text-muted">
            {isFiltered ? `Showing ${visibleMembers.length} of ${members.length} ${labels.plural}` : `Total: ${members.length} ${labels.plural}`}
          </p>
        )}
        {isLoading && <p className="p-[16px] text-center text-[14px] font-medium text-muted">Loading {labels.plural}...</p>}
        {!isLoading && visibleMembers.length === 0 && <p className="p-[24px] text-center text-[14px] font-medium text-muted">No {labels.plural} found.</p>}
        {visibleMembers.map((member) => {
          const status = memberStatusLabel(member);
          const displayName = member.name || (member.username ? `@${member.username}` : member.mobileNumber ?? 'Unnamed');
          const isSelected = selected?.id === member.id;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                select({ id: member.id, role, name: displayName, roleLabel: ROLE_LABELS[member.role] ?? 'Customer', photo: member.profilePhoto });
                onMemberOpened();
              }}
              className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] p-[10px] text-left transition-colors hover:bg-surface ${isSelected ? 'bg-surface' : ''}`}
            >
              <SupportAvatar name={displayName} photo={member.profilePhoto} />
              <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                <span className="flex items-center justify-between gap-[8px]">
                  <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{displayName}</span>
                  {/* Same place and style as an order's status (Complete, Pending...). */}
                  <span className={`shrink-0 text-[12px] font-semibold ${status.className}`}>{status.text}</span>
                </span>
                <span className="flex items-center justify-between gap-[8px]">
                  <span className="truncate text-[13px] font-medium text-muted">{member.lastMessage?.text ?? member.mobileNumber ?? 'No messages yet'}</span>
                  {member.unreadCount > 0 && (
                    <span className="flex min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-[6px] py-[1px] text-[12px] font-semibold text-white">{member.unreadCount}</span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
