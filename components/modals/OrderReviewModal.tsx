'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ratingScore: number;
  onRatingChange: (score: number) => void;
  reviewText: string;
  onReviewChange: (val: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function OrderReviewModal({
  isOpen,
  onClose,
  ratingScore,
  onRatingChange,
  reviewText,
  onReviewChange,
  onSubmit,
  isPending,
}: OrderReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          Submit Provider Review
        </h3>

        {/* Star Picker */}
        <div className="flex items-center justify-center gap-2 py-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= ratingScore
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-300 dark:text-zinc-700'
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => onReviewChange(e.target.value)}
          placeholder="Share details about the quality of work and punctuality..."
          rows={3}
          className="w-full p-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            {isPending ? 'Submitting...' : 'Post Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
