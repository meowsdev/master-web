'use client';

import { useMemo, useState } from 'react';
import { useProviderSkills, useSaveProviderSkills } from '@/hooks/useProviderSkills';
import { Service } from '@/types/service.types';

const selectClass =
  'h-[44px] w-full cursor-pointer rounded-[10px] border border-line bg-white px-[12px] text-[15px] font-medium text-ink outline-none focus:border-primary';

interface MainService {
  id: string;
  name: string;
  subServices: Service[];
}

/*
 * "Services I offer": pick a main service, then tick the sub-services under it that this provider takes orders
 * for (the same flow as district -> upazila below). Ticks are kept while moving between main services. Only a
 * ticked sub-service sends them new orders, and without any they get none. It lives inside Edit Profile and
 * saves on its own button.
 */
export function ProviderSkillsSection({ userId }: { userId: string }) {
  const { services, mySkills, isLoading } = useProviderSkills(userId);
  const save = useSaveProviderSkills(userId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);
  const [mainServiceId, setMainServiceId] = useState<string | null>(null);

  // Adopt the saved skills once, when they arrive (state derived during render, no effect); after that the edits win.
  if (mySkills && !hasLoadedSaved) {
    setHasLoadedSaved(true);
    setSelectedIds(new Set(mySkills.map((skill) => skill.serviceId)));
    // Open on the main service of the first saved skill, so what they offer is in front of them.
    const first = services.find((service) => service.id === mySkills[0]?.serviceId);
    if (first) setMainServiceId(first.categoryId);
  }

  const mainServices = useMemo(() => {
    const byId = new Map<string, MainService>();
    services.forEach((service) => {
      if (!byId.has(service.categoryId)) byId.set(service.categoryId, { id: service.categoryId, name: service.category?.name ?? 'General services', subServices: [] });
      byId.get(service.categoryId)!.subServices.push(service);
    });
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  const countsByMain = useMemo(() => {
    const counts = new Map<string, number>();
    services.forEach((service) => selectedIds.has(service.id) && counts.set(service.categoryId, (counts.get(service.categoryId) ?? 0) + 1));
    return counts;
  }, [services, selectedIds]);

  const shown = mainServices.find((main) => main.id === mainServiceId)?.subServices ?? [];
  const allShownSelected = shown.length > 0 && shown.every((service) => selectedIds.has(service.id));

  const toggle = (serviceId: string) =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });

  const toggleAllShown = () =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      shown.forEach((service) => (allShownSelected ? next.delete(service.id) : next.add(service.id)));
      return next;
    });

  return (
    <section className="w-full border-t border-line pt-[24px]">
      <h4 className="text-[16px] font-semibold text-ink">Services I offer</h4>
      <p className="mt-[4px] text-[13px] font-medium leading-relaxed text-muted">
        Choose a main service, then tick the services under it that you provide. New orders reach you only for these.
        {hasLoadedSaved && selectedIds.size === 0 && <span className="font-semibold text-[#b7791f]"> You have none ticked, so you get no new orders.</span>}
      </p>

      <select value={mainServiceId ?? ''} onChange={(event) => setMainServiceId(event.target.value || null)} className={`mt-[12px] ${selectClass}`} aria-label="Main service">
        <option value="">{isLoading ? 'Loading services...' : 'Choose a main service'}</option>
        {mainServices.map((main) => (
          <option key={main.id} value={main.id}>
            {main.name}
            {countsByMain.get(main.id) ? ` · ${countsByMain.get(main.id)}` : ''}
          </option>
        ))}
      </select>

      {mainServiceId !== null && (
        <div className="mt-[12px] flex flex-col gap-[10px]">
          {shown.length > 0 && (
            <button type="button" onClick={toggleAllShown} className="w-fit cursor-pointer text-[14px] font-semibold text-primary hover:underline">
              {allShownSelected ? 'Clear this service' : 'Select the whole service'}
            </button>
          )}
          <div className="flex flex-wrap gap-[8px]">
            {shown.map((service) => {
              const isOn = selectedIds.has(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => toggle(service.id)}
                  className={`h-[34px] cursor-pointer rounded-full border px-[12px] text-[13px] font-medium transition-colors ${isOn ? 'border-secondary bg-secondary text-ink' : 'border-line bg-white text-muted hover:bg-surface'}`}
                >
                  {service.nameBn || service.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-[16px] flex items-center justify-between gap-[12px]">
        <span className="text-[13px] font-semibold text-ink">
          {selectedIds.size === 0 ? 'Nothing chosen yet' : `${selectedIds.size} service(s) in ${countsByMain.size} main service(s)`}
        </span>
        <button
          type="button"
          disabled={save.isPending || isLoading}
          onClick={() => save.mutate([...selectedIds])}
          className="h-[38px] cursor-pointer rounded-[8px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {save.isPending ? 'Saving...' : 'Save services'}
        </button>
      </div>
    </section>
  );
}
