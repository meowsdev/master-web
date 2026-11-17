'use client';

import { useQuery } from '@tanstack/react-query';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { adminService } from '@/services/admin.service';

/* Providers: a read-only look at each provider's standing, so the admin sees who owes money or is blocked. */
export function ProvidersPanel({ onClose }: { onClose: () => void }) {
  const { data: providers = [], isLoading } = useQuery({ queryKey: ['admin-providers'], queryFn: adminService.listProviders });

  return (
    <SidePanelShell title="Providers" onClose={onClose}>
      {isLoading && <p className="text-[14px] font-medium text-[#697586]">Loading providers...</p>}
      <ul>
        {providers.map((provider) => {
          const rating = Number(provider.rating);
          return (
            <li key={provider.id} className="border-b border-[#e5e5e5] py-[12px]">
              <div className="flex items-center justify-between gap-[8px]">
                <p className="truncate text-[14px] font-semibold text-[#202939]">
                  {provider.companyName || provider.user.name || provider.user.username}
                  {provider.user.username && <span className="font-medium text-[#697586]"> @{provider.user.username}</span>}
                </p>
                <span className="shrink-0 text-[12px] font-semibold text-[#697586]">{provider.level}</span>
              </div>
              <p className="mt-[2px] text-[12px] font-medium text-[#697586]">{provider.user.mobileNumber}</p>
              <p className="mt-[6px] flex flex-wrap gap-x-[14px] gap-y-[2px] text-[13px] font-medium text-[#202939]">
                <span>★ {rating > 0 ? rating.toFixed(1) : 'New'}</span>
                <span>{provider._count.orders} orders</span>
                <span>{provider.totalCompletedOrders} completed</span>
                <span>KYC: {provider.kyc?.status ?? 'none'}</span>
                {provider.dueAmount > 0 && <span className="font-semibold text-[#d64545]">Owes {formatTaka(provider.dueAmount)}</span>}
                {provider.isBlockedForNegative && <span className="font-semibold text-[#d64545]">Blocked</span>}
              </p>
            </li>
          );
        })}
      </ul>
    </SidePanelShell>
  );
}
