'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { adminService } from '@/services/admin.service';

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'Something went wrong';
};

/* Technicians: who they are, which provider they work under, and (admin only) create, move or remove them. */
export function TechniciansPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: technicians = [] } = useQuery({ queryKey: ['admin-technicians'], queryFn: adminService.listTechnicians });
  const { data: providers = [] } = useQuery({ queryKey: ['admin-providers'], queryFn: adminService.listProviders });
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [providerAgencyId, setProviderAgencyId] = useState('');

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
  const onError = (error: unknown) => toast.error(apiErrorMessage(error));

  const create = useMutation({
    mutationFn: () => adminService.createTechnician({ name: name.trim(), mobileNumber: mobileNumber.trim(), providerAgencyId: providerAgencyId || undefined }),
    onSuccess: () => {
      toast.success('Technician created');
      setName('');
      setMobileNumber('');
      setProviderAgencyId('');
      refresh();
    },
    onError,
  });
  const move = useMutation({ mutationFn: ({ id, agencyId }: { id: string; agencyId: string | null }) => adminService.assignTechnicianAgency(id, agencyId), onSuccess: refresh, onError });
  const remove = useMutation({ mutationFn: adminService.deleteTechnician, onSuccess: () => { toast.success('Technician removed'); refresh(); }, onError });

  const providerLabel = (provider: (typeof providers)[number]) => provider.companyName || provider.user.name || provider.user.username || provider.id.slice(0, 6);
  const fieldClass = 'h-[40px] w-full rounded-[8px] border border-[#cecece] px-[10px] text-[14px] text-[#202939] outline-none focus:border-[#1daa61]';

  return (
    <SidePanelShell title="Technicians" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
        className="flex flex-col gap-[10px] rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px]"
      >
        <p className="text-[14px] font-semibold text-[#202939]">Add a technician</p>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" maxLength={100} className={fieldClass} />
        <input value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} placeholder="+8801700000000" className={fieldClass} />
        <select value={providerAgencyId} onChange={(event) => setProviderAgencyId(event.target.value)} className={fieldClass}>
          <option value="">No provider yet</option>
          {providers.map((provider) => <option key={provider.id} value={provider.id}>{providerLabel(provider)}</option>)}
        </select>
        <button type="submit" disabled={!name.trim() || !mobileNumber.trim() || create.isPending} className="h-[40px] cursor-pointer rounded-[8px] bg-[#1daa61] text-[14px] font-semibold text-white hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
          {create.isPending ? 'Creating...' : 'Create technician'}
        </button>
      </form>

      <ul className="mt-[16px]">
        {technicians.length === 0 && <li className="py-[12px] text-[14px] font-medium text-[#697586]">No technicians yet.</li>}
        {technicians.map((technician) => (
          <li key={technician.id} className="flex items-center gap-[10px] border-b border-[#e5e5e5] py-[10px]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#202939]">{technician.user.name ?? technician.user.username} <span className="font-medium text-[#697586]">{technician.user.mobileNumber}</span></p>
              <select
                value={technician.providerAgencyId ?? ''}
                onChange={(event) => move.mutate({ id: technician.id, agencyId: event.target.value || null })}
                aria-label="Provider"
                className="mt-[4px] h-[32px] max-w-full rounded-[6px] border border-[#e5e5e5] bg-white px-[6px] text-[13px] text-[#202939]"
              >
                <option value="">No provider</option>
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{providerLabel(provider)}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={() => window.confirm('Remove this technician?') && remove.mutate(technician.id)}
              aria-label="Remove technician"
              className="cursor-pointer text-[#d64545]"
            >
              <HugeiconsIcon icon={Delete02Icon} size={18} />
            </button>
          </li>
        ))}
      </ul>
    </SidePanelShell>
  );
}
