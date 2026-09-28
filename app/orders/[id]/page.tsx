'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { ordersService } from '@/services/orders.service';
import { revisionService } from '@/services/revision.service';
import { reviewService } from '@/services/review.service';
import { OrderStatus, PaymentStatus } from '@/types/order.types';
import {
  Package,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modals state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionDesc, setRevisionDesc] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Fetch Order
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrderById(id),
  });

  // Accept Price Mutation
  const acceptPriceMutation = useMutation({
    mutationFn: () => ordersService.acceptPrice(id),
    onSuccess: () => {
      toast.success('Proposed price accepted! Order is now IN_PROGRESS.');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to accept price');
    },
  });

  // Reject Price Mutation
  const rejectPriceMutation = useMutation({
    mutationFn: () => ordersService.rejectPrice(id),
    onSuccess: () => {
      toast.success('Additional price rejected and reverted.');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject price');
    },
  });

  // Revision Mutation
  const revisionMutation = useMutation({
    mutationFn: () =>
      revisionService.createRevision({
        orderId: id,
        issueDescription: revisionDesc,
      }),
    onSuccess: () => {
      toast.success('3-Day Free Warranty Revision requested!');
      setIsRevisionModalOpen(false);
      setRevisionDesc('');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to request revision');
    },
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewService.createReview({
        orderId: id,
        providerId: order?.providerId || '',
        customerRating: ratingScore,
        reviewComment: reviewText,
      }),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Order Not Found
          </h2>
        </div>
      </div>
    );
  }

  const hasAdditionalPrice = Number(order.additionalPrice) > 0;
  const isCompleted = order.orderStatus === OrderStatus.COMPLETED;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Order Header Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-xs text-zinc-500">
                  Created on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                {order.orderStatus}
              </span>
              <span className="px-3 py-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full">
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Step Price Negotiation Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Price Breakdown & Negotiation Protection
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md">
              Edits: {order.priceEditCount || 0} / 2 Allowed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/50 mb-4 text-center">
            <div>
              <span className="text-[11px] text-zinc-400">Original Price</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                {Number(order.originalPrice).toFixed(2)} BDT
              </p>
            </div>
            <div>
              <span className="text-[11px] text-zinc-400">Platform Fee</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                {Number(order.adminCommission).toFixed(2)} BDT
              </p>
            </div>
            <div>
              <span className="text-[11px] text-zinc-400">Additional Extra</span>
              <p
                className={`text-sm font-bold mt-0.5 ${
                  hasAdditionalPrice
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-zinc-900 dark:text-white'
                }`}
              >
                +{Number(order.additionalPrice || 0).toFixed(2)} BDT
              </p>
            </div>
            <div>
              <span className="text-[11px] text-zinc-400">Total Payable</span>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {Number(order.totalPrice).toFixed(2)} BDT
              </p>
            </div>
          </div>

          {/* Pending Price Negotiation Actions */}
          {hasAdditionalPrice && order.orderStatus === OrderStatus.PENDING && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Provider Proposed Additional Price (+{order.additionalPrice} BDT)
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400/80 mt-0.5">
                  Accept to start the service or reject to revert back to original base price.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => acceptPriceMutation.mutate()}
                  disabled={acceptPriceMutation.isPending}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Accept Price
                </button>
                <button
                  type="button"
                  onClick={() => rejectPriceMutation.mutate()}
                  disabled={rejectPriceMutation.isPending}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3-Day Free Warranty Revision & Review Section */}
        {isCompleted && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    3-Day Free Warranty Guarantee
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Free issue resolution covered by Master Services
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Claim Revision
              </button>
            </div>

            {/* Rate & Review Button */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Rate your service experience
                </h4>
                <p className="text-[11px] text-zinc-400">
                  1-3 stars triggers automatic support check; 4-5 stars rewards the provider.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                Write Review
              </button>
            </div>
          </div>
        )}

        {/* Revision Modal */}
        {isRevisionModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                Claim 3-Day Warranty Revision
              </h3>
              <p className="text-xs text-zinc-500">
                Describe the unresolved issue. The provider will re-visit at zero extra cost.
              </p>

              <textarea
                value={revisionDesc}
                onChange={(e) => setRevisionDesc(e.target.value)}
                placeholder="E.g., The AC cooling stopped again after 1 day..."
                rows={4}
                className="w-full p-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => revisionMutation.mutate()}
                  disabled={!revisionDesc.trim() || revisionMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {revisionMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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
                    onClick={() => setRatingScore(star)}
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
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share details about the quality of work and punctuality..."
                rows={3}
                className="w-full p-3 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                >
                  {reviewMutation.isPending ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
