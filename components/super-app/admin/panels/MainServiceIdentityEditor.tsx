'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { adminService } from '@/services/admin.service';
import { AdminMainService } from '@/services/catalog-admin.service';
import { PicturePicker } from '../PicturePicker';
import { useAction } from './ServiceContentEditor';

/*
 * Staff, in a main service's details drawer: its picture (the round image customers see beside it, uploaded the same
 * way as when it was made) and its name. A description saved before stays as it is. The drawer shows it
 * under the name when its edit icon is pressed; it starts from what is saved and closes on Save or Cancel.
 */
export function MainServiceIdentityEditor({ main, onClose }: { main: Pick<AdminMainService, 'id' | 'name' | 'description' | 'iconUrl'>; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(main.name);
  const [icon, setIcon] = useState(main.iconUrl ?? '');
  const save = useAction(
    () => adminService.updateCategory(main.id, { name: name.trim(), iconUrl: icon.trim() }),
    'Main service updated',
  );
  const isChanged = name.trim() !== main.name || icon.trim() !== (main.iconUrl ?? '');

  return (
    <form
      className="rounded-[12px] border border-line bg-white px-[12px] pb-[12px]"
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim() || !isChanged) return;
        save.mutate(undefined, {
          onSuccess: () => {
            // The customer read, the list rows and the chat headers all show these.
            void queryClient.invalidateQueries({ queryKey: ['catalog-main-service', main.id] });
            void queryClient.invalidateQueries({ queryKey: ['super-app-services'] });
            onClose();
          },
        });
      }}
    >
      <PicturePicker value={icon} onChange={setIcon} />
      <OrderField icon={Wrench01Icon}>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Main service name" className={fieldControlClass} />
      </OrderField>
      <div className="mt-[14px] flex gap-[8px]">
        <button type="button" onClick={onClose} className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface">
          বাতিল
        </button>
        <button
          type="submit"
          disabled={!name.trim() || !isChanged || save.isPending}
          className="h-[40px] flex-1 cursor-pointer rounded-[10px] bg-primary text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {save.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
