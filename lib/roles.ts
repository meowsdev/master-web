/*
 * Which roles see which parts of the one staff workspace. These only choose what to show; the backend's role
 * guards decide what is allowed, and each entry below mirrors one of them.
 */

/** What a staff member may do in the workspace. Every staff role sees all orders and can chat in them. */
export interface StaffPermissions {
  /** Services tab: create and edit services and main services. */
  canManageServices: boolean;
  /** Providers / Technicians / Customers tabs: direct support chat with members. */
  canChatWithMembers: boolean;
  /** Open a member's details panel (orders, reviews, restrict). */
  canViewMemberDetails: boolean;
  /** The + that adds a provider or customer. */
  canAddMembers: boolean;
  /** Ban or unban a member. */
  canBanMembers: boolean;
  /** Add a technician or move one to another provider (backend: TECHNICIAN_MANAGER_ROLES). */
  canManageTechnicians: boolean;
  /** The + that places an order for a customer. */
  canCreateOrders: boolean;
  /** "Send to a provider" on an order nobody has taken. */
  canAssignOrders: boolean;
  /** Send a completed order back for revision within the 7-day warranty (backend: ADMIN or the order's customer). */
  canSendToRevision: boolean;
  /** Review a job's parts / costs, change the amounts and approve (backend: ADMIN). */
  canReviewExpenses: boolean;
  /** Staff tab: add Manager / Support / HR / Counselor, change position, turn off (backend: ADMIN). */
  canManageStaff: boolean;
  /** A provider's own commission percent, on their details panel (backend: ADMIN). */
  canSetCommission: boolean;
  /** Withdrawals tab: providers' withdrawal requests, mark paid or reject (backend: ADMIN). */
  canManagePayouts: boolean;
  /** Earnings tab: the platform's commission income, per month and per partner (backend: ADMIN). */
  canViewEarnings: boolean;
}

const NONE: StaffPermissions = {
  canManageServices: false,
  canChatWithMembers: false,
  canViewMemberDetails: false,
  canAddMembers: false,
  canBanMembers: false,
  canManageTechnicians: false,
  canCreateOrders: false,
  canAssignOrders: false,
  canSendToRevision: false,
  canReviewExpenses: false,
  canManageStaff: false,
  canSetCommission: false,
  canManagePayouts: false,
  canViewEarnings: false,
};

const MANAGER: StaffPermissions = {
  canManageServices: true,
  canChatWithMembers: true,
  canViewMemberDetails: true,
  canAddMembers: true,
  canBanMembers: false,
  canManageTechnicians: false,
  canCreateOrders: true,
  canAssignOrders: true,
  canSendToRevision: false,
  canReviewExpenses: false,
  canManageStaff: false,
  canSetCommission: false,
  canManagePayouts: false,
  canViewEarnings: false,
};

const PERMISSIONS_BY_ROLE: Record<string, StaffPermissions> = {
  ADMIN: { ...MANAGER, canBanMembers: true, canManageTechnicians: true, canSendToRevision: true, canReviewExpenses: true, canManageStaff: true, canSetCommission: true, canManagePayouts: true, canViewEarnings: true },
  MANAGER,
  // Support chat is open to support staff; member management is not (admin-members is ADMIN/MANAGER).
  SUPPORT: { ...NONE, canChatWithMembers: true },
  // HR and counselors: every order and its chat, nothing else.
  HR: NONE,
  COUNSELOR: NONE,
};

/** Staff roles share one workspace (orders, chat, and whatever their permissions add). */
export const isStaffRole = (role?: string | null): boolean => Boolean(role && role in PERMISSIONS_BY_ROLE);

export const staffPermissions = (role?: string | null): StaffPermissions => (role && PERMISSIONS_BY_ROLE[role]) || NONE;
