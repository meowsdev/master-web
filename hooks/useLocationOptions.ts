'use client';

import { useQuery } from '@tanstack/react-query';
import { locationsService } from '@/services/locations.service';

/**
 * District list plus the upazilas of the chosen district. Public reference
 * data (identical for every visitor), so the cache keys need no user id.
 */
export function useLocationOptions(districtId: number | null) {
  const districtsQuery = useQuery({
    queryKey: ['locations', 'districts'],
    queryFn: locationsService.getDistricts,
    staleTime: Infinity,
  });

  const upazilasQuery = useQuery({
    queryKey: ['locations', 'upazilas', districtId],
    queryFn: () => locationsService.getUpazilas(districtId as number),
    enabled: districtId !== null,
    staleTime: Infinity,
  });

  return {
    districts: districtsQuery.data ?? [],
    upazilas: districtId === null ? [] : (upazilasQuery.data ?? []),
    isLoadingDistricts: districtsQuery.isLoading,
    isLoadingUpazilas: upazilasQuery.isFetching,
    /** The list could not be loaded (for example the server is down); the form says so and offers a retry. */
    hasUpazilaError: upazilasQuery.isError,
    retryUpazilas: () => upazilasQuery.refetch(),
  };
}
