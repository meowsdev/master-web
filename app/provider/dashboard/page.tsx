'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { ordersService } from '@/services/orders.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Order, OrderStatus } from '@/types/order.types';
import {
  Wallet,
  AlertOctagon,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Package,
  Wrench,
  ArrowUpRight,
  ShieldAlert,
  CreditCard,
  PlusCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProviderDashboardPage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Top Up Modal state
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Live profile query
  const { data: liveUser, refetch: refetchMe } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authService.getMe();
      setUser(res);
      return res;
    },
    initialData: user ?? undefined,
  });

  const activeUser = liveUser || user;
  const providerProfile = activeUser?.providerProfile || activeUser?.activeProfile;
  const providerId = providerProfile?.id;

  // Real provider metrics
  const walletBalance = Number(providerProfile?.walletBalance ?? 0);
  const providerLevel = providerProfile?.level || 'BRONZE';
  const ratingScore = Number(providerProfile?.rating ?? 5.0);
  const isWalletNegative = walletBalance < 0 || providerProfile?.isBlockedForNegative;

  // Query Provider Orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['provider-orders', providerId],
    queryFn: () =>
      providerId
        ? ordersService.getProviderOrders(providerId)
        : ordersService.getOrders(),
    enabled: !!providerId,
  });

  const completedOrders =
    orders.filter((ord: Order) => ord.orderStatus === OrderStatus.COMPLETED).length ||
    Number(providerProfile?.totalCompletedOrders ?? 0);

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated!');
      queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
      refetchMe();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  // Recharge Wallet Mutation
  const rechargeMutation = useMutation({
    mutationFn: (amount: number) => authService.rechargeProviderWallet(amount),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success(`Successfully recharged ${topUpAmount} BDT to your wallet!`);
      setIsTopUpOpen(false);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to recharge wallet');
    },
  });

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? Number(customAmount) : topUpAmount;
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Please enter a valid recharge amount');
      return;
    }
    rechargeMutation.mutate(finalAmount);
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'GOLD':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'SILVER':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'BRONZE':
      case 'NEW':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Negative Balance Lock Alert Banner */}
        {isWalletNegative && (
          <div className="p-5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-rose-500/10 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Provider Account Locked: Negative Wallet Balance ({walletBalance.toFixed(2)} BDT)
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                  Platform commissions exceeded your balance. New orders are temporarily locked until you recharge.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              Recharge Wallet
            </button>
          </div>
        )}

        {/* Top Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">
                Platform Wallet
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            <div className="my-4">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {walletBalance.toFixed(2)} BDT
              </span>
              <p
                className={`text-xs mt-1 font-medium ${
                  isWalletNegative
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isWalletNegative ? '● Account Locked (Negative)' : '● Active & Good Standing'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Top Up Wallet
            </button>
          </div>

          {/* Level Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">
                Monthly Leveling Rank
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {providerLevel}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeStyle(
                    providerLevel
                  )}`}
                >
                  Verified
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                ⭐ {ratingScore.toFixed(1)} Rating • Evaluated monthly
              </p>
            </div>

            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (completedOrders / 25) * 100)}%` }}
              />
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">
                Total Orders Completed
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div className="my-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {completedOrders} Orders
              </span>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                {orders.length > 0
                  ? `${Math.round((completedOrders / orders.length) * 100)}% Completion Rate`
                  : 'Ready for Orders'}
              </p>
            </div>

            <div className="text-[11px] text-zinc-400">
              Qualifies for Silver/Gold badge promotion with active performance.
            </div>
          </div>
        </div>

        {/* Provider Orders Management Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Assigned Orders & Service Requests
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">
                {orders.length} Total Orders
              </span>
              <button
                type="button"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
                  refetchMe();
                }}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-xs text-zinc-400">
              Loading provider orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-xs">
              No orders assigned yet. Orders assigned by counselors or placed by customers will appear here.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {orders.map((ord: Order) => (
                <div
                  key={ord.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        Order #{ord.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md">
                        {ord.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Total: {Number(ord.totalPrice).toFixed(2)} BDT (Platform Fee:{' '}
                      {Number(ord.adminCommission).toFixed(2)} BDT)
                    </p>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="flex items-center gap-2">
                    {ord.orderStatus === OrderStatus.ACCEPTED && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: ord.id,
                            status: OrderStatus.IN_PROGRESS,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        Start Work
                      </button>
                    )}

                    {ord.orderStatus === OrderStatus.IN_PROGRESS && (
                      <button
                        type="button"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: ord.id,
                            status: OrderStatus.COMPLETED,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    )}

                    <a
                      href={`/orders/${ord.id}`}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Up Wallet Modal */}
        {isTopUpOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Recharge Provider Wallet
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-zinc-500">
                Current Balance:{' '}
                <strong className={isWalletNegative ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                  {walletBalance.toFixed(2)} BDT
                </strong>
                . Recharging ensures smooth order acceptance and instant account unblocking.
              </p>

              <form onSubmit={handleRechargeSubmit} className="space-y-4">
                {/* Preset Amount Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setTopUpAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        !customAmount && topUpAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      +{amt} BDT
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 mb-1 block">
                    Or Enter Custom Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    placeholder="e.g. 1500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Payment Simulation Note */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-[11px] text-zinc-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  Instant credit via bKash / Nagad / Card Gateway.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTopUpOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rechargeMutation.isPending}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {rechargeMutation.isPending ? 'Processing...' : 'Pay & Recharge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
