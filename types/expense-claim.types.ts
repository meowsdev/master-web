export interface ExpenseItem {
  label: string;
  amount: number;
}

export type ExpenseClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Parts and costs of a finished job, sent by the provider / technician and reviewed by an admin. */
export interface ExpenseClaim {
  id: string;
  orderId: string;
  items: ExpenseItem[];
  claimedTotal: string | number;
  /** The admin's reviewed amounts; set once approved. */
  approvedItems?: ExpenseItem[] | null;
  approvedTotal?: string | number | null;
  status: ExpenseClaimStatus;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  /** The order's commission before and after the approval. */
  commissionBefore?: string | number | null;
  commissionAfter?: string | number | null;
  createdAt: string;
}
