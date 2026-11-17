'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { Order } from '@/types/order.types';

/*
 * Assign Worker. By the platform's role policy only an administrator can attach a technician to an
 * order (auth/role-policy.ts), so this panel shows who is on the job and says so, instead of offering
 * a choice the backend would refuse.
 */
export function AssignWorkerPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const worker = order.assignee?.technician;

  return (
    <SidePanelShell title="Assign Worker" onClose={onClose}>
      <p className="text-[13px] font-medium text-[#697586]">Worker on this order</p>
      <p className="mt-[6px] text-[16px] font-semibold text-[#202939]">{worker ?? 'No worker assigned yet'}</p>

      <p className="mt-[20px] rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px] text-[13px] font-medium text-[#697586]">
        Workers are assigned to orders by the platform administrator for now. Ask support to assign one to this order.
      </p>
    </SidePanelShell>
  );
}
