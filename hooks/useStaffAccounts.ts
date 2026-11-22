'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminStaffService, StaffRole } from '@/services/admin-staff.service';

const apiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

/** Bengali names of the positions, used on every staff screen. */
export const STAFF_ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'ম্যানেজার',
  SUPPORT: 'সাপোর্ট',
  HR: 'এইচআর',
  COUNSELOR: 'কাউন্সেলর',
};

export const GRANTABLE_STAFF_ROLES: StaffRole[] = ['MANAGER', 'SUPPORT', 'HR', 'COUNSELOR'];

/* The Staff screen's data: every office account, and adding / changing one. Keys carry the admin's id (one login, one cache). */
export function useStaffAccounts(adminId: string | undefined) {
  const queryClient = useQueryClient();
  const key = ['admin-staff', adminId];

  const { data: staff = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: adminStaffService.list,
    enabled: Boolean(adminId),
  });

  const create = useMutation({
    mutationFn: adminStaffService.create,
    onSuccess: (created) => {
      toast.success(`${created.name ?? 'স্টাফ'} যোগ হয়েছে। তিনি এই নম্বরে OTP দিয়ে লগইন করবেন।`);
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'স্টাফ যোগ করা যায়নি।')),
  });

  const update = useMutation({
    mutationFn: ({ staffId, change }: { staffId: string; change: { role?: StaffRole; status?: 'ACTIVE' | 'SUSPENDED' } }) => adminStaffService.update(staffId, change),
    onSuccess: () => {
      toast.success('পরিবর্তন সেভ হয়েছে।');
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'পরিবর্তন সেভ করা যায়নি।')),
  });

  return { staff, isLoading, create, update };
}
