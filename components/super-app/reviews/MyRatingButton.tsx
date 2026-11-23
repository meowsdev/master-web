'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { reviewService } from '@/services/review.service';
import { ReviewList } from './ReviewList';

const EMPTY_TEXT = {
  CUSTOMER: 'এখনো কোনো প্রোভাইডার আপনাকে রেটিং দেননি।',
  PROVIDER: 'এখনো কোনো কাস্টমার রিভিউ দেননি।',
  TECHNICIAN: 'আপনার করা কাজে এখনো কোনো কাস্টমার রিভিউ দেননি।',
} as const;

type Role = keyof typeof EMPTY_TEXT;

/** Same query everywhere, so the header star and the panel share one request. */
export const useMyReviews = (userId: string) =>
  useQuery({ queryKey: ['my-reviews', userId], queryFn: () => reviewService.getMyReviews(), staleTime: 30000 });

/*
 * The star next to a signed-in person's name. Pressing it opens "আমার রিভিউ": their average and every recent
 * review about them, with who wrote it and on which order. Falls back to the stored rating until the list loads.
 */
export function MyRatingButton({ userId, role, storedRating }: { userId: string; role: Role; storedRating?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError } = useMyReviews(userId);
  const rating = data?.rating ?? storedRating ?? 0;
  const label = rating > 0 ? rating.toFixed(1) : 'New';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="আমার রিভিউ দেখুন"
        className="flex shrink-0 cursor-pointer items-center gap-[3px] rounded-full text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
      >
        <HugeiconsIcon icon={StarIcon} size={13} className="shrink-0 fill-[#f5a524] text-[#f5a524]" />
        {label}
        {data && data.count > 0 && <span className="font-medium text-muted">({data.count})</span>}
      </button>

      {isOpen && (
        <SidePanelShell title="আমার রিভিউ" onClose={() => setIsOpen(false)}>
          {isLoading && <p className="text-[14px] font-medium text-muted">Loading reviews...</p>}
          {isError && <p className="text-[14px] font-medium text-[#d64545]">রিভিউ লোড করা যায়নি।</p>}
          {data && (
            <>
              <div className="mb-[16px] flex items-center gap-[12px] rounded-[16px] bg-gradient-to-b from-white to-secondary p-[16px]">
                <span className="text-[32px] font-semibold text-ink">{data.rating > 0 ? data.rating.toFixed(1) : '–'}</span>
                <div className="flex flex-col">
                  <span className="text-[16px] font-semibold text-[#f5a524]">
                    {'★'.repeat(Math.round(data.rating))}
                    <span className="text-muted">{'★'.repeat(5 - Math.round(data.rating))}</span>
                  </span>
                  <span className="text-[13px] font-medium text-muted">মোট {data.count}টি রিভিউ</span>
                </div>
              </div>
              <ReviewList reviews={data.reviews} emptyText={EMPTY_TEXT[role]} />
              {data.count > data.reviews.length && (
                <p className="mt-[10px] text-center text-[12px] font-medium text-muted">সর্বশেষ {data.reviews.length}টি রিভিউ দেখানো হচ্ছে</p>
              )}
            </>
          )}
        </SidePanelShell>
      )}
    </>
  );
}
