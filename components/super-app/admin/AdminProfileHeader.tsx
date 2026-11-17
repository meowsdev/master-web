import { User } from '@/types/auth.types';

/* The admin's header in the sidebar: photo, name and a role badge. No due and no Pay button: admins hold no wallet. */
export function AdminProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex h-[56px] items-center gap-[10px]">
      {user.profilePhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- photo URLs come from arbitrary upload hosts
        <img src={user.profilePhoto} alt="" className="size-[44px] shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-[#d7fdd2] text-[18px] font-semibold text-[#205737]">
          {(user.name || '?').charAt(0).toUpperCase()}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] font-semibold tracking-[-0.3px] text-[#202939]">{user.name || 'Admin'}</span>
        <span className="w-fit rounded-full bg-[#202939] px-[8px] py-[1px] text-[11px] font-semibold text-white">Admin</span>
      </div>
    </div>
  );
}
