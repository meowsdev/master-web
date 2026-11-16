'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { usePlaceOrderForm } from '@/hooks/usePlaceOrderForm';
import { Order } from '@/types/order.types';
import { ServiceAvatar } from './ServiceAvatar';
import { ProblemSection } from './ProblemSection';
import { ScheduleSection } from './ScheduleSection';
import { formatTaka } from './format-taka';

interface PlaceOrderPanelProps {
  /** The sub-service whose chat is open, if any; otherwise the customer picks from the start. */
  initialServiceId: string | null;
  onClose: () => void;
  onPlaced: (order: Order, scheduleText: string, addressText: string) => void;
}

/* Right-hand "Place Order" panel (replaces the old booking popup). Mounted only while open, so it always starts fresh. */
export function PlaceOrderPanel({ initialServiceId, onClose, onPlaced }: PlaceOrderPanelProps) {
  const state = usePlaceOrderForm({ initialServiceId, onPlaced });

  return (
    <SidePanelShell title="Place Order" onClose={onClose}>
      <div className="pb-[24px]">
        <ServiceAvatar category={state.category} subService={state.subService} />
        <ProblemSection state={state} />
        <ScheduleSection state={state} />

        {state.quote && (
          <div className="mt-[20px] rounded-[12px] border border-[#e5e5e5] bg-[#f7f5f3] p-[14px]">
            {state.quote.lines.map((line) => (
              <div key={line.label} className="flex justify-between text-[13px] font-medium text-[#697586]">
                <span>{line.count > 1 ? `${line.label} × ${line.count}` : line.label}</span>
                <span>{formatTaka(line.amount)}</span>
              </div>
            ))}
            <div className="mt-[8px] flex justify-between border-t border-[#e5e5e5] pt-[8px] text-[15px] font-semibold text-[#202939]">
              <span>Total</span>
              <span>{formatTaka(state.quote.total)}</span>
            </div>
          </div>
        )}

        <div className="mt-[28px] flex justify-center">
          <button
            type="button"
            onClick={state.submit}
            disabled={!state.isReady || state.isSubmitting}
            className="cursor-pointer rounded-[8px] bg-[#1daa61] px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state.isSubmitting ? 'Placing order...' : 'Confirm & Chat'}
          </button>
        </div>
      </div>
    </SidePanelShell>
  );
}
