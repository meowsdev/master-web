'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { StarIcon } from '@hugeicons/core-free-icons';
import { reviewService } from '@/services/review.service';
import { Order } from '@/types/order.types';

const RATING_STEPS = [1, 2, 3, 4, 5];

/* Shown after the order is completed (and paid): the customer rates the service once. */
export function ReviewCard({ order, userId }: { order: Order; userId: string }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitReview = useMutation({
    mutationFn: () => reviewService.createReview({ orderId: order.id, customerRating: rating, reviewComment: comment.trim() || undefined }),
    onSuccess: () => {
      toast.success('আপনার রিভিউয়ের জন্য ধন্যবাদ!');
      queryClient.invalidateQueries({ queryKey: ['my-orders-drawer', userId] });
    },
    onError: () => toast.error('Review could not be sent'),
  });

  return (
    <article className="w-full max-w-[460px] self-center rounded-[16px] bg-white p-[16px] text-[#202939] shadow-sm">
      <h3 className="text-[14px] font-semibold">সার্ভিসটি কেমন ছিল? আপনার রিভিউ দিন</h3>

      <div role="radiogroup" aria-label="Rating" className="mt-[12px] flex gap-[6px]">
        {RATING_STEPS.map((step) => (
          <button key={step} type="button" role="radio" aria-checked={rating === step} aria-label={`${step} star`} onClick={() => setRating(step)} className="cursor-pointer">
            <HugeiconsIcon icon={StarIcon} size={30} className={step <= rating ? 'text-[#f5b400]' : 'text-[#cecece]'} fill={step <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        maxLength={500}
        rows={2}
        placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)"
        className="mt-[12px] w-full resize-none rounded-[10px] bg-[#f7f5f3] p-[10px] text-[14px] outline-none placeholder:text-[#9aa4b2]"
      />

      <footer className="mt-[12px] flex justify-end">
        <button
          type="button"
          disabled={rating === 0 || submitReview.isPending}
          onClick={() => submitReview.mutate()}
          className="cursor-pointer rounded-[10px] bg-[#1daa61] px-[18px] py-[10px] text-[15px] font-semibold text-white hover:bg-[#189452] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Review
        </button>
      </footer>
    </article>
  );
}
