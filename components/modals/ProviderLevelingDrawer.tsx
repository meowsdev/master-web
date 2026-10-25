'use client';

import React from 'react';
import {
  X,
  Award,
  TrendingUp,
  DollarSign,
  AlertOctagon,
  CheckCircle2,
  Lock,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProviderLevelingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  completedOrdersCount?: number;
  totalEarnings?: number;
  walletBalance?: number;
  rating?: number;
}

export function ProviderLevelingDrawer({
  isOpen,
  onClose,
  isDarkMode,
  completedOrdersCount = 18,
  totalEarnings = 34500,
  walletBalance = 4200,
  rating = 4.85,
}: ProviderLevelingDrawerProps) {
  if (!isOpen) return null;

  const isWalletNegative = walletBalance < 0;
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgDrawer = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgCard = isDarkMode ? 'bg-[#182229] border-[#222e35]' : 'bg-black/[0.02] border-[#e9edef]';

  // Level computation based on completed orders, earnings & rating
  const currentTier =
    completedOrdersCount >= 100 && totalEarnings >= 150000 && rating >= 4.8
      ? 'Top Rated Pro'
      : completedOrdersCount >= 50 && totalEarnings >= 50000 && rating >= 4.7
      ? 'Level 2 Expert'
      : completedOrdersCount >= 10 && totalEarnings >= 10000 && rating >= 4.5
      ? 'Level 1 Verified'
      : 'Level 0 New';

  const nextTierTarget =
    currentTier === 'Level 0 New'
      ? { title: 'Level 1 Verified', jobs: 10, earnings: 10000, priority: '+10% Priority', maxOrders: 5 }
      : currentTier === 'Level 1 Verified'
      ? { title: 'Level 2 Expert', jobs: 50, earnings: 50000, priority: '+25% Priority', maxOrders: 10 }
      : currentTier === 'Level 2 Expert'
      ? { title: 'Top Rated Pro (VIP)', jobs: 100, earnings: 150000, priority: '1st Priority', maxOrders: 'Unlimited' }
      : null;

  const progressPct = nextTierTarget
    ? Math.min(100, Math.round((completedOrdersCount / nextTierTarget.jobs) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l select-none ${bgDrawer}`}>
        {/* Top Header */}
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold leading-tight ${textPrimary}`}>
                Earnings & Leveling Center
              </h2>
              <p className={`text-[11px] ${textSecondary}`}>
                Fiverr-Style Agency Performance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Negative Balance Alert Warning Banner */}
        {isWalletNegative && (
          <div className="p-3 bg-rose-500/15 border-b border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 shrink-0 text-rose-600" />
            <div className="leading-tight">
              <span className="font-bold">Platform Dispatch Locked!</span> কমিশন বকেয়া থাকার কারণে নতুন কাজের ব্রডকাস্ট লক করা হয়েছে। ওয়ালেট রিচার্জ করুন।
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Level Badge Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${bgCard}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h3 className={`text-sm font-black ${textPrimary}`}>{currentTier}</h3>
                  <p className={`text-[11px] ${textSecondary}`}>
                    Rating: ⭐ {rating.toFixed(2)} • {completedOrdersCount} Jobs Done
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#008069]/15 text-[#008069] dark:text-[#25D366]">
                Active Badge
              </span>
            </div>

            {/* Progress to Next Tier */}
            {nextTierTarget && (
              <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className={textSecondary}>Progress to {nextTierTarget.title}:</span>
                  <span className="font-bold text-[#008069] dark:text-[#25D366]">{progressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#008069] to-[#25D366] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#8696a0]">
                  <span>{completedOrdersCount}/{nextTierTarget.jobs} Jobs</span>
                  <span>Max: {nextTierTarget.maxOrders} concurrent</span>
                </div>
              </div>
            )}
          </div>

          {/* Earnings & Wallet Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border ${bgCard} space-y-1`}>
              <span className={`text-[11px] font-medium ${textSecondary}`}>Total Earnings</span>
              <div className="text-lg font-black text-[#008069] dark:text-[#25D366]">
                ৳{totalEarnings.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
                <ArrowUpRight className="w-3 h-3" /> +14% this month
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border ${bgCard} space-y-1`}>
              <span className={`text-[11px] font-medium ${textSecondary}`}>Platform Wallet</span>
              <div
                className={`text-lg font-black ${
                  isWalletNegative ? 'text-rose-600' : 'text-[#008069] dark:text-[#25D366]'
                }`}
              >
                ৳{walletBalance.toLocaleString()}
              </div>
              <span className="text-[10px] text-[#8696a0]">
                {isWalletNegative ? '⚠️ Due Pending' : 'Available Balance'}
              </span>
            </div>
          </div>

          {/* Leveling Tiers Reference */}
          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
              Platform Tier Perks & Limits
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.01] flex items-center justify-between">
                <div>
                  <h5 className={`font-bold ${textPrimary}`}>Level 0 (New)</h5>
                  <p className={`text-[11px] ${textSecondary}`}>Max 3 Active Jobs • Standard Broadcast</p>
                </div>
                <span className="text-[10px] text-gray-400">Entry</span>
              </div>

              <div className="p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.01] flex items-center justify-between">
                <div>
                  <h5 className={`font-bold ${textPrimary}`}>Level 1 (Verified)</h5>
                  <p className={`text-[11px] ${textSecondary}`}>10 Jobs + ৳10k • Max 5 Jobs • +10% Priority</p>
                </div>
                <span className="text-[10px] text-[#008069] font-bold">Active</span>
              </div>

              <div className="p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.01] flex items-center justify-between">
                <div>
                  <h5 className={`font-bold ${textPrimary}`}>Level 2 (Expert)</h5>
                  <p className={`text-[11px] ${textSecondary}`}>50 Jobs + ৳50k • Max 10 Jobs • +25% Priority</p>
                </div>
                <span className="text-[10px] text-amber-500 font-bold">Upcoming</span>
              </div>

              <div className="p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.01] flex items-center justify-between">
                <div>
                  <h5 className={`font-bold ${textPrimary}`}>Top Rated Pro (VIP)</h5>
                  <p className={`text-[11px] ${textSecondary}`}>100+ Jobs + ৳150k • Unlimited Jobs • 1st Priority</p>
                </div>
                <span className="text-[10px] text-purple-600 font-bold">VIP</span>
              </div>
            </div>
          </div>

          {/* Wallet Recharge / Settle Action */}
          <button
            onClick={() => toast.success('SSLCommerz / bKash Wallet Recharge gateway')}
            className="w-full py-2.5 rounded-xl bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>Recharge Wallet & Settle Dues (ওয়ালেট ব্যালেন্স)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
