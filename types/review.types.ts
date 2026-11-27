/** One review as a profile lists it: who gave it, for which order, and what they said. */
export interface ReceivedReview {
  /** The review itself (customer reviews only; a provider's rating of a customer has none). */
  reviewId?: string;
  /** Whether customers see it; an admin can hide a customer review. */
  isPublic?: boolean;
  orderId: string;
  referenceCode: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  fromName: string | null;
}

/** GET /provider-review/me/received: the signed-in person's profile summary. */
export interface MyReviews {
  /** 0 before the first review. */
  rating: number;
  count: number;
  reviews: ReceivedReview[];
  completedOrders: number;
  /** Customer: what they spent on completed orders. Provider and technician: income after the platform's commission. */
  totalAmount: number;
}
