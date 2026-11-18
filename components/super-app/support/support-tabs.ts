import { RailTab } from '@/types/super-app.types';
import { SupportMemberRole } from '@/types/support-chat.types';

/** The admin's three direct-chat lists, one per rail tab. */
const ROLE_BY_TAB: Partial<Record<RailTab, SupportMemberRole>> = {
  SUPPORT_PROVIDERS: 'PROVIDER',
  SUPPORT_TECHNICIANS: 'TECHNICIAN',
  SUPPORT_CUSTOMERS: 'CUSTOMER',
};

export const supportRoleForTab = (tab: RailTab): SupportMemberRole | null => ROLE_BY_TAB[tab] ?? null;
