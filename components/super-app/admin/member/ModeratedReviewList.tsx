'use client';

import { useReviewVisibility } from '@/hooks/useReviewVisibility';
import { useStaffPermissions } from '@/hooks/useStaffPermissions';
import { ReceivedReview } from '@/types/review.types';
import { ReviewList } from '../../reviews/ReviewList';

/* Customer reviews on a staff details panel; an admin can hide one or show it again with one click. */
export function ModeratedReviewList({ reviews }: { reviews: ReceivedReview[] }) {
  const { canModerateReviews } = useStaffPermissions();
  const visibility = useReviewVisibility();
  return (
    <ReviewList
      reviews={reviews}
      busyReviewId={visibility.busyReviewId}
      onToggleVisibility={canModerateReviews ? (review) => review.reviewId && visibility.toggle(review.reviewId, review.isPublic === false) : undefined}
    />
  );
}
