import { ReceivedReview } from '@/types/review.types';

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** Reviews on a profile, newest first: stars, the order, the date, what was written and who wrote it. */
export function ReviewList({ reviews, emptyText = 'No reviews yet.' }: { reviews: ReceivedReview[]; emptyText?: string }) {
  if (reviews.length === 0) return <p className="text-[14px] font-medium text-[#697586]">{emptyText}</p>;
  return (
    <ul className="flex flex-col gap-[8px]">
      {reviews.map((review) => (
        <li key={review.orderId} className="rounded-[10px] bg-[#f7f5f3] p-[10px]">
          <div className="flex items-center justify-between gap-[8px]">
            <p className="text-[14px] font-semibold text-[#f5a524]" aria-label={`${review.rating} out of 5`}>
              {'★'.repeat(review.rating)}
              <span className="text-[#cecece]">{'★'.repeat(Math.max(0, 5 - review.rating))}</span>
            </p>
            <span className="shrink-0 text-[12px] font-medium text-[#697586]">#{review.referenceCode} · {formatDate(review.createdAt)}</span>
          </div>
          {review.comment && <p className="mt-[4px] text-[14px] font-medium text-[#202939]">{review.comment}</p>}
          {review.fromName && <p className="mt-[2px] text-[12px] font-medium text-[#697586]">— {review.fromName}</p>}
        </li>
      ))}
    </ul>
  );
}
