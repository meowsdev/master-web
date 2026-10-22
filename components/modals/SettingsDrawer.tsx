'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Wrench,
  ShieldAlert,
  Users,
  Headphones,
  LogOut,
  LogIn,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserRole } from '@/types/auth.types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  user: any;
  activeRole: string | null;
  onSwitchRole?: (role: UserRole) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  user,
  activeRole,
  onOpenAuth,
  onLogout,
}: SettingsDrawerProps) {
  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  // Role details metadata
  const roleMeta: Record<string, { label: string; desc: string; icon: any }> = {
    [UserRole.CUSTOMER]: {
      label: 'Customer (গ্রাহক)',
      desc: 'Browse on-demand services & book in chat',
      icon: UserCheck,
    },
    [UserRole.PROVIDER]: {
      label: 'Provider (সার্ভিস প্রোভাইডার)',
      desc: 'Accept job dispatches & manage team',
      icon: Briefcase,
    },
    [UserRole.COUNSELOR]: {
      label: 'Counselor (কাউন্সেলর)',
      desc: 'Advise customer inquiries & consultations',
      icon: ShieldCheck,
    },
    [UserRole.TECHNICIAN]: {
      label: 'Technician (টেকনিশিয়ান)',
      desc: 'On-site diagnostics, inspection & repair',
      icon: Wrench,
    },
    [UserRole.ADMIN]: {
      label: 'Admin (অ্যাডমিন)',
      desc: 'Platform governance, audit & system monitoring',
      icon: ShieldAlert,
    },
    [UserRole.MANAGER]: {
      label: 'Manager (ম্যানেজার)',
      desc: 'Operations & service quality assurance',
      icon: Users,
    },
    [UserRole.SUPPORT]: {
      label: 'Support (হেল্পডেস্ক)',
      desc: 'Customer dispute resolution & tickets',
      icon: Headphones,
    },
  };

  const currentRole = (user?.role || activeRole || UserRole.CUSTOMER) as UserRole;
  const currentRoleInfo = roleMeta[currentRole] || roleMeta[UserRole.CUSTOMER];
  const RoleIcon = currentRoleInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm h-full shadow-2xl border-l flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200 overflow-y-auto ${
          isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
        }`}
      >
        {/* Top Header & Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <h3 className={`text-lg font-bold ${textPrimary}`}>Settings & Account</h3>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} cursor-pointer`}
              title="Close Settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[#008069] text-white flex items-center justify-center text-xl font-bold border-2 border-[#25D366] shrink-0">
                {user?.profilePhoto ? (
                  <Image src={user.profilePhoto} alt="User" width={56} height={56} className="object-cover" />
                ) : (
                  <span>{user?.name ? user.name[0].toUpperCase() : 'G'}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className={`text-base font-bold truncate ${textPrimary}`}>
                  {user?.name || 'Guest User'}
                </h4>
                <p className={`text-xs truncate ${textSecondary}`}>
                  {user?.mobileNumber || 'Not logged in'}
                </p>
                <span className="inline-block mt-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#e7fce3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366]">
                  Role: {currentRole}
                </span>
              </div>
            </div>

            {/* Quick Preferences */}
            <div className="space-y-2 pt-1">
              {/* Dark/Light mode toggle */}
              <div
                onClick={onToggleTheme}
                className="p-3 rounded-2xl flex items-center justify-between border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-black/5 dark:border-white/10"
              >
                <div className="flex items-center gap-2.5 text-sm">
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  <span className={textPrimary}>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <span className={`text-xs ${textSecondary}`}>{isDarkMode ? 'Dark' : 'Light'}</span>
              </div>

              {/* Sound notifications */}
              <div
                onClick={onToggleSound}
                className="p-3 rounded-2xl flex items-center justify-between border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-black/5 dark:border-white/10"
              >
                <div className="flex items-center gap-2.5 text-sm">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#25D366]" /> : <VolumeX className="w-4 h-4" />}
                  <span className={textPrimary}>Sound Notifications</span>
                </div>
                <span className={`text-xs ${textSecondary}`}>{soundEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>

            {/* Assigned Permanent Role Card (Single Role Policy) */}
            <div className="pt-2 space-y-2">
              <label className={`text-xs font-bold ${textSecondary}`}>
                Assigned Account Role
              </label>

              {user ? (
                <div
                  className={`p-3.5 rounded-2xl border space-y-3 ${
                    isDarkMode ? 'bg-[#202c33]/60 border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366] shrink-0">
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className={`text-xs font-bold truncate ${textPrimary}`}>
                          {currentRoleInfo.label}
                        </h5>
                        <p className={`text-[10px] truncate ${textSecondary}`}>
                          {currentRoleInfo.desc}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d9fdd3] dark:bg-[#005c4b]/60 text-[#008069] dark:text-[#25D366] shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Single Role
                    </span>
                  </div>

                  {/* Single Role Policy Badge */}
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] leading-relaxed space-y-1 ${
                      isDarkMode
                        ? 'bg-[#111b21] border-[#222e35] text-[#8696a0]'
                        : 'bg-white border-[#e9edef] text-[#667781]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                      <Lock className="w-3 h-3" />
                      <span>এক নাম্বারে একটি মাত্র রোল নির্ধারিত</span>
                    </div>
                    <p className="text-[10px]">
                      এই ফোন নাম্বারে স্থায়ীভাবে <strong>{currentRole}</strong> রোল সক্রিয়। অন্য কোনো রোলে (যেমন Provider বা Counselor) কাজ করতে চাইলে সেই রোলের রেজিস্ট্রিকৃত ফোন নাম্বার দিয়ে লগইন করুন।
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-3.5 rounded-2xl border text-center space-y-2.5 ${
                    isDarkMode ? 'bg-[#202c33]/60 border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]'
                  }`}
                >
                  <p className={`text-xs ${textSecondary}`}>
                    বর্তমানে কোনো একাউন্ট লগইন করা নেই। রেজিস্ট্রেশন বা লগইন করলে এই নাম্বারের জন্য একটি মাত্র নির্দিষ্ট রোল নির্ধারিত থাকবে।
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login / Register</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-black/5 dark:border-white/10 shrink-0 space-y-2">
          {user ? (
            <>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                  onOpenAuth();
                }}
                className={`w-full py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'border-[#2f3b43] text-[#8696a0] hover:bg-white/5'
                    : 'border-[#d1d7db] text-[#54656f] hover:bg-black/5'
                }`}
                title="Switch to another role's phone number"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Switch Number / Role</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
