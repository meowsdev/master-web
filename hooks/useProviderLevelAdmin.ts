'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { providerLevelingService } from '@/services/provider-leveling.service';
import type { LevelMetricKey, ProviderLevel } from '@/types/provider-earnings.types';

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) ?? fallback;
};

/* Keys carry the staff member's user id (AGENTS.md §7), so a signed-out admin's lookups never reach the next one. */
export function useAdminProviderLevel(adminId: string, providerUserId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin-provider-level', adminId, providerUserId],
    queryFn: () => providerLevelingService.getProviderLevel(providerUserId),
    enabled,
  });
}

/** Admin: give this provider a level by hand. */
export function useSetProviderLevel(adminId: string, providerUserId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { level: ProviderLevel; isLocked: boolean; reason?: string }) => providerLevelingService.setProviderLevel(providerUserId, body),
    onSuccess: (page) => {
      queryClient.setQueryData(['admin-provider-level', adminId, providerUserId], page);
      // The level shows in the provider list, the member details and the stats too.
      void queryClient.invalidateQueries({ queryKey: ['admin-member', adminId, providerUserId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      void queryClient.invalidateQueries({ queryKey: ['level-stats', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['level-providers', adminId] });
      toast.success('লেভেল সেভ হয়েছে');
    },
    onError: (error) => toast.error(errorMessage(error, 'লেভেল সেভ করা যায়নি')),
  });
}

/** Admin: change what one metric needs at each level. Every Level page uses the new targets. */
export function useSetLevelTargets(adminId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ metric, values }: { metric: LevelMetricKey; values: Record<'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED', number> }) =>
      providerLevelingService.setTargets(metric, values),
    onSuccess: (table) => {
      queryClient.setQueryData(['level-targets', adminId], table);
      void queryClient.invalidateQueries({ queryKey: ['admin-provider-level', adminId] });
      toast.success('টার্গেট সেভ হয়েছে। পরবর্তী মূল্যায়নে নতুন টার্গেট দিয়ে লেভেল হিসাব হবে।');
    },
    onError: (error) => toast.error(errorMessage(error, 'টার্গেট সেভ করা যায়নি')),
  });
}

/** The Levels tab: every provider with their level. */
export function useLevelProviders(adminId: string) {
  return useQuery({ queryKey: ['level-providers', adminId], queryFn: providerLevelingService.listProviders });
}

/** The global targets table. */
export function useLevelTargets(adminId: string) {
  return useQuery({ queryKey: ['level-targets', adminId], queryFn: providerLevelingService.getTargets });
}

/** Admin: the same level for many providers at once. */
export function useSetLevelForMany(adminId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: providerLevelingService.setLevelForMany,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['level-providers', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['level-stats', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-provider-level', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-member', adminId] });
      toast.success(`${result.updatedCount} জনের লেভেল সেভ হয়েছে`);
    },
    onError: (error) => toast.error(errorMessage(error, 'লেভেল সেভ করা যায়নি')),
  });
}

export function useLevelStats(adminId: string, enabled: boolean) {
  return useQuery({ queryKey: ['level-stats', adminId], queryFn: providerLevelingService.getStats, enabled });
}

/** Admin: work out every provider's level now. Locked levels stay. */
export function useRunLevelEvaluation(adminId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: providerLevelingService.runEvaluation,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-provider-level', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['level-stats', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-member', adminId] });
      void queryClient.invalidateQueries({ queryKey: ['level-providers', adminId] });
      toast.success(`লেভেল হিসাব হয়েছে: ${result.updatedCount} জনের লেভেল বদলেছে`);
    },
    onError: (error) => toast.error(errorMessage(error, 'লেভেল হিসাব করা যায়নি')),
  });
}
