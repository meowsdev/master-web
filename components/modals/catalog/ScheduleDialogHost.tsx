'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SchedulePickerDialog } from '@/components/modals/place-order/SchedulePickerDialog';
import { orderPlacementService } from '@/services/order-placement.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { useScheduleStore } from '@/store/useScheduleStore';

/*
 * The calendar of "Tap to Schedule", wherever it was tapped (a package card, the options panel or the cart bar).
 * Only the day and time are asked here; Confirm keeps them and opens the order confirmation on the right.
 */
export function ScheduleDialogHost() {
  const pickingFor = useScheduleStore((state) => state.pickingFor);
  const current = useScheduleStore((state) => (state.pickingFor ? state.schedules[state.pickingFor] : undefined));
  const stopPicking = useScheduleStore((state) => state.stopPicking);
  const setSchedule = useScheduleStore((state) => state.setSchedule);
  const openCheckout = useCatalogPanelStore((state) => state.openCheckout);
  // Same cache as the Place Order form: the time windows customers may pick.
  const { data: catalog } = useQuery({ queryKey: ['order-catalog'], queryFn: orderPlacementService.getCatalog, staleTime: 60_000, enabled: Boolean(pickingFor) });

  if (!pickingFor) return null;
  return (
    <SchedulePickerDialog
      timeSlots={catalog?.timeSlots ?? []}
      initialDate={current?.date ?? ''}
      initialTimeSlot={current?.timeSlot ?? ''}
      onClose={stopPicking}
      onConfirm={(date, timeSlot) => {
        setSchedule(pickingFor, { date, timeSlot });
        stopPicking();
        openCheckout(pickingFor);
      }}
    />
  );
}

/**
 * Tap to Schedule for one main service's cart: opens the calendar. Guests are sent to sign in first (or told to,
 * when the caller has no sign-in to open). Returns false when the calendar did not open.
 */
export function useTapToSchedule(onRequireAuth?: () => void) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const startPicking = useScheduleStore((state) => state.startPicking);
  return (mainServiceId: string) => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      else toast.info('অর্ডার করতে আগে লগইন করুন');
      return false;
    }
    startPicking(mainServiceId);
    return true;
  };
}
