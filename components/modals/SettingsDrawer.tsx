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
  LogOut,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
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
  onSwitchRole: (role: UserRole) => void;
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
  onSwitchRole,
  onOpenAuth,
  onLogout,
}: SettingsDrawerProps) {
  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm h-full shadow-2xl border-l flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200 ${
          isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
            <h3 className={`text-lg font-bold ${textPrimary}`}>Settings & Profile</h3>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} cursor-pointer`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="py-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[#008069] text-white flex items-center justify-center text-xl font-bold border-2 border-[#25D366]">
                {user?.profilePhoto ? (
                  <Image src={user.profilePhoto} alt="User" width={56} height={56} className="object-cover" />
                ) : (
                  <span>{user?.name ? user.name[0].toUpperCase() : 'G'}</span>
                )}
              </div>
              <div>
                <h4 className={`text-base font-bold ${textPrimary}`}>
                  {user?.name || 'Guest User'}
                </h4>
                <p className={`text-xs ${textSecondary}`}>
                  {user?.mobileNumber || 'Not logged in'}
                </p>
                <span className="inline-block mt-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#e7fce3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366]">
                  Active Role: {activeRole || 'CUSTOMER'}
                </span>
              </div>
            </div>

            {/* Quick Preferences */}
            <div className="space-y-2 pt-2">
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

            {/* Role Switcher */}
            <div className="pt-3 space-y-2">
              <label className={`text-xs font-bold ${textSecondary}`}>Switch Active Role (Unified UI)</label>
              <div className="space-y-1.5">
                {[
                  { role: UserRole.CUSTOMER, label: 'Customer (Browse & Book)', icon: UserCheck },
                  { role: UserRole.COUNSELOR, label: 'Counselor (Inquiries & Advice)', icon: ShieldCheck },
                  { role: UserRole.PROVIDER, label: 'Provider (Jobs & Dispatches)', icon: Briefcase },
                ].map(({ role, label, icon: Icon }) => (
                  <button
                    key={role}
                    onClick={() => {
                      onSwitchRole(role);
                      toast.success(`Role switched to ${role}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeRole === role
                        ? 'border-[#25D366] bg-[#e7fce3] dark:bg-[#005c4b]/40 text-[#008069] dark:text-[#25D366]'
                        : `border-black/5 dark:border-white/10 ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-black/5 dark:border-white/10">
          {user ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
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
