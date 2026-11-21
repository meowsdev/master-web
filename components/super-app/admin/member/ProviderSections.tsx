import { formatTaka } from '@/components/modals/place-order/format-taka';
import { MemberDetails } from '@/types/admin-member.types';
import { Fact, OrderCounts, ReviewList, Section, StatusBadges, formatDate } from './MemberParts';

/* A provider: business info, standing, areas, and the technicians who work under them. */
export function ProviderSections({ provider }: { provider: NonNullable<MemberDetails['provider']> }) {
  return (
    <>
      <Section title="Provider">
        {provider.companyName && <Fact label="Company">{provider.companyName}</Fact>}
        <Fact label="Level">{provider.level}</Fact>
        <Fact label="Rating">{provider.rating > 0 ? `★ ${provider.rating.toFixed(1)}` : 'New'}</Fact>
        <Fact label="Experience">{provider.experienceYears} year(s)</Fact>
        <Fact label="KYC">{provider.kyc?.status ?? 'Not submitted'}</Fact>
        <Fact label="Services enabled">{provider.skillCount}</Fact>
        <Fact label="Takes orders">{provider.isAvailable ? 'Yes' : 'No'}</Fact>
        {provider.isBlockedForNegative && <Fact label="Wallet">Blocked (negative balance)</Fact>}
        {provider.dueAmount > 0 && <Fact label="Owes the platform"><span className="text-[#d64545]">{formatTaka(provider.dueAmount)}</span></Fact>}
        {provider.bio && <p className="mt-[8px] text-[14px] font-medium leading-relaxed text-[#202939]">{provider.bio}</p>}
      </Section>

      <Section title={`Orders · ${provider.totalCompletedOrders} completed`}>
        <OrderCounts byStatus={provider.ordersByStatus} />
      </Section>

      <Section title={`Customer reviews · ${provider.reviews.length}`}>
        <ReviewList reviews={provider.reviews} />
      </Section>

      <Section title="Areas served">
        {provider.areas.length === 0 ? (
          <p className="text-[14px] font-medium text-[#d64545]">No area chosen: this provider gets no new orders.</p>
        ) : (
          <p className="flex flex-wrap gap-[6px]">
            {provider.areas.map((area) => (
              <span key={area.upazilaId} className="rounded-full bg-[#f7f5f3] px-[10px] py-[3px] text-[12px] font-semibold text-[#202939]">{area.name ?? area.upazilaId}</span>
            ))}
          </p>
        )}
      </Section>

      <Section title={`Technicians · ${provider.technicians.length}`}>
        {provider.technicians.length === 0 && <p className="text-[14px] font-medium text-[#697586]">No technicians yet.</p>}
        <ul className="flex flex-col gap-[10px]">
          {provider.technicians.map((technician) => (
            <li key={technician.id} className="rounded-[10px] bg-[#f7f5f3] p-[10px]">
              <div className="flex items-center justify-between gap-[8px]">
                <p className="truncate text-[14px] font-semibold text-[#202939]">
                  {technician.name || 'Unnamed'}
                  {technician.username && <span className="font-medium text-[#697586]"> @{technician.username}</span>}
                </p>
                <StatusBadges status={technician.status} isRestricted={false} />
              </div>
              <p className="mt-[2px] text-[13px] font-medium text-[#697586]">{technician.mobileNumber}</p>
              <p className="text-[12px] font-medium text-[#697586]">Last login: {technician.lastLoginAt ? formatDate(technician.lastLoginAt) : 'never'}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
