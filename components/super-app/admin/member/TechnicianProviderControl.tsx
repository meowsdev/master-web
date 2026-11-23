'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChangeTechnicianProvider } from '@/hooks/useAdminMember';
import { adminService } from '@/services/admin.service';
import { TechnicianSection } from '@/types/admin-member.types';
import { Fact, Section, formatDate } from './MemberParts';

const selectClass = 'h-[40px] w-full cursor-pointer rounded-[8px] border border-line bg-white px-[10px] text-[14px] font-medium text-ink outline-none focus:border-primary';

/* Which provider a technician works under, and a way to move them to another one or to none. */
export function TechnicianProviderControl({ adminId, technician, canChange }: { adminId: string; technician: TechnicianSection; canChange: boolean }) {
  const { data: providers = [] } = useQuery({ queryKey: ['admin-providers'], queryFn: adminService.listProviders, enabled: canChange });
  const change = useChangeTechnicianProvider(adminId);
  const currentProviderId = technician.provider?.profileId ?? '';
  // null = no edit yet, so the select shows the saved provider.
  const [choice, setChoice] = useState<string | null>(null);
  const selected = choice ?? currentProviderId;

  return (
    <Section title="Technician">
      <Fact label="Works for">{technician.provider ? `${technician.provider.name ?? 'Provider'} · ${technician.provider.mobileNumber}` : 'No provider'}</Fact>
      <Fact label="Orders">{technician.orderCount}</Fact>
      <Fact label="Last login">{technician.lastLoginAt ? formatDate(technician.lastLoginAt) : 'never'}</Fact>

      {/* Only an admin may move a technician to another provider; a manager sees who they work for. */}
      {canChange && (
      <>
      <p className="mb-[6px] mt-[14px] text-[13px] font-semibold text-ink">Change provider</p>
      <select value={selected} onChange={(event) => setChoice(event.target.value)} className={selectClass} aria-label="Provider">
        <option value="">No provider</option>
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.companyName || provider.user.name || provider.user.username || provider.user.mobileNumber}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={selected === currentProviderId || change.isPending}
        onClick={() => change.mutate({ technicianProfileId: technician.profileId, providerProfileId: selected || null }, { onSuccess: () => setChoice(null) })}
        className="mt-[10px] h-[36px] cursor-pointer rounded-[10px] bg-primary px-[16px] text-[14px] font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
      >
        {change.isPending ? 'Saving...' : 'Save provider'}
      </button>
      </>
      )}
    </Section>
  );
}
