'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { useOrderTechnicians, useSetOrderTechnician } from '@/hooks/useOrderTechnician';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth.types';
import { Order } from '@/types/order.types';
import { SupportAvatar } from '../../support/SupportAvatar';
import { AddTechnicianForm } from '../team/AddTechnicianForm';

/*
 * Assign Worker: the provider picks one of THEIR OWN technicians for this order (or takes the worker off).
 * The list comes from the backend, which only returns the order's provider's technicians and refuses anything else.
 */
export function AssignWorkerPanel({ order, userId, onClose }: { order: Order; userId: string; onClose: () => void }) {
  const { data, isLoading, isError } = useOrderTechnicians(userId, order.id);
  const change = useSetOrderTechnician(userId, order.id, onClose);
  // null = nothing picked yet, so the saved worker is shown selected.
  const [choice, setChoice] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  // Only a provider adds to their own team here; an admin adds technicians from the admin screens.
  const canAddWorker = useAuthStore((state) => state.activeRole) === UserRole.PROVIDER;

  const currentId = data?.currentTechnicianId ?? null;
  const selectedId = choice ?? currentId;
  const technicians = data?.technicians ?? [];

  return (
    <SidePanelShell title="Assign Worker" onClose={onClose}>
      <p className="text-[13px] font-medium text-muted">Worker on this order</p>
      <p className="mb-[16px] mt-[4px] text-[16px] font-semibold text-ink">{order.assignee?.technician ?? 'No worker assigned yet'}</p>

      {isLoading && <p className="text-[14px] font-medium text-muted">Loading your technicians...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">Could not load your technicians.</p>}
      {/* A new technician can be added right here; once added they appear in the list below to be assigned. */}
      {canAddWorker && (
        <div className="mb-[8px]">
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
        </div>
      )}

      {data && technicians.length === 0 && !isAdding && (
        <p className="rounded-[12px] border border-line bg-surface p-[14px] text-[13px] font-medium text-muted">
          {canAddWorker ? 'এখনো কোনো টেকনিশিয়ান নেই। উপরের "Add worker" দিয়ে যোগ করুন।' : 'This provider has no technicians yet.'}
        </p>
      )}

      <ul className="flex flex-col gap-[8px]">
        {technicians.map((technician) => {
          const name = technician.name || (technician.username ? `@${technician.username}` : 'Unnamed');
          const isSelected = selectedId === technician.id;
          return (
            <li key={technician.id}>
              <button
                type="button"
                disabled={!technician.isActive}
                aria-pressed={isSelected}
                onClick={() => setChoice(technician.id)}
                className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] border p-[10px] text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isSelected ? 'border-primary bg-secondary' : 'border-line bg-white hover:bg-surface'}`}
              >
                <SupportAvatar name={name} photo={technician.profilePhoto} sizeClass="size-[40px]" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold text-ink">{name}</span>
                  <span className={`text-[12px] font-medium ${technician.isActive ? 'text-muted' : 'text-[#d64545]'}`}>
                    {technician.isActive ? `${technician.activeJobs} active job(s)` : 'Blocked, cannot take work'}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {technicians.length > 0 && (
        <div className="mt-[20px] flex items-center justify-center gap-[12px]">
          <button
            type="button"
            disabled={!selectedId || selectedId === currentId || change.isPending}
            onClick={() => selectedId && change.mutate(selectedId)}
            className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {change.isPending ? 'Saving...' : 'Assign worker'}
          </button>
          {currentId && (
            <button
              type="button"
              disabled={change.isPending}
              onClick={() => change.mutate(null)}
              className="cursor-pointer rounded-[8px] border border-[#d64545] px-[16px] py-[8px] text-[14px] font-semibold text-[#d64545] hover:bg-[#fde8e8] disabled:opacity-50"
            >
              Remove worker
            </button>
          )}
        </div>
      )}
    </SidePanelShell>
  );
}
