'use client';

import React from 'react';
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
  Pencil,
  LucideIcon,
  Package,
  ChevronRight,
} from 'lucide-react';
import { UserRole, User } from '@/types/auth.types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  user: User | null;
  activeRole: string | null;
  onSwitchRole?: (role: UserRole) => void;
  onOpenAuth: () => void;
  onOpenEditProfile?: () => void;
  onOpenOrders?: () => void;
  onOpenSkillsModal?: () => void;
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
  onOpenEditProfile,
  onOpenOrders,
  onOpenSkillsModal,
  onLogout,
}: SettingsDrawerProps) {
  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  // Role details metadata
  const roleMeta: Record<string, { label: string; desc: string; icon: LucideIcon }> = {
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
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close Settings" />

      {/* Slide-in Drawer Container */}
      <div
        className={`relative z-10 w-full max-w-sm h-full shadow-2xl border-l flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 ${
          isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
        }`}
      >
        {/* Top Header (Pinned) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 shrink-0">
          <h3 className={`text-lg font-bold ${textPrimary}`}>Settings & Account</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} cursor-pointer transition-colors`}
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
          {/* User Profile Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#008069] text-white flex items-center justify-center text-xl font-bold border-2 border-[#25D366] shrink-0">
                  {user?.profilePhoto ? (
                    <Image src={user.profilePhoto} alt="User" width={56} height={56} unoptimized className="object-cover w-full h-full" />
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

              {user && onOpenEditProfile && (
                <button
                  onClick={onOpenEditProfile}
                  className="px-2.5 py-1.5 rounded-xl bg-[#008069]/10 hover:bg-[#008069]/20 text-[#008069] dark:text-[#25D366] text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  title="Edit Profile"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
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

              {/* My Orders & History link */}
              <div
                onClick={() => {
                  onClose();
                  onOpenOrders?.();
                }}
                className="p-3 rounded-2xl flex items-center justify-between border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-black/5 dark:border-white/10"
              >
                <div className="flex items-center gap-2.5 text-sm">
                  <Package className="w-4 h-4 text-[#008069] dark:text-[#25D366]" />
                  <span className={textPrimary}>My Orders & History</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
              </div>
            </div>

            {/* Assigned Permanent Role Card (Single Role Policy) */}
            <div className="pt-2 space-y-2">
              <label className={`text-xs font-bold ${textSecondary}`}>
                Assigned Account Role
              </label>

              {user ? (
                <div
                  className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#202c33]/60 border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]'
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
                    className={`p-2.5 rounded-xl border text-[11px] leading-relaxed space-y-1 ${isDarkMode
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

                  {currentRole === UserRole.PROVIDER && onOpenSkillsModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenSkillsModal();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#008069]/10 hover:bg-[#008069]/20 text-[#008069] dark:text-[#25D366] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#008069]/25 shadow-2xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Manage My Service Skills (স্কিল নির্বাচন)</span>
                    </button>
                  )}
                </div>

              ) : (
                <div
                  className={`p-3.5 rounded-2xl border text-center space-y-2.5 ${isDarkMode ? 'bg-[#202c33]/60 border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]'
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

        {/* Bottom Actions (Pinned) */}
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/10 shrink-0 space-y-2">
          {user ? (
            <>


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
