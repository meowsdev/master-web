'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { AdminGroup, catalogAdminService } from '@/services/catalog-admin.service';
import { useAction } from './panels/ServiceContentEditor';

/** Where the right-click happened, and on which category. */
export interface CategoryMenuTarget {
  group: AdminGroup;
  x: number;
  y: number;
}

/*
 * Staff right-click on a category chip (the filters above the main services): Edit or Delete. Edit opens a small
 * box for its names; Delete asks first, and the server refuses while main services are still in it (move or delete
 * those first), so nothing is ever lost.
 */
export function CategoryChipMenu({
  target,
  onClose,
  onDeleted,
  onRenamed,
}: {
  target: CategoryMenuTarget;
  onClose: () => void;
  onDeleted: (group: AdminGroup) => void;
  onRenamed: (oldName: string, newName: string) => void;
}) {
  const [mode, setMode] = useState<'MENU' | 'EDIT' | 'DELETE'>('MENU');
  const [name, setName] = useState(target.group.name);
  const [nameBn, setNameBn] = useState(target.group.nameBn ?? '');
  const rename = useAction(() => catalogAdminService.updateGroup(target.group.id, { name: name.trim(), ...(nameBn.trim() ? { nameBn: nameBn.trim() } : {}) }), 'Category updated');
  const remove = useAction(() => catalogAdminService.deleteGroup(target.group.id), 'Category deleted');
  const mainCount = target.group.categories.length;

  // Escape closes it, like any menu.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Kept on screen near the click.
  const left = Math.min(target.x, (typeof window === 'undefined' ? 1000 : window.innerWidth) - 290);
  const top = Math.min(target.y, (typeof window === 'undefined' ? 800 : window.innerHeight) - 260);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(event) => { event.preventDefault(); onClose(); }}>
      <div
        role="menu"
        style={{ left, top }}
        onClick={(event) => event.stopPropagation()}
        className="absolute w-[280px] rounded-[12px] border border-line bg-white p-[6px] text-ink shadow-lg"
      >
        <p className="truncate px-[10px] pb-[4px] pt-[6px] text-[12px] font-semibold text-muted">{target.group.name}</p>

        {mode === 'MENU' && (
          <>
            <button type="button" role="menuitem" onClick={() => setMode('EDIT')} className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left text-[14px] font-semibold hover:bg-surface">
              <HugeiconsIcon icon={PencilEdit01Icon} size={18} /> Edit
            </button>
            <button type="button" role="menuitem" onClick={() => setMode('DELETE')} className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-[10px] py-[10px] text-left text-[14px] font-semibold text-[#d64545] hover:bg-[#fdecec]">
              <HugeiconsIcon icon={Delete02Icon} size={18} /> Delete
            </button>
          </>
        )}

        {mode === 'EDIT' && (
          <form
            className="flex flex-col gap-[8px] p-[6px]"
            onSubmit={(event) => {
              event.preventDefault();
              if (name.trim()) rename.mutate(undefined, { onSuccess: () => { onRenamed(target.group.name, name.trim()); onClose(); } });
            }}
          >
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="Category নাম" className="h-[38px] rounded-[8px] border border-line px-[10px] text-[14px] outline-none focus:border-primary" />
            <input value={nameBn} onChange={(event) => setNameBn(event.target.value)} maxLength={150} placeholder="বাংলা নাম (ঐচ্ছিক)" className="h-[38px] rounded-[8px] border border-line px-[10px] text-[14px] outline-none focus:border-primary" />
            <div className="flex gap-[6px]">
              <button type="button" onClick={onClose} className="h-[36px] flex-1 cursor-pointer rounded-[8px] border border-chip text-[13px] font-semibold hover:bg-surface">বাতিল</button>
              <button type="submit" disabled={!name.trim() || rename.isPending} className="h-[36px] flex-1 cursor-pointer rounded-[8px] bg-primary text-[13px] font-semibold text-white hover:bg-primary/90 disabled:bg-primary-disabled">
                {rename.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {mode === 'DELETE' && (
          <div className="p-[6px]">
            {mainCount > 0 ? (
              <p className="text-[13px] font-medium leading-relaxed text-[#d64545]">
                এই category-তে {mainCount}টি main service আছে। আগে সেগুলো অন্য category-তে সরান বা মুছুন, তারপর category মুছতে পারবেন।
              </p>
            ) : (
              <p className="text-[13px] font-medium leading-relaxed text-ink">&ldquo;{target.group.name}&rdquo; category মুছবেন?</p>
            )}
            <div className="mt-[10px] flex gap-[6px]">
              <button type="button" onClick={onClose} className="h-[36px] flex-1 cursor-pointer rounded-[8px] border border-chip text-[13px] font-semibold hover:bg-surface">বাতিল</button>
              {mainCount === 0 && (
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(undefined, { onSuccess: () => { onDeleted(target.group); onClose(); } })}
                  className="h-[36px] flex-1 cursor-pointer rounded-[8px] bg-[#d64545] text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {remove.isPending ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
