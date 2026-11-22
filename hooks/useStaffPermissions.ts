'use client';

import { staffPermissions, StaffPermissions } from '@/lib/roles';
import { useAuthStore } from '@/store/useAuthStore';

/** What the signed-in staff member may do in the workspace (all false for non-staff). */
export function useStaffPermissions(): StaffPermissions {
  const role = useAuthStore((state) => state.activeRole ?? state.user?.role ?? null);
  return staffPermissions(role);
}
