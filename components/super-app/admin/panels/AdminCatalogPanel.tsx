'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowUp01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { AdminGroup, AdminMainService, AdminSubService, catalogAdminService, ReorderLevel } from '@/services/catalog-admin.service';
import { PriceUnit } from '@/types/service.types';
import { inputClass, ServiceContentEditor, smallButton, useAction } from './ServiceContentEditor';

/*
 * The admin's catalog editor: top-bar categories (add, rename, order, hide), which category each main service sits
 * in, the Overview / How to order / Details / FAQ of main services and sub-services, and every sub-service's
 * priced options (variants). Names, pictures and prices of main and sub-services stay in their own editors.
 */
export function AdminCatalogPanel({ onClose }: { onClose: () => void }) {
  const { data: groups = [], isLoading } = useQuery({ queryKey: ['admin-catalog-tree'], queryFn: catalogAdminService.tree });
  const { data: ungrouped = [] } = useQuery({ queryKey: ['admin-catalog-ungrouped'], queryFn: catalogAdminService.ungrouped });
  const [newGroup, setNewGroup] = useState('');
  const create = useAction((name: string) => catalogAdminService.createGroup({ name }), 'Category added');
  const reorder = useAction(({ level, items }: { level: ReorderLevel; items: Array<{ id: string; sortOrder: number }> }) => catalogAdminService.reorder(level, items));

  return (
    <SidePanelShell title="Catalog editor" onClose={onClose}>
      <p className="truncate text-[18px] font-semibold tracking-[-0.36px] text-ink">Category </p>

      <form
        className="mt-[16px] flex gap-[8px]"
        onSubmit={(event) => {
          event.preventDefault();
          if (newGroup.trim()) create.mutate(newGroup.trim(), { onSuccess: () => setNewGroup('') });
        }}
      >
        <input value={newGroup} onChange={(event) => setNewGroup(event.target.value)} maxLength={100} placeholder="নতুন Category (যেমন: Cleaning Solution)" className={inputClass} />
        <button type="submit" disabled={!newGroup.trim() || create.isPending} className={`${smallButton} shrink-0 bg-primary text-white`}>
          Add
        </button>
      </form>

      {isLoading && <p className="mt-[20px] text-center text-[14px] text-muted">Loading...</p>}

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {groups.map((group, index) => (
          <GroupCard
            key={group.id}
            group={group}
            groups={groups}
            onMove={(direction) => {
              const next = [...groups];
              const [moved] = next.splice(index, 1);
              next.splice(index + direction, 0, moved);
              reorder.mutate({ level: 'group', items: next.map((item, sortOrder) => ({ id: item.id, sortOrder })) });
            }}
            canMoveUp={index > 0}
            canMoveDown={index < groups.length - 1}
          />
        ))}
      </div>

      {ungrouped.length > 0 && (
        <section className="mt-[20px] rounded-[12px] border border-amber-200 bg-amber-50 p-[12px]">
          <p className="mb-[8px] text-[14px] font-semibold text-amber-900">কোনো Category-তে নেই (কাস্টমার এগুলো দেখে না)</p>
          {ungrouped.map((main) => (
            <MoveToGroup key={main.id} main={main} groups={groups} />
          ))}
        </section>
      )}
    </SidePanelShell>
  );
}

function GroupCard({ group, groups, onMove, canMoveUp, canMoveDown }: { group: AdminGroup; groups: AdminGroup[]; onMove: (direction: -1 | 1) => void; canMoveUp: boolean; canMoveDown: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const update = useAction((body: Parameters<typeof catalogAdminService.updateGroup>[1]) => catalogAdminService.updateGroup(group.id, body), 'Saved');
  const remove = useAction(() => catalogAdminService.deleteGroup(group.id), 'Category removed');
  const reorder = useAction((items: Array<{ id: string; sortOrder: number }>) => catalogAdminService.reorder('mainService', items));

  const moveMain = (index: number, direction: -1 | 1) => {
    const next = [...group.categories];
    const [moved] = next.splice(index, 1);
    next.splice(index + direction, 0, moved);
    reorder.mutate(next.map((item, sortOrder) => ({ id: item.id, sortOrder })));
  };

  return (
    <section className={`rounded-[12px] border ${group.isActive ? 'border-line' : 'border-dashed border-line opacity-70'}`}>
      <div className="flex items-center gap-[6px] p-[10px]">
        <button type="button" onClick={() => setIsOpen((value) => !value)} className="min-w-0 flex-1 cursor-pointer text-left">
          <p className="truncate text-[15px] font-semibold text-ink">{group.name}</p>
          <p className="text-[12px] text-muted">{group.categories.length} main services{group.isActive ? '' : ' · hidden'}</p>
        </button>
        <MoveButtons onMove={onMove} canMoveUp={canMoveUp} canMoveDown={canMoveDown} />
      </div>

      {isOpen && (
        <div className="border-t border-line p-[10px]">
          <div className="flex gap-[6px]">
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className={inputClass} />
            <button type="button" disabled={!name.trim() || name === group.name} onClick={() => update.mutate({ name: name.trim() })} className={`${smallButton} shrink-0 bg-primary text-white`}>
              Rename
            </button>
          </div>
          <div className="mt-[8px] flex gap-[6px]">
            <button type="button" onClick={() => update.mutate({ isActive: !group.isActive })} className={`${smallButton} border border-line text-ink`}>
              {group.isActive ? 'Hide' : 'Show'}
            </button>
            <button
              type="button"
              disabled={group.categories.length > 0}
              title={group.categories.length > 0 ? 'Move its main services first' : undefined}
              onClick={() => remove.mutate(undefined)}
              className={`${smallButton} border border-[#d64545] text-[#d64545]`}
            >
              Delete
            </button>
          </div>

          <div className="mt-[12px] flex flex-col gap-[8px]">
            {group.categories.map((main, index) => (
              <MainServiceEditor key={main.id} main={main} groups={groups} onMove={(direction) => moveMain(index, direction)} canMoveUp={index > 0} canMoveDown={index < group.categories.length - 1} />
            ))}
            {group.categories.length === 0 && <p className="text-[13px] text-muted">নতুন main service বানাতে Services তালিকার + → New Category ব্যবহার করুন, তারপর এখানে Category বাছুন।</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function MainServiceEditor({ main, groups, onMove, canMoveUp, canMoveDown }: { main: AdminMainService; groups: AdminGroup[]; onMove: (direction: -1 | 1) => void; canMoveUp: boolean; canMoveDown: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-[10px] bg-surface">
      <div className="flex items-center gap-[6px] p-[8px]">
        <button type="button" onClick={() => setIsOpen((value) => !value)} className="min-w-0 flex-1 cursor-pointer text-left">
          <p className="truncate text-[14px] font-semibold text-ink">
            {main.iconUrl && !main.iconUrl.startsWith('http') ? `${main.iconUrl} ` : ''}
            {main.name}
          </p>
          <p className="text-[12px] text-muted">{main.services.length} sub services</p>
        </button>
        <MoveButtons onMove={onMove} canMoveUp={canMoveUp} canMoveDown={canMoveDown} />
      </div>
      {isOpen && (
        <div className="flex flex-col gap-[10px] border-t border-line p-[8px]">
          <MoveToGroup main={main} groups={groups} />
          <ServiceContentEditor
            kind="main"
            id={main.id}
            initial={{ included: main.included, excluded: main.excluded, details: main.details ?? '', howToOrder: main.howToOrder }}
            faqs={main.faqs}
          />
          <p className="pt-[4px] text-[13px] font-semibold text-ink">Sub services</p>
          {main.services.map((sub) => (
            <SubServiceEditor key={sub.id} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MoveToGroup({ main, groups }: { main: Pick<AdminMainService, 'id' | 'name' | 'groupId'>; groups: AdminGroup[] }) {
  const move = useAction((groupId: string) => catalogAdminService.updateMainService(main.id, { groupId }), 'Moved');
  return (
    <label className="flex items-center gap-[8px] text-[13px] text-ink">
      <span className="shrink-0">{main.groupId ? 'Category' : main.name}</span>
      <select value={main.groupId ?? ''} onChange={(event) => event.target.value && move.mutate(event.target.value)} className={inputClass}>
        <option value="">Category বাছুন</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubServiceEditor({ sub }: { sub: AdminSubService }) {
  const [isOpen, setIsOpen] = useState(false);
  const prices = sub.variants.map((variant) => Number(variant.price));
  return (
    <div className="rounded-[8px] border border-line bg-white">
      <button type="button" onClick={() => setIsOpen((value) => !value)} className="flex w-full cursor-pointer items-center justify-between gap-[8px] p-[8px] text-left">
        <span className="truncate text-[13px] font-semibold text-ink">{sub.nameBn || sub.name}</span>
        <span className="shrink-0 text-[12px] text-muted">
          {sub.variants.length} options{prices.length ? ` · from ${formatTaka(Math.min(...prices))}` : ''}
        </span>
      </button>
      {isOpen && (
        <div className="flex flex-col gap-[10px] border-t border-line p-[8px]">
          <VariantsEditor sub={sub} />
          <ServiceContentEditor kind="sub" id={sub.id} initial={{ included: sub.included, excluded: sub.excluded, details: sub.details ?? '' }} faqs={sub.faqs} />
        </div>
      )}
    </div>
  );
}

const PRICE_UNITS: Array<{ value: PriceUnit; label: string }> = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'PER_UNIT', label: 'Per unit' },
  { value: 'PER_SQFT', label: 'Per sqft' },
];

export function VariantsEditor({ sub }: { sub: AdminSubService }) {
  const [draft, setDraft] = useState({ name: '', price: '', originalPrice: '', priceUnit: 'FIXED' as PriceUnit });
  const create = useAction(
    () =>
      catalogAdminService.createVariant({
        serviceId: sub.id,
        name: draft.name.trim(),
        price: Number(draft.price),
        originalPrice: draft.originalPrice ? Number(draft.originalPrice) : undefined,
        priceUnit: draft.priceUnit,
      }),
    'Option added',
  );
  const remove = useAction((id: string) => catalogAdminService.deleteVariant(id), 'Option removed');
  const isValid = draft.name.trim() && Number(draft.price) >= 0 && draft.price !== '';

  return (
    <div>
      <p className="mb-[6px] text-[13px] font-semibold text-ink">Options (দাম)</p>
      <ul className="flex flex-col gap-[4px]">
        {sub.variants.map((variant) => (
          <VariantRow key={variant.id} variant={variant} onDelete={() => remove.mutate(variant.id)} />
        ))}
      </ul>
      <form
        className="mt-[8px] grid grid-cols-2 gap-[6px] sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (isValid) create.mutate(undefined, { onSuccess: () => setDraft({ name: '', price: '', originalPrice: '', priceUnit: 'FIXED' }) });
        }}
      >
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="1 - 2.5 Ton" maxLength={100} className={inputClass} />
        <input value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="দাম" inputMode="decimal" className={inputClass} />
        <input value={draft.originalPrice} onChange={(event) => setDraft({ ...draft, originalPrice: event.target.value })} placeholder="আগের দাম" inputMode="decimal" className={inputClass} />
        <select value={draft.priceUnit} onChange={(event) => setDraft({ ...draft, priceUnit: event.target.value as PriceUnit })} className={inputClass}>
          {PRICE_UNITS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!isValid || create.isPending} className={`${smallButton} bg-primary text-white`}>
          Add
        </button>
      </form>
    </div>
  );
}

function VariantRow({ variant, onDelete }: { variant: AdminSubService['variants'][number]; onDelete: () => void }) {
  const [price, setPrice] = useState(String(Number(variant.price)));
  const [originalPrice, setOriginalPrice] = useState(variant.originalPrice != null ? String(Number(variant.originalPrice)) : '');
  const save = useAction(() => catalogAdminService.updateVariant(variant.id, { price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : null }), 'Price saved');
  const isChanged = Number(price) !== Number(variant.price) || (originalPrice || null) !== (variant.originalPrice != null ? String(Number(variant.originalPrice)) : null);

  return (
    <li className="flex items-center gap-[6px] text-[13px]">
      <span className="min-w-0 flex-1 truncate text-ink">
        {variant.name} <span className="text-[11px] text-muted">{variant.priceUnit !== 'FIXED' ? `(${variant.priceUnit === 'PER_UNIT' ? 'per unit' : 'per sqft'})` : ''}</span>
      </span>
      <input aria-label="Price" value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" className={`${inputClass} w-[80px]`} />
      <input aria-label="Old price" value={originalPrice} onChange={(event) => setOriginalPrice(event.target.value)} placeholder="আগের" inputMode="decimal" className={`${inputClass} w-[80px]`} />
      {isChanged && (
        <button type="button" onClick={() => save.mutate(undefined)} className={`${smallButton} bg-primary text-white`}>
          Save
        </button>
      )}
      <button type="button" aria-label={`Delete ${variant.name}`} onClick={onDelete} className="cursor-pointer rounded-full p-[4px] text-[#d64545] hover:bg-[#fdecec]">
        <HugeiconsIcon icon={Delete02Icon} size={15} />
      </button>
    </li>
  );
}

function MoveButtons({ onMove, canMoveUp, canMoveDown }: { onMove: (direction: -1 | 1) => void; canMoveUp: boolean; canMoveDown: boolean }) {
  const button = 'cursor-pointer rounded-full p-[4px] text-ink hover:bg-surface disabled:cursor-not-allowed disabled:opacity-30';
  return (
    <div className="flex shrink-0">
      <button type="button" aria-label="Move up" disabled={!canMoveUp} onClick={() => onMove(-1)} className={button}>
        <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
      </button>
      <button type="button" aria-label="Move down" disabled={!canMoveDown} onClick={() => onMove(1)} className={button}>
        <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
      </button>
    </div>
  );
}
