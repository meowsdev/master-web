'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { Note01Icon, PencilEdit01Icon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { adminService } from '@/services/admin.service';
import { AdminMainService } from '@/services/catalog-admin.service';
import { PicturePicker } from '../PicturePicker';
import { useAction } from './ServiceContentEditor';

/*
 * Staff, in a main service's details drawer: its name, the line under it, and its picture (the round icon customers
 * see beside it: an uploaded image or a Hugeicons icon, the same picker as when it was made). Closed until "Edit"
 * is pressed, so the drawer reads like the customer's.
 */
export function MainServiceIdentityEditor({ main }: { main: Pick<AdminMainService, 'id' | 'name' | 'description' | 'iconUrl'> }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(main.name);
  const [description, setDescription] = useState(main.description ?? '');
  const [icon, setIcon] = useState(main.iconUrl ?? '');
  const save = useAction(
    () => adminService.updateCategory(main.id, { name: name.trim(), description: description.trim(), iconUrl: icon.trim() }),
    'Main service updated',
  );
  const isChanged = name.trim() !== main.name || description.trim() !== (main.description ?? '') || icon.trim() !== (main.iconUrl ?? '');

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          // Always start from what is saved now.
          setName(main.name);
          setDescription(main.description ?? '');
          setIcon(main.iconUrl ?? '');
          setIsOpen(true);
        }}
        className="flex w-fit cursor-pointer items-center gap-[6px] rounded-full px-[10px] py-[4px] text-[13px] font-semibold text-primary transition-colors hover:bg-secondary"
      >
        <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.8} /> নাম, বিবরণ ও আইকন এডিট
      </button>
    );
  }

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
            setIsOpen(false);
          },
        });
      }}
    >
      <OrderField icon={Wrench01Icon}>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Main service name" className={fieldControlClass} />
      </OrderField>
      <OrderField icon={Note01Icon}>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} rows={2} placeholder="বিবরণ (নামের নিচের লাইন)" className={`${fieldControlClass} resize-none`} />
      </OrderField>
      <p className="mb-[6px] mt-[16px] text-[13px] font-semibold text-ink">আইকন / ছবি</p>
      <PicturePicker value={icon} onChange={setIcon} />
      <div className="mt-[14px] flex gap-[8px]">
        <button type="button" onClick={() => setIsOpen(false)} className="h-[40px] flex-1 cursor-pointer rounded-[10px] border border-chip bg-white text-[14px] font-semibold text-ink hover:bg-surface">
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
