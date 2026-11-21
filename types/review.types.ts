/** One review as a profile lists it: who gave it, for which order, and what they said. */
export interface ReceivedReview {
  orderId: string;
  referenceCode: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  fromName: string | null;
}

/** GET /provider-review/me/received: the signed-in person's own average and latest reviews. */
export interface MyReviews {
  /** 0 before the first review. */
  rating: number;
  count: number;
  reviews: ReceivedReview[];
}
