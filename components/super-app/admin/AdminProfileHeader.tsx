import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { User } from '@/types/auth.types';

const ROLE_BADGE: Record<string, string> = { ADMIN: 'Admin', MANAGER: 'Manager', SUPPORT: 'Support', HR: 'HR', COUNSELOR: 'Counselor' };

/* A staff member's header in the sidebar: photo, name and their role badge. No due and no Pay button: staff hold no wallet. */
export function AdminProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-[10px]">
      {user.profilePhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
        <img src={user.profilePhoto} alt="" className="size-[44px] shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-secondary text-[18px] font-semibold text-ink">
          {(user.name || '?').charAt(0).toUpperCase()}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-ink">{user.name || ROLE_BADGE[user.role] || 'Staff'}</span>
        <span className="w-fit rounded-full bg-ink px-[8px] py-[1px] text-[11px] font-semibold text-white">{ROLE_BADGE[user.role] ?? user.role}</span>
      </div>
    </div>
  );
}

/**
 * The top of every staff sidebar (Orders, Services, member chats, Staff): the profile header and, when the tab has
 * one, the green + on the right. One component, so the tabs cannot drift apart in size or colour.
 */
export function StaffSidebarHeader({ user, action }: { user: User; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between">
      <AdminProfileHeader user={user} />
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          title={action.label}
          aria-label={action.label}
          className="btn-raised flex size-[44px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-transform hover:scale-105"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={22} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
