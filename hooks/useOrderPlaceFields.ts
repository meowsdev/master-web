'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderPlacementService } from '@/services/order-placement.service';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { useAuthStore } from '@/store/useAuthStore';
import type { ScheduleFormState } from '@/components/modals/place-order/ScheduleSection';
import { OrderPlaceFields } from '@/services/catalog.service';

/**
 * Where and when, for the cart checkout and the Custom request: district, upazila, address, date and time slot.
 * Starts filled in with the place of the customer's last order (kept on the profile), like the Place Order form.
 */
export function useOrderPlaceFields(initialSchedule?: { date: string; timeSlot: string }, { forSomeoneElse = false }: { forSomeoneElse?: boolean } = {}) {
  // Staff ordering for a customer start empty: their own saved place is not the customer's.
  const user = useAuthStore((state) => (forSomeoneElse ? null : state.user));
  const hasSavedArea = Boolean(user?.districtId && user?.upazilaId);
  const [districtId, setDistrictId] = useState<number | null>(hasSavedArea ? user!.districtId! : null);
  const [upazilaId, setUpazilaId] = useState<number | null>(hasSavedArea ? user!.upazilaId! : null);
  const [addressDetail, setAddressDetail] = useState(user?.addresses?.find((address) => address.isDefault)?.addressText ?? '');
  // Filled in when the customer already picked a time with Tap to Schedule.
  const [scheduledDate, setScheduledDate] = useState(initialSchedule?.date ?? '');
  const [timeSlot, setTimeSlot] = useState(initialSchedule?.timeSlot ?? '');
  const locations = useLocationOptions(districtId);

  // The time slots come with the public order catalog (same cache as the Place Order form).
  const { data: catalog } = useQuery({ queryKey: ['order-catalog'], queryFn: orderPlacementService.getCatalog, staleTime: 60_000 });

  const selectDistrict = (next: number | null) => {
    setDistrictId(next);
    setUpazilaId(null);
  };

  const state: ScheduleFormState = {
    locations,
    districtId,
    selectDistrict,
    upazilaId,
    setUpazilaId,
    addressDetail,
    setAddressDetail,
    scheduledDate,
    setScheduledDate,
    timeSlot,
    setTimeSlot,
    catalog: catalog ? { timeSlots: catalog.timeSlots } : undefined,
  };

  const missingFields = [
    !districtId && 'জেলা',
    !upazilaId && 'উপজেলা',
    !addressDetail.trim() && 'ঠিকানা',
    !scheduledDate && 'তারিখ',
    !timeSlot && 'টাইম',
  ].filter((field): field is string => Boolean(field));

  const values: OrderPlaceFields | null =
    missingFields.length === 0 && districtId && upazilaId
      ? { districtId, upazilaId, addressDetail: addressDetail.trim(), scheduledDate, timeSlot }
      : null;

  return { state, missingFields, values };
}

/** The backend's error message for a failed order, or a fallback. */
export function orderErrorMessage(error: unknown, fallback = 'Could not place the order') {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(message) ? message[0] : message || fallback;
}
