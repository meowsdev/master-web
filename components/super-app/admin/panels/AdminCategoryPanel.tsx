'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogAdminService } from '@/services/catalog-admin.service';
import { toast } from 'sonner';
import { Layers01Icon, Note01Icon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { adminService } from '@/services/admin.service';
import { PicturePicker } from '../PicturePicker';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';

const apiErrorMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || 'The main service could not be created';
};

/*
 * New main service (category). The services customers order sit under one of these. Once it exists, the panel
 * moves on to adding its first service, already placed under the new main service.
 */
export function AdminCategoryPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const openPanel = useOrderPanelStore((state) => state.open);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  // The top-bar category it sits in; without one customers do not see it.
  const [groupId, setGroupId] = useState('');
  const { data: groups = [] } = useQuery({ queryKey: ['admin-catalog-tree'], queryFn: catalogAdminService.tree });

  const create = useMutation({
    mutationFn: () => adminService.createCategory({ name: name.trim(), description: description.trim() || undefined, iconUrl: icon.trim() || undefined, groupId: groupId || undefined }),
    onSuccess: (category) => {
      toast.success(`${category.name} created. Now add its first service.`);
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['order-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['admin-catalog-tree'] });
      queryClient.invalidateQueries({ queryKey: ['super-app-services'] });
      openPanel(`new:${category.id}`, 'adminService');
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <SidePanelShell title="New main service" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
        className="pb-[24px]"
      >
        <p className="text-[13px] font-medium text-[#697586]">A main service groups the services customers order, like &ldquo;AC Repair &amp; Service&rdquo;.</p>

        <OrderField icon={Wrench01Icon}>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Main service name" className={fieldControlClass} />
        </OrderField>
        <OrderField icon={Note01Icon}>
          <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} placeholder="Description (optional)" className={fieldControlClass} />
        </OrderField>
        <OrderField icon={Layers01Icon}>
          <select value={groupId} onChange={(event) => setGroupId(event.target.value)} className={`${fieldControlClass} cursor-pointer appearance-none`}>
            <option value="">Category (top bar)</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </OrderField>
        <PicturePicker value={icon} onChange={setIcon} />

        <div className="mt-[28px] flex justify-center">
          <button type="submit" disabled={!name.trim() || !groupId || create.isPending} className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50">
            {create.isPending ? 'Creating...' : 'Create main service'}
          </button>
        </div>
      </form>
    </SidePanelShell>
  );
}
