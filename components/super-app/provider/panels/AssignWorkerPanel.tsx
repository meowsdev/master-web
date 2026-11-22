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
      <p className="text-[13px] font-medium text-[#697586]">Worker on this order</p>
      <p className="mb-[16px] mt-[4px] text-[16px] font-semibold text-[#202939]">{order.assignee?.technician ?? 'No worker assigned yet'}</p>

      {isLoading && <p className="text-[14px] font-medium text-[#697586]">Loading your technicians...</p>}
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
              className="flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] border border-dashed border-[#1daa61] p-[10px] text-left hover:bg-[#e7fce3]"
            >
              <span className="flex size-[40px] items-center justify-center rounded-full bg-[#e7fce3] text-[#1daa61]">
                <HugeiconsIcon icon={Add01Icon} size={20} />
              </span>
              <span className="text-[14px] font-semibold text-[#1daa61]">Add worker</span>
            </button>
          )}
        </div>
      )}

      {data && technicians.length === 0 && !isAdding && (
        <p className="rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px] text-[13px] font-medium text-[#697586]">
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
                className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] border p-[10px] text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isSelected ? 'border-[#1daa61] bg-[#e7fce3]' : 'border-[#e5e5e5] bg-white hover:bg-[#f7f5f3]'}`}
              >
                <SupportAvatar name={name} photo={technician.profilePhoto} sizeClass="size-[40px]" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold text-[#202939]">{name}</span>
                  <span className={`text-[12px] font-medium ${technician.isActive ? 'text-[#697586]' : 'text-[#d64545]'}`}>
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
            className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
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
