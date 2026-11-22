'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { useAdminMember, useModerateMember } from '@/hooks/useAdminMember';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { SupportAvatar } from '../../support/SupportAvatar';
import { CustomerSections } from './CustomerSections';
import { Fact, ReviewList, Section, StatusBadges, formatDate } from './MemberParts';
import { MemberActions } from './MemberActions';
import { ProviderSections } from './ProviderSections';
import { TechnicianProviderControl } from './TechnicianProviderControl';

const ROLE_LABEL = { PROVIDER: 'Provider', TECHNICIAN: 'Technician', CUSTOMER: 'Customer' } as const;

/*
 * Right-hand "details" panel of a provider, technician or customer, opened from the name in a support
 * chat. Everything shown comes from the backend; the action buttons only ask it to act.
 */
export function MemberDetailsPanel({ adminId, memberId, onClose }: { adminId: string; memberId: string; onClose: () => void }) {
  const { data: member, isLoading, isError } = useAdminMember(adminId, memberId);
  const moderate = useModerateMember(adminId, memberId);
  const { canBanMembers, canManageTechnicians } = useStaffPermissions();

  return (
    <SidePanelShell title={member ? ROLE_LABEL[member.role] : 'Details'} onClose={onClose}>
      {isLoading && <p className="text-[14px] font-medium text-[#697586]">Loading details...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">Could not load the details.</p>}
      {member && (
        <div>
          <div className="flex items-center gap-[14px] pb-[16px]">
            <SupportAvatar name={member.name || member.mobileNumber} photo={member.profilePhoto} sizeClass="size-[64px]" />
            <div className="flex min-w-0 flex-col gap-[4px]">
              <p className="truncate text-[18px] font-semibold tracking-[-0.36px] text-[#202939]">{member.name || 'No name yet'}</p>
              {member.username && <p className="truncate text-[13px] font-medium text-[#697586]">@{member.username}</p>}
              <StatusBadges status={member.status} isRestricted={member.isRestricted} />
            </div>
          </div>

          <Section title="Contact">
            <Fact label="Phone">{member.mobileNumber}</Fact>
            {member.email && <Fact label="Email">{member.email}</Fact>}
            {member.area && <Fact label="Area">{member.area}</Fact>}
            {member.addresses.map((address) => (
              <Fact key={address.addressText} label={address.isDefault ? 'Address (default)' : 'Address'}>{address.addressText}</Fact>
            ))}
            <Fact label="Joined">{formatDate(member.createdAt)}</Fact>
            <Fact label="Number verified">{member.isVerified ? 'Yes' : 'No'}</Fact>
          </Section>

          {member.provider && <ProviderSections provider={member.provider} />}
          {member.technician && <TechnicianProviderControl adminId={adminId} technician={member.technician} canChange={canManageTechnicians} />}
          {member.technician && (
            <Section title={`Customer reviews · ${member.technician.reviews.length}`}>
              <ReviewList reviews={member.technician.reviews} />
            </Section>
          )}
          {member.customer && <CustomerSections customer={member.customer} />}

          <MemberActions member={member} canBan={canBanMembers} isBusy={moderate.isPending} onAct={(action, reason) => moderate.mutate({ action, reason })} />

          {member.moderationLog.length > 0 && (
            <Section title="History">
              <ul className="flex flex-col gap-[6px]">
                {member.moderationLog.map((entry) => (
                  <li key={`${entry.action}-${entry.createdAt}`} className="text-[13px] font-medium text-[#202939]">
                    <span className="font-semibold">{entry.action}</span> · {formatDate(entry.createdAt)}
                    {entry.reason && <span className="text-[#697586]"> · {entry.reason}</span>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </SidePanelShell>
  );
}
