'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { usePlaceOrderForm } from '@/hooks/usePlaceOrderForm';
import { Order } from '@/types/order.types';
import { ServiceAvatar } from './ServiceAvatar';
import { ProblemSection } from './ProblemSection';
import { ScheduleSection } from './ScheduleSection';
import { OrderQuoteSummary } from './OrderQuoteSummary';

interface PlaceOrderPanelProps {
  /** The sub-service whose chat is open, if any; otherwise the customer picks from the start. */
  initialServiceId: string | null;
  onClose: () => void;
  onPlaced: (order: Order) => void;
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

        {state.quote && <OrderQuoteSummary quote={state.quote} />}

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
        {!state.isReady && state.missingFields.length > 0 && (
          <p className="mt-[10px] text-center text-[12px] font-medium text-[#697586]">বাকি আছে: {state.missingFields.join(', ')}</p>
        )}
      </div>
    </SidePanelShell>
  );
}
