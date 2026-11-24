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

export type ProviderLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED';

/** The six level metrics (master-backend provider-leveling/level-rules.ts). */
export type LevelMetricKey = 'successScore' | 'rating' | 'responseRate' | 'orders' | 'uniqueClients' | 'earnings';

/** GET /provider-leveling/me. */
export interface ProviderLevelProgress {
  level: ProviderLevel;
  /** null at Top Rated: the targets shown are then the ones to keep it. */
  nextLevel: ProviderLevel | null;
  /** The level today's numbers would earn at the next monthly evaluation. */
  projectedLevel: ProviderLevel;
  /** Set by an admin: the monthly evaluation leaves this level as it is. */
  isLevelLocked: boolean;
  levelLockReason: string | null;
  nextEvaluationAt: string;
  /** Days the success score and response rate look back. */
  windowDays: number;
  /** Lowest first. */
  levels: Array<{ level: ProviderLevel; isReached: boolean }>;
  metrics: Array<{
    key: LevelMetricKey;
    /** null = no data yet (no finished order / no offer). */
    value: number | null;
    /** The next level's target (their own level's at Top Rated). */
    target: number;
    isMet: boolean;
    targets: Record<'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED', number>;
  }>;
}

/** Each level's six targets (Level 0 needs nothing), as an admin set them. */
export type LevelTargetTable = Record<'LEVEL_1' | 'LEVEL_2' | 'TOP_RATED', Record<LevelMetricKey, number>>;

/** A row of the Levels tab (GET /provider-leveling/providers). */
export interface LevelProviderRow {
  providerId: string;
  userId: string;
  name: string;
  mobileNumber: string;
  profilePhoto: string | null;
  level: ProviderLevel;
  isLevelLocked: boolean;
  levelLockReason: string | null;
  rating: number;
  totalCompletedOrders: number;
}

/** GET /provider-leveling/stats. */
export interface LevelStats {
  totalProviders: number;
  distribution: Record<ProviderLevel, number>;
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

/** GET /admin/earnings: the platform's commission income. */
export interface AdminEarningsReport {
  summary: {
    commissionTotal: number;
    thisMonth: number;
    lastMonth: number;
    completedOrders: number;
    /** Everything customers were billed on completed orders. */
    billedTotal: number;
    averageCommissionPercent: number;
    /** Commission of cash jobs (comes in as partners pay their dues). */
    cashCommission: number;
    /** Commission of online jobs (kept from the online payment). */
    onlineCommission: number;
    partnerTips: number;
    expectedCommission: number;
    activeOrders: number;
    approvedCosts: number;
    commissionReducedByCosts: number;
  };
  wallets: {
    duesReceivable: number;
    partnersWithDue: number;
    partnerBalances: number;
    partnersWithBalance: number;
    pendingWithdrawals: number;
    pendingWithdrawalCount: number;
    paidOut: number;
  };
  /** Oldest first; month is "YYYY-MM". */
  monthly: Array<{ month: string; orders: number; billed: number; commission: number }>;
  /** Highest commission first. */
  partners: Array<{
    providerId: string;
    userId: string;
    name: string;
    mobileNumber: string;
    commissionRate: number;
    walletBalance: number;
    orders: number;
    billed: number;
    commission: number;
    thisMonth: number;
  }>;
}

/** GET /admin/dues: providers who owe the platform (cash jobs' commission), largest first. */
export interface DueList {
  totalDue: number;
  count: number;
  /** The daily run reminds anyone not reminded for this many days. */
  reminderIntervalDays: number;
  isAutoReminderOn: boolean;
  providers: Array<{
    providerId: string;
    userId: string;
    name: string;
    mobileNumber: string;
    profilePhoto: string | null;
    accountStatus: string;
    dueAmount: number;
    /** Gets no new orders until the due is paid. */
    isBlocked: boolean;
    commissionRate: number;
    lastReminderAt: string | null;
    lastReminderWasAutomatic: boolean | null;
    reminderCount: number;
  }>;
}
