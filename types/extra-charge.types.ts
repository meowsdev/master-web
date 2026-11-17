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
  createdAt: string;
}
