'use client';

import { useState } from 'react';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { useAssignableProviders, useAssignOrder } from '@/hooks/useAssignOrder';
import { AssignableProvider, AssignmentMode } from '@/services/admin-orders.service';
import { SupportAvatar } from '../../support/SupportAvatar';

const MODES: Array<{ mode: AssignmentMode; title: string; text: string }> = [
  { mode: 'OFFER', title: 'Offer', text: 'The provider can accept or decline. If they do not answer in 15 minutes the order goes back to automatic offers.' },
  { mode: 'ASSIGN', title: 'Assign directly', text: 'The order is theirs at once and the work starts, as if they had accepted it. Use it for urgent cases.' },
];

const displayName = (provider: AssignableProvider) => provider.companyName || provider.user.name || provider.user.username || provider.user.mobileNumber;

function ProviderRow({ provider, isSelected, onSelect }: { provider: AssignableProvider; isSelected: boolean; onSelect: () => void }) {
  const coverage = provider.coversUpazila ? 'Covers this upazila' : provider.coversDistrict ? 'Covers this district' : 'Other area';
  return (
    <button
      type="button"
      disabled={!provider.canAssign}
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[12px] border p-[10px] text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isSelected ? 'border-primary bg-secondary' : 'border-line bg-white hover:bg-surface'}`}
    >
      <SupportAvatar name={displayName(provider)} photo={provider.user.profilePhoto} sizeClass="size-[40px]" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[14px] font-semibold text-ink">{displayName(provider)}</span>
        <span className="truncate text-[12px] font-medium text-muted">
          {provider.user.mobileNumber} · {provider.rating > 0 ? `★ ${provider.rating.toFixed(1)}` : 'New'}
        </span>
        {provider.canAssign ? (
          <span className={`text-[12px] font-semibold ${provider.coversUpazila ? 'text-primary' : provider.coversDistrict ? 'text-[#b7791f]' : 'text-muted'}`}>
            {coverage}
            {provider.hasOpenOffer && ' · has an open offer'}
          </span>
        ) : (
          <span className="text-[12px] font-semibold text-[#d64545]">{provider.blockedReason}</span>
        )}
      </span>
    </button>
  );
}

/*
 * Sends an order nobody accepted to one chosen provider, as an offer or directly. The list is ranked by the
 * backend (who can take it and covers the place first); the backend repeats every check when the admin sends.
 */
export function AdminAssignOrderPanel({ adminId, orderId, onClose }: { adminId: string; orderId: string; onClose: () => void }) {
  const { data: providers = [], isLoading, isError } = useAssignableProviders(adminId, orderId);
  const assign = useAssignOrder(adminId, orderId, onClose);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<AssignmentMode>('OFFER');

  const term = search.trim().toLowerCase();
  const visible = providers.filter((provider) => !term || `${displayName(provider)} ${provider.user.mobileNumber}`.toLowerCase().includes(term));
  const selected = providers.find((provider) => provider.id === selectedId && provider.canAssign);
  const isOutsideArea = Boolean(selected && !selected.coversUpazila && !selected.coversDistrict);

  return (
    <SidePanelShell title="Send to a provider" onClose={onClose}>
      <div className="pb-[24px]">
        <fieldset className="mb-[16px] flex flex-col gap-[8px]">
          {MODES.map((option) => (
            <label key={option.mode} className={`flex cursor-pointer gap-[10px] rounded-[12px] border p-[10px] ${mode === option.mode ? 'border-primary bg-secondary' : 'border-line'}`}>
              <input type="radio" name="assign-mode" checked={mode === option.mode} onChange={() => setMode(option.mode)} className="mt-[3px] accent-primary" />
              <span>
                <span className="block text-[14px] font-semibold text-ink">{option.title}</span>
                <span className="block text-[12px] font-medium leading-relaxed text-muted">{option.text}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search providers..." className="mb-[10px] h-[40px] w-full rounded-[8px] border border-line px-[10px] text-[14px] text-ink outline-none focus:border-primary" />

        {isLoading && <p className="text-[14px] font-medium text-muted">Loading providers...</p>}
        {isError && <p className="text-[14px] font-medium text-[#d64545]">This order is no longer waiting for a provider.</p>}
        <ul className="flex flex-col gap-[8px]">
          {visible.map((provider) => (
            <li key={provider.id}>
              <ProviderRow provider={provider} isSelected={provider.id === selected?.id} onSelect={() => setSelectedId(provider.id)} />
            </li>
          ))}
        </ul>
        {!isLoading && !isError && visible.length === 0 && <p className="py-[12px] text-[14px] font-medium text-muted">No provider found.</p>}

        {isOutsideArea && <p className="mt-[12px] rounded-[10px] bg-[#fff4e5] p-[10px] text-[13px] font-medium text-[#b7791f]">This provider does not cover the order&apos;s area. You can still send it.</p>}

        <div className="mt-[20px] flex justify-center">
          <button
            type="button"
            disabled={!selected || assign.isPending}
            onClick={() => selected && assign.mutate({ providerId: selected.id, mode })}
            className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {assign.isPending ? 'Sending...' : mode === 'OFFER' ? 'Send offer' : 'Assign order'}
          </button>
        </div>
      </div>
    </SidePanelShell>
  );
}
