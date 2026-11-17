'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { reviewService } from '@/services/review.service';
import { Order } from '@/types/order.types';

const RATING_STEPS = [1, 2, 3, 4, 5];

/*
 * The customer's one review of a completed order. Before it is sent: stars, a comment line and
 * Feedback Submit. After: the same card, read-only, so the order history keeps what was said.
 */
export function ReviewCard({ order, userId }: { order: Order; userId: string }) {
  const queryClient = useQueryClient();
  const sentReview = order.providerReview;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const shownRating = sentReview?.customerRating ?? rating;

  const submitReview = useMutation({
    mutationFn: () => reviewService.createReview({ orderId: order.id, customerRating: rating, reviewComment: comment.trim() || undefined }),
    onSuccess: () => {
      toast.success('আপনার রিভিউয়ের জন্য ধন্যবাদ!');
      queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] });
    },
    onError: () => toast.error('Review could not be sent'),
  });

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-gradient-to-b from-white to-[#eefaf5] p-[16px] text-[#202939]">
      <h3 className="text-[13px] font-semibold">আপনার মূল্যবান মতামত দিন</h3>

      <div role="radiogroup" aria-label="Rating" className="mt-[10px] flex justify-center gap-[6px]">
        {RATING_STEPS.map((step) => (
          <button
            key={step}
            type="button"
            role="radio"
            aria-checked={shownRating === step}
            aria-label={`${step} star`}
            disabled={Boolean(sentReview)}
            onClick={() => setRating(step)}
            className="cursor-pointer disabled:cursor-default"
          >
            <HugeiconsIcon icon={StarIcon} size={26} className={step <= shownRating ? 'text-[#f5a524]' : 'text-[#cecece]'} fill={step <= shownRating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      <label className="mt-[22px] flex items-center gap-[10px] border-b border-[#202939]/60 pb-[6px]">
        <HugeiconsIcon icon={Comment01Icon} size={18} className="shrink-0" />
        <input
          value={sentReview ? sentReview.reviewComment ?? '' : comment}
          onChange={(event) => setComment(event.target.value)}
          readOnly={Boolean(sentReview)}
          maxLength={500}
          placeholder="মতামত দিন..."
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-[#9aa4b2]"
        />
      </label>

      <footer className="mt-[16px] flex justify-end">
        <button
          type="button"
          disabled={Boolean(sentReview) || rating === 0 || submitReview.isPending}
          onClick={() => submitReview.mutate()}
          className="cursor-pointer rounded-[10px] bg-black px-[18px] py-[10px] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#202939]/30"
        >
          {sentReview ? 'Feedback Sent' : 'Feedback Submit'}
        </button>
      </footer>
    </article>
  );
}
