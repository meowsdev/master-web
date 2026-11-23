'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { ordersService } from '@/services/orders.service';
import { revisionService } from '@/services/revision.service';
import { reviewService } from '@/services/review.service';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth.types';
import { OrderStatus } from '@/types/order.types';
import { OrderRevisionModal } from '@/components/modals/OrderRevisionModal';
import { OrderReviewModal } from '@/components/modals/OrderReviewModal';
import { Package, CheckCircle2, XCircle, Clock, Star, Sparkles, AlertTriangle, RotateCcw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-error';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { user, activeRole } = useAuthStore();

  const isProvider = activeRole === UserRole.PROVIDER || user?.role === UserRole.PROVIDER;

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

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => ordersService.updateStatus(id, status),
    onSuccess: (updated) => {
      toast.success(`Order status updated to ${updated.orderStatus}!`);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, 'Failed to update order status'));
    },
  });

  // Accept Price Mutation
  const acceptPriceMutation = useMutation({
    mutationFn: () => ordersService.acceptPrice(id),
    onSuccess: () => {
      toast.success('Proposed price accepted! Order is now IN_PROGRESS.');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, 'Failed to accept price'));
    },
  });

  // Reject Price Mutation
  const rejectPriceMutation = useMutation({
    mutationFn: () => ordersService.rejectPrice(id),
    onSuccess: () => {
      toast.success('Additional price rejected and reverted.');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, 'Failed to reject price'));
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
      toast.success('7-Day Free Warranty Revision requested!');
      setIsRevisionModalOpen(false);
      setRevisionDesc('');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, 'Failed to request revision'));
    },
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewService.createReview({
        orderId: id,
        providerId: order?.providerId,
        customerId: order?.customerId,
        customerRating: ratingScore,
        reviewComment: reviewText,
      }),
    onSuccess: () => {
      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMessage(err, 'Failed to submit review'));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xs text-muted">
          Loading order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-surface dark:bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <h2 className="text-base font-bold text-ink dark:text-white">
            Order Not Found
          </h2>
        </div>
      </div>
    );
  }

  const hasAdditionalPrice = Number(order.additionalPrice) > 0;
  const isCompleted = order.orderStatus === OrderStatus.COMPLETED;

  return (
    <div className="min-h-screen bg-surface dark:bg-black text-ink dark:text-zinc-50 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Order Header Card */}
        <div className="bg-white dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-ink dark:text-white">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-xs text-muted">
                  Created on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-secondary dark:bg-emerald-950/60 text-primary dark:text-emerald-300 rounded-full border border-secondary dark:border-emerald-800">
                {order.orderStatus}
              </span>
              <span className="px-3 py-1 text-xs font-semibold bg-surface dark:bg-zinc-800 text-ink dark:text-zinc-300 rounded-full">
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Step Price Negotiation Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-ink dark:text-white">
                Price Breakdown & Negotiation Protection
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-muted bg-surface dark:bg-zinc-800 px-2.5 py-0.5 rounded-md">
              Edits: {order.priceEditCount || 0} / 2 Allowed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface dark:bg-zinc-800/50 rounded-2xl border border-line/60 dark:border-zinc-700/50 mb-4 text-center">
            <div>
              <span className="text-[11px] text-muted">Original Price</span>
              <p className="text-sm font-bold text-ink dark:text-white mt-0.5">
                {Number(order.originalPrice).toFixed(2)} BDT
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted">Platform Fee</span>
              <p className="text-sm font-bold text-ink dark:text-white mt-0.5">
                {Number(order.adminCommission).toFixed(2)} BDT
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted">Additional Extra</span>
              <p
                className={`text-sm font-bold mt-0.5 ${
                  hasAdditionalPrice
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-ink dark:text-white'
                }`}
              >
                +{Number(order.additionalPrice || 0).toFixed(2)} BDT
              </p>
            </div>
            <div>
              <span className="text-[11px] text-muted">Total Payable</span>
              <p className="text-base font-extrabold text-primary dark:text-emerald-400 mt-0.5">
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
                  className="flex-1 sm:flex-initial px-4 py-2 bg-primary hover:bg-primary text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
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

        {/* Order Lifecycle Actions Card (Start Work / Complete / Cancel) */}
        {!isCompleted && order.orderStatus !== OrderStatus.CANCELLED && (
          <div className="bg-white dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-ink dark:text-white">
                    Service Stage & Actions
                  </h3>
                  <p className="text-xs text-muted">
                    Current status: <span className="font-bold text-primary dark:text-emerald-400">{order.orderStatus}</span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 text-xs font-extrabold bg-surface dark:bg-zinc-800 text-ink dark:text-zinc-200 rounded-xl">
                {isProvider ? '🛠️ Provider View' : '👤 Customer View'}
              </span>
            </div>

            {/* STAGE 1: PENDING / ACCEPTED */}
            {(order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.ACCEPTED) && (
              <div className="p-4 bg-secondary/50 dark:bg-emerald-950/30 border border-secondary/60 dark:border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-ink dark:text-white">
                    {isProvider ? 'Technician Dispatch & Work Execution' : 'Waiting for Provider to Arrive'}
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    {isProvider
                      ? 'When you arrive at customer location, click Start Work to begin.'
                      : 'Your assigned technician is routed to your address.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isProvider ? (
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate(OrderStatus.IN_PROGRESS)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary hover:bg-primary text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-primary-disabled"
                    >
                      <Zap className="w-4 h-4" />
                      <span>🚀 Start Service Work</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate(OrderStatus.CANCELLED)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 border border-rose-200 dark:border-rose-900 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 2: IN_PROGRESS */}
            {order.orderStatus === OrderStatus.IN_PROGRESS && (
              <div className="p-4 bg-secondary/50 dark:bg-emerald-950/30 border border-secondary/60 dark:border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-ink dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    Service is Actively In Progress
                  </h4>
                  <p className="text-[11px] text-muted mt-0.5">
                    {isProvider
                      ? 'Technician is on site. Once the service is completed, mark it as finished.'
                      : 'Technician is performing the service. Confirm once the job is finished to release escrow & activate your 3-day warranty.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!isProvider ? (
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate(OrderStatus.COMPLETED)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary hover:bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-primary-disabled"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ Confirm Work Done & Complete</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStatusMutation.mutate(OrderStatus.COMPLETED)}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary hover:bg-primary text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-primary-disabled"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🏁 Mark Service Finished</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7-Day Free Warranty Revision & Review Section */}
        {isCompleted && (
          <div className="bg-white dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-ink dark:text-white">
                    7-Day Free Warranty Guarantee
                  </h3>
                  <p className="text-[11px] text-muted">
                    Free issue resolution covered by Master Services
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary dark:text-emerald-300 bg-secondary dark:bg-emerald-950/60 border border-secondary dark:border-emerald-800 rounded-xl hover:bg-secondary transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Claim Revision
              </button>
            </div>

            {/* Rate & Review Section */}
            <div className="pt-4 border-t border-line dark:border-zinc-800">
              {order?.providerReview ? (
                (() => {
                  const rev = order.providerReview;
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.customerRating
                                    ? 'fill-current'
                                    : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-ink dark:text-white">
                            {rev.customerRating}/5 Rating Submitted
                          </span>
                        </div>
                        {rev.reviewComment && (
                          <p className="text-xs text-muted dark:text-zinc-300 italic">
                            &ldquo;{rev.reviewComment}&rdquo;
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setRatingScore(rev.customerRating || 5);
                          setReviewText(rev.reviewComment || '');
                          setIsReviewModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink dark:text-zinc-300 bg-surface dark:bg-zinc-800 hover:bg-surface dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        Edit Review
                      </button>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-ink dark:text-zinc-200">
                      Rate your service experience
                    </h4>
                    <p className="text-[11px] text-muted">
                      1-3 stars triggers automatic support check; 4-5 stars rewards the provider.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setRatingScore(5);
                      setReviewText('');
                      setIsReviewModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-primary rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Write Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revision Modal */}
        <OrderRevisionModal
          isOpen={isRevisionModalOpen}
          onClose={() => setIsRevisionModalOpen(false)}
          revisionDesc={revisionDesc}
          onDescChange={setRevisionDesc}
          onSubmit={() => revisionMutation.mutate()}
          isPending={revisionMutation.isPending}
        />

        {/* Review Modal */}
        <OrderReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          ratingScore={ratingScore}
          onRatingChange={setRatingScore}
          reviewText={reviewText}
          onReviewChange={setReviewText}
          onSubmit={() => reviewMutation.mutate()}
          isPending={reviewMutation.isPending}
        />
      </main>
    </div>
  );
}
