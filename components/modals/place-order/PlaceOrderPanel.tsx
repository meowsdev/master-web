'use client';

import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { SavedOrderPlace, usePlaceOrderForm } from '@/hooks/usePlaceOrderForm';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
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
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // The district, upazila and address of the last order are kept on the profile and fill the form again.
  const savedPlace: SavedOrderPlace | null = user
    ? {
        districtId: user.districtId ?? null,
        upazilaId: user.upazilaId ?? null,
        addressDetail: user.addresses?.find((address) => address.isDefault)?.addressText ?? '',
      }
    : null;

  const state = usePlaceOrderForm({
    initialServiceId,
    savedPlace,
    onPlaced: (order) => {
      // The backend saved this place on the profile; reloading the account lets the next form open with it.
      authService
        .getMe()
        .then(setUser)
        .catch(() => undefined);
      onPlaced(order);
    },
  });

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
            className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            {state.isSubmitting ? 'Placing order...' : 'Confirm & Chat'}
          </button>
        </div>
        {!state.isReady && state.missingFields.length > 0 && (
          <p className="mt-[10px] text-center text-[12px] font-medium text-muted">বাকি আছে: {state.missingFields.join(', ')}</p>
        )}
      </div>
    </SidePanelShell>
  );
}
