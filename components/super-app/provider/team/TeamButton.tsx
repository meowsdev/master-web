'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { railIconClass } from '../../RailIconButton';
import { Add01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { useProviderTeam } from '@/hooks/useProviderTeam';
import { SupportAvatar } from '../../support/SupportAvatar';
import { AddTechnicianForm } from './AddTechnicianForm';

/*
 * The team icon in the provider's profile header. Opens "আমার টিম": every technician working under this
 * provider, how many jobs each has running, and a form to add a new one.
 */
export function TeamButton({ userId, variant }: { userId: string; /** rail: the left bar on wide screens; header: the profile header on phones, where the rail is hidden. */ variant: 'rail' | 'header' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { data: team = [], isLoading, isError } = useProviderTeam(userId);

  const close = () => {
    setIsOpen(false);
    setIsAdding(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="আমার টিম"
        aria-label="আমার টিম"
        className={
          variant === 'rail'
            ? railIconClass(isOpen)
            : 'relative flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-surface md:hidden'
        }
      >
        <HugeiconsIcon icon={UserGroupIcon} size={22} strokeWidth={variant === 'rail' && isOpen ? 2 : 1.7} />
        {team.length > 0 && (
          <span className="absolute -right-[2px] -top-[2px] flex min-w-[18px] items-center justify-center rounded-full bg-primary px-[4px] text-[10px] font-semibold text-white">
            {team.length}
          </span>
        )}
      </button>

      {isOpen && (
        <SidePanelShell title="আমার টিম" onClose={close}>
          <div className="pb-[24px]">
            {isAdding ? (
              <AddTechnicianForm userId={userId} onDone={() => setIsAdding(false)} onCancel={() => setIsAdding(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] border border-dashed border-primary p-[10px] text-left hover:bg-secondary"
              >
                <span className="flex size-[40px] items-center justify-center rounded-full bg-secondary text-primary">
                  <HugeiconsIcon icon={Add01Icon} size={20} />
                </span>
                <span className="text-[14px] font-semibold text-primary">Add worker</span>
              </button>
            )}

            <p className="mb-[8px] mt-[20px] text-[13px] font-semibold uppercase tracking-[0.4px] text-muted">
              টেকনিশিয়ান ({team.length})
            </p>
            {isLoading && <p className="text-[14px] font-medium text-muted">Loading your team...</p>}
            {isError && <p className="text-[14px] font-medium text-[#d64545]">টিম লোড করা যায়নি।</p>}
            {!isLoading && !isError && team.length === 0 && (
              <p className="rounded-[12px] bg-surface p-[14px] text-[13px] font-medium text-muted">এখনো কোনো টেকনিশিয়ান নেই। উপরের &ldquo;Add worker&rdquo; দিয়ে যোগ করুন।</p>
            )}

            <ul className="flex flex-col gap-[8px]">
              {team.map((technician) => {
                const name = technician.name || (technician.username ? `@${technician.username}` : 'Unnamed');
                return (
                  <li key={technician.id} className="flex items-center gap-[12px] rounded-[12px] border border-line p-[10px]">
                    <SupportAvatar name={name} photo={technician.profilePhoto} sizeClass="size-[40px]" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[14px] font-semibold text-ink">{name}</span>
                      <span className="truncate text-[12px] font-medium text-muted">{technician.mobileNumber}</span>
                    </span>
                    <span className={`shrink-0 text-[12px] font-semibold ${technician.isActive ? 'text-ink' : 'text-[#d64545]'}`}>
                      {technician.isActive ? `${technician.activeJobs} active job(s)` : 'Blocked'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </SidePanelShell>
      )}
    </>
  );
}
