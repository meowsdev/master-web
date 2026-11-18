'use client';

import { useLocationOptions } from '@/hooks/useLocationOptions';

/** "Mirpur, Dhaka": the district and upazila of an order, from the cached public location lists. */
export function useServiceAreaLabel(districtId?: number | null, upazilaId?: number | null) {
  const { districts, upazilas } = useLocationOptions(districtId ?? null);
  const district = districts.find((item) => item.id === districtId);
  const upazila = upazilas.find((item) => item.id === upazilaId);
  return [upazila?.bnName, district?.bnName].filter(Boolean).join(', ');
}
