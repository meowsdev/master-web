'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Comment01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { customerRatingService } from '@/services/customer-rating.service';
import { Order, OrderStatus } from '@/types/order.types';

const RATING_STEPS = [1, 2, 3, 4, 5];

/*
 * After a completed order the provider side rates the customer, once: the provider or the technician, whoever
 * goes first. The other one then sees it sent, and by whom. The rating feeds the customer's average, and the
 * customer and admins see it on the order (CustomerRatingNote).
 */
export function CustomerRatingCard({ order, userId }: { order: Order; userId: string }) {
  const queryClient = useQueryClient();
  const key = ['customer-rating', userId, order.id];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: saved } = useQuery({
    queryKey: key,
    queryFn: () => customerRatingService.get(order.id),
    enabled: order.orderStatus === OrderStatus.COMPLETED,
  });

  const submit = useMutation({
    mutationFn: () => customerRatingService.rate(order.id, rating, comment.trim() || undefined),
    onSuccess: () => {
      toast.success('Customer rated.');
      queryClient.invalidateQueries({ queryKey: key });
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(message) ? message[0] : message) || 'Rating could not be saved');
      // The provider or technician may have rated a moment ago: show theirs.
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  if (order.orderStatus !== OrderStatus.COMPLETED || !saved) return null;
  const isRated = saved.rating !== null;
  const shownRating = isRated ? saved.rating! : rating;

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-gradient-to-b from-white to-secondary p-[16px] text-ink">
      <h3 className="text-[13px] font-semibold">কাস্টমারকে রেটিং দিন</h3>
      <p className="mt-[2px] text-[12px] font-medium text-muted">
        {isRated && saved.ratedBy && !saved.ratedBy.isMe
          ? `${saved.ratedBy.name ?? (saved.ratedBy.role === 'TECHNICIAN' ? 'আপনার টেকনিশিয়ান' : 'প্রোভাইডার')} রেটিং দিয়েছেন।`
          : 'প্রোভাইডার বা টেকনিশিয়ান, যেকোনো একজন দিলেই হবে।'}
      </p>

      <div role="radiogroup" aria-label="Customer rating" className="mt-[10px] flex justify-center gap-[6px]">
        {RATING_STEPS.map((step) => (
          <button key={step} type="button" role="radio" aria-checked={shownRating === step} aria-label={`${step} star`} disabled={isRated} onClick={() => setRating(step)} className="cursor-pointer disabled:cursor-default">
            <HugeiconsIcon icon={StarIcon} size={26} className={step <= shownRating ? 'text-[#f5a524]' : 'text-muted'} fill={step <= shownRating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      <label className="mt-[22px] flex items-start gap-[10px]">
        <span className="flex h-[22px] shrink-0 items-center">
          <HugeiconsIcon icon={Comment01Icon} size={18} />
        </span>
        <span className="flex min-w-0 flex-1 border-b border-ink/60 pb-[6px]">
          <input
            value={isRated ? saved.comment ?? '' : comment}
            onChange={(event) => setComment(event.target.value)}
            readOnly={isRated}
            maxLength={300}
            placeholder="মতামত দিন..."
            className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-muted"
          />
        </span>
      </label>

      <footer className="mt-[16px] flex justify-end">
        <button
          type="button"
          disabled={isRated || rating === 0 || submit.isPending}
          onClick={() => submit.mutate()}
          className="cursor-pointer rounded-[10px] bg-black px-[18px] py-[10px] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/30"
        >
          {isRated ? 'Rating Sent' : 'Submit Rating'}
        </button>
      </footer>
    </article>
  );
}
