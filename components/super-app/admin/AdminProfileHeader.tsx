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
        <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-[#d7fdd2] text-[18px] font-semibold text-[#205737]">
          {(user.name || '?').charAt(0).toUpperCase()}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{user.name || ROLE_BADGE[user.role] || 'Staff'}</span>
        <span className="w-fit rounded-full bg-[#202939] px-[8px] py-[1px] text-[11px] font-semibold text-white">{ROLE_BADGE[user.role] ?? user.role}</span>
      </div>
    </div>
  );
}
