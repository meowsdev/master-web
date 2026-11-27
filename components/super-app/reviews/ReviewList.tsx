import { ReceivedReview } from '@/types/review.types';

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Reviews on a profile, newest first: stars, the order, the date, what was written and who wrote it.
 * With `onToggleVisibility` (an admin), each customer review shows whether customers see it and a button to hide or
 * show it; a hidden one is marked.
 */
export function ReviewList({
  reviews,
  emptyText = 'No reviews yet.',
  onToggleVisibility,
  busyReviewId,
}: {
  reviews: ReceivedReview[];
  emptyText?: string;
  onToggleVisibility?: (review: ReceivedReview) => void;
  busyReviewId?: string | null;
}) {
  if (reviews.length === 0) return <p className="text-[14px] font-medium text-muted">{emptyText}</p>;
  return (
    <ul className="flex flex-col gap-[8px]">
      {reviews.map((review) => {
        const isHidden = review.isPublic === false;
        return (
          <li key={review.orderId} className={`rounded-[10px] bg-surface p-[10px] ${isHidden ? 'opacity-70' : ''}`}>
            <div className="flex items-center justify-between gap-[8px]">
              <p className="text-[14px] font-semibold text-[#f5a524]" aria-label={`${review.rating} out of 5`}>
                {'★'.repeat(review.rating)}
                <span className="text-muted">{'★'.repeat(Math.max(0, 5 - review.rating))}</span>
              </p>
              <span className="shrink-0 text-[12px] font-medium text-muted">#{review.referenceCode} · {formatDate(review.createdAt)}</span>
            </div>
            {review.comment && <p className="mt-[4px] text-[14px] font-medium text-ink">{review.comment}</p>}
            {review.fromName && <p className="mt-[2px] text-[12px] font-medium text-muted">— {review.fromName}</p>}
            {onToggleVisibility && review.reviewId && (
              <div className="mt-[8px] flex items-center justify-between gap-[8px] border-t border-line pt-[8px]">
                <span className={`text-[12px] font-semibold ${isHidden ? 'text-[#b7791f]' : 'text-primary'}`}>{isHidden ? 'লুকানো: কাস্টমার দেখে না' : 'পাবলিক'}</span>
                <button
                  type="button"
                  disabled={busyReviewId === review.reviewId}
                  onClick={() => onToggleVisibility(review)}
                  className="h-[30px] cursor-pointer rounded-[8px] border border-chip bg-white px-[12px] text-[12px] font-semibold text-ink hover:bg-white/70 disabled:opacity-50"
                >
                  {isHidden ? 'পাবলিক করুন' : 'লুকান'}
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
