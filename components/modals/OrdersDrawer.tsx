'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  MessageSquare,
  Calendar,
  LogIn,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { ordersService } from '@/services/orders.service';
import { revisionService } from '@/services/revision.service';
import { Order, OrderStatus } from '@/types/order.types';
import { OrderRevisionModal } from './OrderRevisionModal';

interface OrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectServiceById: (serviceId: string) => void;
  onOpenAuth: () => void;
  onOrderRevisionRequested?: (orderId: string, issue: string) => void;
  isAuthenticated: boolean;
  isDarkMode: boolean;
}

type OrderTabFilter = 'ALL' | 'RUNNING' | 'COMPLETED';

export function OrdersDrawer({
  isOpen,
  onClose,
  onSelectServiceById,
  onOpenAuth,
  onOrderRevisionRequested,
  isAuthenticated,
  isDarkMode,
}: OrdersDrawerProps) {
  const [activeTab, setActiveTab] = useState<OrderTabFilter>('ALL');
  const queryClient = useQueryClient();

  // Fetch real user orders from backend API
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery<Order[]>({
    queryKey: ['my-orders-drawer'],
    queryFn: () => ordersService.getOrders(),
    enabled: isOpen && isAuthenticated,
  });

  // Complete Order Mutation directly inside Drawer
  const completeOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      ordersService.updateStatus(orderId, OrderStatus.COMPLETED),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders-drawer'] });
      toast.success(`Order #${orderId.slice(0, 8).toUpperCase()} marked as Completed! 🎉`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to complete order';
      toast.error(msg);
    },
  });

  // Cancel Order Mutation inside Drawer
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) =>
      ordersService.updateStatus(orderId, OrderStatus.CANCELLED),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders-drawer'] });
      toast.success(`Order #${orderId.slice(0, 8).toUpperCase()} has been cancelled.`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to cancel order';
      toast.error(msg);
    },
  });

  // 3-Day Warranty Revision State & Mutation
  const [revisionOrderId, setRevisionOrderId] = useState<string | null>(null);
  const [issueDescription, setIssueDescription] = useState('');

  const revisionMutation = useMutation({
    mutationFn: ({ orderId, issue }: { orderId: string; issue: string }) =>
      revisionService.createRevision({ orderId, issueDescription: issue }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['my-orders-drawer'] });
      queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders'] });
      toast.success(
        `3-Day Free Revision requested for Order #${vars.orderId.slice(0, 8).toUpperCase()}! Switched to Running orders.`
      );
      setRevisionOrderId(null);
      setIssueDescription('');
      setActiveTab('RUNNING'); // Immediately switch to RUNNING tab!
      onOrderRevisionRequested?.(vars.orderId, vars.issue);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to request revision';
      toast.error(msg);
    },
  });

  const hasActiveRevision = (o: Order) =>
    o.revisions?.some(
      (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
    );

  const filteredOrders = useMemo(() => {
    let list: Order[] = [];
    if (activeTab === 'RUNNING') {
      list = orders.filter(
        (o) =>
          o.orderStatus === OrderStatus.IN_PROGRESS ||
          o.orderStatus === OrderStatus.ACCEPTED ||
          o.orderStatus === OrderStatus.PENDING
      );
    } else if (activeTab === 'COMPLETED') {
      list = orders.filter((o) => o.orderStatus === OrderStatus.COMPLETED);
    } else {
      list = orders;
    }
    // Revisions always appear at top of list
    return [...list].sort((a, b) => {
      const aRev = hasActiveRevision(a) ? 1 : 0;
      const bRev = hasActiveRevision(b) ? 1 : 0;
      if (aRev !== bRev) return bRev - aRev;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, activeTab]);

  const activeRevisionCount = orders.filter(hasActiveRevision).length;

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgCard = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';

  const runningCount = orders.filter(
    (o) =>
      o.orderStatus === OrderStatus.IN_PROGRESS ||
      o.orderStatus === OrderStatus.ACCEPTED ||
      o.orderStatus === OrderStatus.PENDING
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close Orders Drawer" />

      {/* Slide-in WhatsApp Drawer Container */}
      <div
        className={`relative z-10 w-full max-w-md h-full shadow-2xl border-l flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 ${
          isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
        }`}
      >
        {/* Header (Pinned) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#008069]/10 dark:bg-[#005c4b]/40 text-[#008069] dark:text-[#25D366]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>My Orders & Bookings</h3>
              <p className={`text-[11px] ${textSecondary}`}>
                WhatsApp In-Chat Service Orders ({orders.length} total)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => refetch()}
              className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} transition-colors cursor-pointer`}
              title="Refresh Orders"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} transition-colors cursor-pointer`}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-2.5 border-b border-black/5 dark:border-white/10 flex items-center gap-2 shrink-0 bg-black/[0.01] dark:bg-white/[0.01]">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#008069] dark:text-[#25D366] font-bold shadow-xs'
                : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('RUNNING')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RUNNING'
                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#008069] dark:text-[#25D366] font-bold shadow-xs'
                : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`
            }`}
          >
            <span>Running</span>
            {runningCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-black">
                {runningCount}
              </span>
            )}
            {activeRevisionCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-black font-black animate-pulse">
                ⚠️ {activeRevisionCount} Revision
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#008069] dark:text-[#25D366] font-bold shadow-xs'
                : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`
            }`}
          >
            Completed
          </button>
        </div>

        {/* Scrollable Orders Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 overscroll-contain">
          {!isAuthenticated ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#008069]/10 text-[#008069] dark:text-[#25D366] flex items-center justify-center mx-auto">
                <LogIn className="w-7 h-7" />
              </div>
              <div>
                <h4 className={`text-base font-bold ${textPrimary}`}>Login Required</h4>
                <p className={`text-xs mt-1 ${textSecondary}`}>
                  Please log in with your mobile number to view and manage your orders.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-5 py-2.5 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login with Phone</span>
              </button>
            </div>
          ) : isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-28 rounded-2xl animate-pulse ${
                    isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'
                  }`}
                />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 text-[#8696a0] flex items-center justify-center mx-auto">
                <Package className="w-7 h-7" />
              </div>
              <h4 className={`text-sm font-bold ${textPrimary}`}>No orders in this list</h4>
              <p className={`text-xs ${textSecondary}`}>
                {activeTab === 'RUNNING'
                  ? 'No active orders running right now. You can book services directly from the chat.'
                  : 'Start a service chat and click Book Service to place your first booking.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isRunning =
                order.orderStatus === OrderStatus.IN_PROGRESS ||
                order.orderStatus === OrderStatus.ACCEPTED ||
                order.orderStatus === OrderStatus.PENDING;
              const isCompleted = order.orderStatus === OrderStatus.COMPLETED;
              const activeRevision = order.revisions?.find(
                (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
              );
              const isOrderRevision = !!activeRevision;

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isOrderRevision
                      ? 'border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/25 border-amber-300 dark:border-amber-700/50'
                      : bgCard
                  }`}
                >
                  {/* Top Bar: ID and Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#8696a0]">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isOrderRevision
                          ? 'bg-amber-400 dark:bg-amber-500 text-black font-black border border-amber-300 shadow-xs animate-pulse'
                          : isCompleted
                          ? 'bg-[#d9fdd3] text-[#008069] dark:bg-[#005c4b]/60 dark:text-[#25D366]'
                          : isRunning
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {isOrderRevision ? (
                        <>
                          <RotateCcw className="w-3 h-3 animate-spin" />
                          <span>REVISION RUNNING</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{order.orderStatus}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{order.orderStatus}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Service Name & Date */}
                  <div>
                    <h4 className={`text-sm font-bold ${textPrimary}`}>
                      {order.service?.name || 'On-Demand Service Fix'}
                    </h4>
                    <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${textSecondary}`}>
                      <Calendar className="w-3 h-3" />
                      <span>
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Active Revision Banner if order is in revision */}
                  {isOrderRevision && activeRevision && (
                    <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-[11px]">
                        <RotateCcw className="w-3 h-3 text-amber-600 animate-spin" />
                        <span>3-Day Free Warranty Revision Active</span>
                      </div>
                      <p className="text-[11px] text-amber-950 dark:text-amber-200 italic pl-4">
                        &ldquo;{activeRevision.issueDescription}&rdquo;
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 pl-4">
                        Technician is re-working on this issue with top priority.
                      </p>
                    </div>
                  )}

                  {/* Price & Payment Mode */}
                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10 text-xs">
                    <span className={`font-medium ${textSecondary}`}>Total Amount</span>
                    <span className="font-extrabold text-[#008069] dark:text-[#25D366] text-sm">
                      ৳ {Number(order.finalPrice || order.originalPrice).toFixed(0)}
                    </span>
                  </div>

                  {/* Actions: View in Chat / Complete Order */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectServiceById(order.serviceId);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open in Chat</span>
                    </button>

                    {isRunning && (
                      <>
                        <button
                          onClick={() => cancelOrderMutation.mutate(order.id)}
                          disabled={cancelOrderMutation.isPending}
                          className="py-2 px-2.5 rounded-xl border border-rose-300 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Cancel Order"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => completeOrderMutation.mutate(order.id)}
                          disabled={completeOrderMutation.isPending}
                          className="py-2 px-3 rounded-xl bg-[#d9fdd3] dark:bg-[#005c4b]/50 hover:bg-[#c2f7b8] text-[#008069] dark:text-[#25D366] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Mark as Completed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </button>
                      </>
                    )}

                    {isCompleted && (() => {
                      const completedAt = new Date(order.updatedAt).getTime();
                      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
                      const isWithin3Days = Date.now() - completedAt <= threeDaysMs;
                      const daysLeft = Math.max(
                        1,
                        Math.ceil((completedAt + threeDaysMs - Date.now()) / (24 * 60 * 60 * 1000))
                      );

                      if (isWithin3Days) {
                        return (
                          <button
                            onClick={() => setRevisionOrderId(order.id)}
                            className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Request Free 3-Day Warranty Revision"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Revision ({daysLeft}d left)</span>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 3-Day Warranty Revision Dialog */}
        <OrderRevisionModal
          isOpen={!!revisionOrderId}
          orderId={revisionOrderId}
          issueDescription={issueDescription}
          onIssueDescriptionChange={setIssueDescription}
          onClose={() => setRevisionOrderId(null)}
          onSubmit={() =>
            revisionOrderId &&
            revisionMutation.mutate({
              orderId: revisionOrderId,
              issue: issueDescription.trim(),
            })
          }
          isSubmitting={revisionMutation.isPending}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}
