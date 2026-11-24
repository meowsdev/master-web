/** GET /provider-wallet/me/earnings. A job's income is its bill minus the platform's commission, plus the tip. */
export interface ProviderEarnings {
  summary: {
    netIncome: number;
    thisMonth: number;
    lastMonth: number;
    completedOrders: number;
    averageOrderValue: number;
    tips: number;
    commissionPaid: number;
    /** Income from jobs the customer paid in cash on site. */
    cashIncome: number;
    /** Income from jobs paid online (the platform received the money). */
    onlineIncome: number;
    /** Taken and priced jobs not finished yet, after commission. */
    expectedEarnings: number;
    activeOrders: number;
    /** What the provider owes the platform (commission on cash jobs). */
    dueAmount: number;
  };
  wallet: ProviderWalletCard;
  /** The last 6 months, oldest first. month is "YYYY-MM". */
  monthly: Array<{ month: string; orders: number; billed: number; commission: number; tips: number; net: number }>;
  /** The newest completed jobs first. */
  transactions: Array<{
    orderId: string;
    referenceCode: string;
    serviceName: string;
    completedAt: string;
    billed: number;
    commission: number;
    commissionRate: number;
    tip: number;
    net: number;
    paymentMode: 'CASH' | 'ONLINE';
  }>;
}

export type ProviderLevel = 'NEW' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

/** GET /provider-leveling/me. */
export interface ProviderLevelProgress {
  level: ProviderLevel;
  nextLevel: ProviderLevel | null;
  /** The level today's numbers would earn at the next monthly evaluation. */
  projectedLevel: ProviderLevel;
  nextEvaluationAt: string;
  windowDays: number;
  metrics: { completedOrdersInWindow: number; rating: number; reviewCount: number; totalCompletedOrders: number };
  requirementsForNext: Array<{ key: 'orders' | 'rating'; current: number; target: number; isMet: boolean }>;
  /** Lowest first. */
  levels: Array<{ level: ProviderLevel; minOrders: number; minRating: number; isReached: boolean }>;
}

export type PayoutMethod = 'BKASH' | 'NAGAD' | 'BANK';
export type WithdrawalStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED';

/** The withdraw card (part of GET /provider-wallet/me/earnings). */
export interface ProviderWalletCard {
  /** The wallet itself; negative = a due. */
  balance: number;
  availableForWithdrawal: number;
  /** Online credits still in their clearance period. */
  pendingClearance: number;
  /** Asked for and held, waiting for an admin. */
  pendingWithdrawal: number;
  withdrawn: number;
  minWithdrawal: number;
  /** Days an online credit waits before it can be withdrawn. */
  clearanceDays: number;
}

export interface WithdrawalRequest {
  id: string;
  amount: number | string;
  method: PayoutMethod;
  accountNumber: string;
  accountName: string;
  bankName: string | null;
  branchName: string | null;
  status: WithdrawalStatus;
  transactionRef: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  /** Admin list only. */
  provider?: {
    id: string;
    companyName: string | null;
    walletBalance: number | string;
    user: { id: string; name: string | null; username: string | null; mobileNumber: string };
  };
}

export interface NewWithdrawal {
  amount: number;
  method: PayoutMethod;
  accountNumber: string;
  accountName: string;
  bankName?: string;
  branchName?: string;
}
