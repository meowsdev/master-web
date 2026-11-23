'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { useAdminCatalog } from '../useAdminCatalog';
import { MoveToGroup } from './AdminCatalogPanel';
import { ServiceContentEditor } from './ServiceContentEditor';

/*
 * One main service, on the right: which category it sits in, and the Overview, FAQ, How to order and Details that
 * every sub-service under it shows (a sub-service's own content wins over these).
 */
export function AdminMainServicePanel({ mainServiceId, onClose }: { mainServiceId: string; onClose: () => void }) {
  const { groups, mains } = useAdminCatalog();
  const main = mains.find((item) => item.id === mainServiceId);
  if (!main) return null;

  return (
    <SidePanelShell title={main.name} onClose={onClose}>
      <div className="flex flex-col gap-[16px] pb-[24px]">
        <section className="flex flex-col gap-[8px] rounded-[16px] bg-[#f7f5f3] p-[14px]">
          <p className="text-[15px] font-semibold text-[#202939]">Category</p>
          <MoveToGroup main={main} groups={groups} />
        </section>
        <section className="flex flex-col gap-[12px] rounded-[16px] bg-[#f7f5f3] p-[14px]">
          <div>
            <p className="text-[15px] font-semibold text-[#202939]">কাস্টমার যা দেখবে</p>
            <p className="text-[12px] text-[#697586]">এখানে যা লিখবেন তা {main.name}-এর সব সার্ভিসে দেখাবে।</p>
          </div>
          <ServiceContentEditor
            key={main.id}
            kind="main"
            id={main.id}
            initial={{ included: main.included, excluded: main.excluded, details: main.details ?? '', howToOrder: main.howToOrder }}
            faqs={main.faqs}
          />
        </section>
      </div>
    </SidePanelShell>
  );
}
