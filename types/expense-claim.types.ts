export interface ExpenseItem {
  label: string;
  amount: number;
}

/**
 * Where a claim is now:
 * PROVIDER_REVIEW: with the provider (a technician sent it, or an admin sent it back);
 * RETURNED_TO_TECHNICIAN: the provider sent it back to the technician to fix;
 * PENDING: with the admin; APPROVED: done, taken out of the commission.
 * REJECTED: only claims from before this flow (a rejection used to end the claim).
 */
export type ExpenseClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROVIDER_REVIEW' | 'RETURNED_TO_TECHNICIAN';

/** One step of the claim's journey: who did what, with the amounts at that moment. */
export interface ExpenseClaimStep {
  action: 'SUBMITTED' | 'RESUBMITTED' | 'PROVIDER_ACCEPTED' | 'PROVIDER_RETURNED' | 'ADMIN_RETURNED' | 'ADMIN_APPROVED';
  byRole: 'TECHNICIAN' | 'PROVIDER' | 'ADMIN';
  items: ExpenseItem[];
  total: number;
  note: string | null;
  at: string;
}

/** Parts and costs of a finished job: technician → provider → admin, and back when someone wants a change. */
export interface ExpenseClaim {
  id: string;
  orderId: string;
  /** The amounts as they stand now (the last person to change them). */
  items: ExpenseItem[];
  claimedTotal: string | number;
  /** Sent by the technician: it goes to the provider first, who may send it back to them. */
  isFromTechnician?: boolean;
  /** Every step so far, oldest first. Empty on older claims. */
  history?: ExpenseClaimStep[];
  /** The provider's last note (to the technician, or to the admin). */
  providerNote?: string | null;
  /** The admin's reviewed amounts; set once approved. */
  approvedItems?: ExpenseItem[] | null;
  approvedTotal?: string | number | null;
  status: ExpenseClaimStatus;
  /** The admin's last note (when sending it back, or approving). */
  reviewNote?: string | null;
  reviewedAt?: string | null;
  /** The order's commission before and after the approval. */
  commissionBefore?: string | number | null;
  commissionAfter?: string | number | null;
  createdAt: string;
}
