'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { ordersService } from '@/services/orders.service';
import { useAuthStore } from '@/store/useAuthStore';
import { OrderStatus, PaymentStatus } from '@/types/order.types';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function OrdersListPage() {
  const { isAuthenticated, user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersService.getOrders(),
    enabled: isAuthenticated,
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Package className="w-8 h-8 text-emerald-600" />
              <span>My Orders & Bookings</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Track active service orders, verify pricing changes, and manage warranty revisions
            </p>
          </div>

          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Consult Counselor</span>
          </Link>
        </div>

        {/* Orders List / Empty State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              No orders found yet
            </h3>
            <p className="text-xs text-zinc-500 mt-2 mb-6">
              You have not placed any service orders yet. Select a service from the home page or talk to a counselor to get started.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const hasPriceChange =
                Number(order.priceEditCount || 0) > 0 &&
                order.paymentStatus === PaymentStatus.UNPAID;

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-zinc-400">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            order.orderStatus === OrderStatus.COMPLETED
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : order.orderStatus === OrderStatus.IN_PROGRESS
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : order.orderStatus === OrderStatus.DISPUTED
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {order.orderStatus}
                        </span>

                        {hasPriceChange && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Price Change Pending
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {order.service?.name || 'On-Demand Service Fix'}
                      </h3>

                      <p className="text-xs text-zinc-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-zinc-400 block">Total Amount</span>
                        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                          ৳ {Number(order.finalPrice || order.originalPrice).toFixed(0)}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
