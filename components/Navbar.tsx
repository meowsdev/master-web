'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types/auth.types';
import {
  MapPin,
  Search,
  User,
  LogOut,
  ShieldCheck,
  MessageSquare,
  Package,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLocationChange }) => {
  const { user, isAuthenticated, activeRole, logout, setUser, setRole } =
    useAuthStore();
  const [currentLocation, setCurrentLocation] = useState('Dhaka, Bangladesh');
  const [isDetecting, setIsDetecting] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation(`GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        setIsDetecting(false);
        toast.success('Live GPS location detected!');
        if (onLocationChange) {
          onLocationChange(latitude, longitude, 'Live GPS Location');
        }
      },
      (error) => {
        setIsDetecting(false);
        toast.error(`Location access denied: ${error.message}`);
      }
    );
  };

  const handleSwitchRole = async (role: UserRole) => {
    try {
      const updated = await authService.switchProfile(role);
      setUser(updated);
      setRole(role);
      toast.success(`Switched active profile to ${role}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not switch profile');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Master<span className="text-emerald-600">Services</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
              ON-DEMAND PLATFORM
            </span>
          </div>
        </Link>

        {/* GPS Location Pill */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate max-w-[140px]">{currentLocation}</span>
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline underline-offset-2 ml-1 cursor-pointer"
          >
            {isDetecting ? 'Locating...' : 'Auto Detect'}
          </button>
        </div>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Chat Link */}
              <Link
                href="/chat"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Live Chat</span>
              </Link>

              {/* Orders Link */}
              <Link
                href="/orders"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
              >
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Orders</span>
              </Link>

              {/* Provider Dashboard Shortcut */}
              {(activeRole === UserRole.PROVIDER || user?.role === UserRole.PROVIDER) && (
                <Link
                  href="/provider/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/40 hover:bg-emerald-200/80 rounded-lg transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                  <span className="hidden sm:inline">Provider Hub</span>
                </Link>
              )}

              {/* Role Switcher Pill */}
              <select
                value={activeRole || user?.role || UserRole.CUSTOMER}
                onChange={(e) => handleSwitchRole(e.target.value as UserRole)}
                className="text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {(
                  user?.availableRoles || [
                    UserRole.CUSTOMER,
                    UserRole.PROVIDER,
                    UserRole.COUNSELOR,
                  ]
                ).map((role) => (
                  <option key={role} value={role}>
                    {role === UserRole.CUSTOMER && '👤 Customer'}
                    {role === UserRole.PROVIDER && '🛠️ Provider'}
                    {role === UserRole.COUNSELOR && '🎧 Counselor'}
                    {role === UserRole.TECHNICIAN && '🔧 Technician'}
                    {role === UserRole.ADMIN && '👑 Admin'}
                    {role === UserRole.MANAGER && '💼 Manager'}
                    {role === UserRole.HR && '📋 HR'}
                    {role === UserRole.SUPPORT && '💬 Support'}
                  </option>
                ))}
              </select>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  toast.success('Logged out successfully');
                }}
                className="p-1.5 text-zinc-500 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/30 transition-all hover:shadow-emerald-600/50"
              >
                Login / Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
