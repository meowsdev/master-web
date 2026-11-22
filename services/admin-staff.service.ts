import { apiClient } from '@/lib/axios';

/** Positions an admin can give from the Staff screen. */
export type StaffRole = 'MANAGER' | 'SUPPORT' | 'HR' | 'COUNSELOR';

export interface StaffAccount {
  id: string;
  name: string | null;
  mobileNumber: string;
  /** ADMIN accounts are listed too, read only. */
  role: StaffRole | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';
  /** False until they sign in with OTP for the first time. */
  isVerified: boolean;
  createdAt: string;
}

/** Admin only; the backend's role guard enforces it. */
export const adminStaffService = {
  list: async () => (await apiClient.get<StaffAccount[]>('/admin/staff')).data,

  create: async (input: { mobileNumber: string; name: string; role: StaffRole }) => (await apiClient.post<StaffAccount>('/admin/staff', input)).data,

  update: async (staffId: string, change: { role?: StaffRole; status?: 'ACTIVE' | 'SUSPENDED' }) =>
    (await apiClient.patch<StaffAccount>(`/admin/staff/${staffId}`, change)).data,
};
