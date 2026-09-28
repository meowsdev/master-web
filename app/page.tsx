'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { servicesService } from '@/services/services.service';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Wrench,
  Clock,
  Sparkles,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Award,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ac-repair', name: 'AC Repair & Service', icon: '❄️', count: '120+ Pros' },
  { id: 'electrical', name: 'Electrical Wiring & Fix', icon: '⚡', count: '95+ Pros' },
  { id: 'plumbing', name: 'Plumbing & Sanitary', icon: '🔧', count: '80+ Pros' },
  { id: 'appliance', name: 'Home Appliances', icon: '📺', count: '65+ Pros' },
  { id: 'cleaning', name: 'Deep Home Cleaning', icon: '🧹', count: '110+ Pros' },
  { id: 'painting', name: 'Painting & Renovation', icon: '🎨', count: '50+ Pros' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<number>(15);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  }>({
    lat: 23.8103, // Default Dhaka
    lng: 90.4125,
    address: 'Gulshan, Dhaka',
  });

  // Query discovered providers with GPS distance
  const { data: providers, isLoading } = useQuery({
    queryKey: [
      'discover-providers',
      userLocation.lat,
      userLocation.lng,
      selectedRadius,
      searchQuery,
    ],
    queryFn: () =>
      servicesService.discoverProviders({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radiusKm: selectedRadius,
        search: searchQuery || undefined,
      }),
  });

  const getLevelBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'GOLD':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'SILVER':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'BRONZE':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <Navbar
        onLocationChange={(lat, lng, address) =>
          setUserLocation({ lat, lng, address })
        }
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Pros • 3-Day Warranty • GPS Distance Matching</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white">
              Instant Verified Services,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Guaranteed Satisfaction
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Find top-rated local technicians, negotiate fair prices in real-time,
              and enjoy complete peace of mind with our 3-day service warranty.
            </p>

            {/* Search Box & GPS Radius Picker */}
            <div className="mt-8 max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 px-3 w-full">
                <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AC repair, electrician, plumber..."
                  className="w-full text-sm bg-transparent border-none focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 py-2"
                />
              </div>

              {/* Radius Select */}
              <div className="flex items-center gap-2 w-full sm:w-auto px-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <select
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-2.5 py-2 text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={5}>Within 5 km</option>
                  <option value={15}>Within 15 km</option>
                  <option value={30}>Within 30 km</option>
                  <option value={50}>Within 50 km</option>
                </select>

                <button
                  type="button"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Explore Popular Categories
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Instant match with specialized expert agencies
              </p>
            </div>
            <Link
              href="/chat"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              Ask Flow A Counselor <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSearchQuery(cat.name.split(' ')[0])}
                className="group p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer flex flex-col items-center text-center"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-zinc-500 mt-1">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discovered Nearby Providers Section (Haversine Formula Matching) */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Nearby Verified Providers
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                GPS Live Filter
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Sorted by highest rating, active availability, and shortest distance
            </p>
          </div>
          <div className="text-xs text-zinc-500 font-medium">
            Found {providers?.length || 0} providers within {selectedRadius}km
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Providers Grid */}
        {!isLoading && providers && providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {p.user?.name ? p.user.name[0] : 'P'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          {p.user?.name || 'Verified Provider'}
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {p.experienceYears || 2}+ Years Experience
                        </p>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getLevelBadge(
                        p.level
                      )}`}
                    >
                      {p.level || 'NEW'}
                    </span>
                  </div>

                  {/* Rating and Distance Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(p.rating || 5.0).toFixed(1)}</span>
                    </div>

                    {p.distanceKm !== null && (
                      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{p.distanceKm.toFixed(1)} km away</span>
                      </div>
                    )}

                    <span
                      className={`text-[11px] font-semibold ml-auto ${
                        p.isAvailable
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      ● {p.isAvailable ? 'Available Now' : 'Busy'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <Link
                    href={`/chat?providerId=${p.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Direct Chat
                  </Link>

                  <Link
                    href={`/orders/new?providerId=${p.id}`}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all"
                  >
                    Hire
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                No providers found in this radius
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Try increasing the radius to 30km or 50km to discover top verified providers in nearby zones.
              </p>
            </div>
          )
        )}
      </section>

      {/* PRD Pillars & Guarantee Showcase */}
      <section className="py-16 bg-zinc-100/70 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Built on Transparency & Security
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Every order is protected by our automated platform guarantees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                3-Day Free Warranty
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                If the fix encounters an issue within 3 days, request a free service revision with zero extra cost.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                2-Step Fair Pricing
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Providers can only adjust prices up to 2 times, requiring your explicit in-app approval.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Monthly Leveling
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Only top-performing agencies earn Platinum and Gold status based on real customer review scores.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Legal Escrow Protection
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                Full incident dossier and audit logging protecting both customers and providers in any dispute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
        © 2026 Master Services Platform. All rights reserved.
      </footer>
    </div>
  );
}
