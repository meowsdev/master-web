'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { servicesService } from '@/services/services.service';
import { ordersService } from '@/services/orders.service';
import { useAuthStore } from '@/store/useAuthStore';
import {
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Headphones,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

function NewOrderContent() {
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId') || '';
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [address, setAddress] = useState(
    user?.addresses?.[0]?.addressText || 'Gulshan-2, Dhaka, Bangladesh'
  );
  const [preferredTime, setPreferredTime] = useState('Today, Within 2 Hours');
  const [notes, setNotes] = useState('');

  // Fetch Service Details
  const { data: service, isLoading } = useQuery({
    queryKey: ['service-detail', serviceId],
    queryFn: () => servicesService.getServiceById(serviceId),
    enabled: !!serviceId,
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.info('Please log in first to confirm your booking.');
      router.push('/auth/login');
      return;
    }

    // Direct Flow A Counselor consultation for order dispatch
    toast.success('Consultation session initialized for this service!');
    router.push(`/chat?serviceId=${encodeURIComponent(serviceId)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 mb-2 inline-block"
          >
            ← Back to Services
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Confirm Service Booking
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Review service specifications and connect with counselor for fast technician assignment
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl animate-pulse" />
        ) : (
          <div className="space-y-6">
            {/* Service Summary Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {service?.category?.name || 'Home Maintenance'}
                  </span>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-2">
                    {service?.name || 'Selected Verified Service'}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {service?.description ||
                      'Comprehensive diagnostic, skilled technician dispatch, and verified genuine parts replacement.'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-zinc-400 block">Base Price</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    ৳ {Number(service?.basePrice || 500).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Est. {service?.durationMin || 45} mins</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3-Day Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 col-span-2 sm:col-span-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Verified Experts</span>
                </div>
              </div>
            </div>

            {/* Booking Details Form */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Service Location & Scheduling
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Service Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Preferred Arrival Time
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    placeholder="e.g. Tomorrow 10:00 AM"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Problem Description / Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe your issue or any specific requirements..."
                  className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-zinc-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Confirm & Connect Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleBooking}
                className="w-full sm:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
                <span>Confirm & Connect With Counselor</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 text-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold rounded-2xl transition-all"
              >
                Cancel
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500 text-sm">
          Loading Booking Details...
        </div>
      }
    >
      <NewOrderContent />
    </Suspense>
  );
}
