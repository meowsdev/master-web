export type ExtraChargeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ExtraChargeItem {
  label: string;
  amount: number;
}

/** Extra work the provider found on site; it only joins the order price once the customer approves. */
export interface ExtraChargeRequest {
  id: string;
  orderId: string;
  items: ExtraChargeItem[];
  totalAmount: string | number;
  /** Order total at the moment of the request. */
  previousTotal: string | number;
  status: ExtraChargeStatus;
  /** The customer does not use the app: still unanswered at this time, it is approved automatically. */
  autoApproveAt?: string | null;
  /** Approved by that timer, not by the customer. */
  isAutoApproved?: boolean;
  createdAt: string;
}
