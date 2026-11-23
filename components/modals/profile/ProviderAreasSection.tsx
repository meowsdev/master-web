'use client';

import { useMemo, useState } from 'react';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { useProviderAreas, useSaveProviderAreas } from '@/hooks/useProviderAreas';

const selectClass =
  'h-[44px] w-full cursor-pointer rounded-[10px] border border-line bg-white px-[12px] text-[15px] font-medium text-ink outline-none focus:border-primary';

/*
 * "Where I work": the upazilas where this provider takes orders. A new order is offered to the providers of its
 * upazila first, then of its district, so a provider with no area gets no new orders at all. It lives inside
 * Edit Profile and saves on its own button.
 */
export function ProviderAreasSection({ userId }: { userId: string }) {
  const { data: savedAreas, isLoading } = useProviderAreas(userId);
  const save = useSaveProviderAreas(userId);

  // upazila id -> district id, so a saved upazila keeps its district without another request.
  const [selected, setSelected] = useState<Map<number, number>>(new Map());
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const { districts, upazilas, isLoadingUpazilas } = useLocationOptions(districtId);

  // Adopt the saved areas once, when they arrive (state derived during render, the React-endorsed way to
  // seed state from loaded data without an effect); after that the panel's own edits win.
  if (savedAreas && !hasLoadedSaved) {
    setHasLoadedSaved(true);
    setSelected(new Map(savedAreas.map((area) => [area.upazilaId, area.districtId])));
    setDistrictId(savedAreas[0]?.districtId ?? null);
  }

  const countsByDistrict = useMemo(() => {
    const counts = new Map<number, number>();
    selected.forEach((district) => counts.set(district, (counts.get(district) ?? 0) + 1));
    return counts;
  }, [selected]);

  const toggleUpazila = (upazilaId: number) => {
    if (districtId === null) return;
    setSelected((previous) => {
      const next = new Map(previous);
      if (next.has(upazilaId)) next.delete(upazilaId);
      else next.set(upazilaId, districtId);
      return next;
    });
  };

  const allShownSelected = upazilas.length > 0 && upazilas.every((upazila) => selected.has(upazila.id));
  const toggleAllShown = () => {
    if (districtId === null) return;
    setSelected((previous) => {
      const next = new Map(previous);
      upazilas.forEach((upazila) => (allShownSelected ? next.delete(upazila.id) : next.set(upazila.id, districtId)));
      return next;
    });
  };

  const handleSave = () => save.mutate([...selected].map(([upazilaId, district]) => ({ districtId: district, upazilaId })));

  return (
    <section className="w-full border-t border-line pt-[24px]">
      <h4 className="text-[16px] font-semibold text-ink">Where I work</h4>
      <p className="mt-[4px] text-[13px] font-medium leading-relaxed text-muted">
        Pick the upazilas where you take orders. New orders are offered to providers of the customer&apos;s upazila first, then of the same district.
        {hasLoadedSaved && selected.size === 0 && <span className="font-semibold text-[#b7791f]"> You have no area, so you get no new orders.</span>}
      </p>

      <select value={districtId ?? ''} onChange={(event) => setDistrictId(event.target.value ? Number(event.target.value) : null)} className={`mt-[12px] ${selectClass}`} aria-label="District">
        <option value="">Choose a district</option>
        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.bnName} ({district.name}){countsByDistrict.get(district.id) ? ` · ${countsByDistrict.get(district.id)}` : ''}
          </option>
        ))}
      </select>

      {districtId !== null && (
        <div className="mt-[12px] flex flex-col gap-[10px]">
          {isLoadingUpazilas && <p className="text-[14px] font-medium text-muted">Loading upazilas...</p>}
          {upazilas.length > 0 && (
            <button type="button" onClick={toggleAllShown} className="w-fit cursor-pointer text-[14px] font-semibold text-primary hover:underline">
              {allShownSelected ? 'Clear this district' : 'Select the whole district'}
            </button>
          )}
          <div className="flex flex-wrap gap-[8px]">
            {upazilas.map((upazila) => {
              const isOn = selected.has(upazila.id);
              return (
                <button
                  key={upazila.id}
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => toggleUpazila(upazila.id)}
                  className={`h-[34px] cursor-pointer rounded-full border px-[12px] text-[13px] font-medium transition-colors ${isOn ? 'border-secondary bg-secondary text-ink' : 'border-line bg-white text-muted hover:bg-surface'}`}
                >
                  {upazila.bnName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-[16px] flex items-center justify-between gap-[12px]">
        <span className="text-[13px] font-semibold text-ink">{selected.size === 0 ? 'No area chosen yet' : `${selected.size} upazila(s) in ${countsByDistrict.size} district(s)`}</span>
        <button
          type="button"
          disabled={isLoading || save.isPending}
          onClick={handleSave}
          className="h-[38px] cursor-pointer rounded-[8px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {save.isPending ? 'Saving...' : 'Save areas'}
        </button>
      </div>
    </section>
  );
}
