'use client';

import React from 'react';
import {
  LogIn,
  Zap,
  ShieldCheck,
  Award,
  Lock,
  Package,
} from 'lucide-react';
import { User } from '@/types/auth.types';

interface WelcomeScreenProps {
  isAuthenticated: boolean;
  user: User | null;
  activeRole: string | null;
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  onOpenSettings: () => void;
  onOpenOrders?: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

export function WelcomeScreen({
  isAuthenticated,
  user,
  activeRole,
  onOpenAuth,
  onOpenSettings,
  onOpenOrders,
  onLogout,
  isDarkMode,
}: WelcomeScreenProps) {
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto relative whatsapp-wallpaper"
      style={{
        backgroundColor: isDarkMode ? '#0b141a' : '#efeae2',
      }}
    >
      {/* WhatsApp Web Signature Bottom Green Accent Bar */}
      <div className="h-2 w-full bg-[#25D366] absolute bottom-0 left-0" />

      <div className="max-w-xl w-full text-center space-y-7 animate-in fade-in duration-300 relative z-10 py-6">
        {/* App Brand Header */}
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#075E54] via-[#008069] to-[#25D366] text-white flex items-center justify-center font-black text-3xl mx-auto shadow-2xl shadow-[#25D366]/40 ring-4 ring-[#25D366]/20">
            S
          </div>
          <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
            Welcome to <span className="text-[#008069] dark:text-[#25D366]">Super app</span>
          </h2>
          <p className={`text-sm md:text-base leading-relaxed max-w-md mx-auto ${textSecondary}`}>
            Your instant technician messaging and on-demand home service platform. Select any service from the left list to start live chatting with verified counselors.
          </p>
        </div>

        {/* Login & Registration Card */}
        <div
          className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xs ${
            isDarkMode ? 'bg-[#182229]/95 border-[#2f3b43]' : 'bg-white/95 border-[#e9edef]'
          }`}
        >
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#008069] text-white flex items-center justify-center text-lg font-bold shadow-md shadow-[#008069]/30">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <h4 className={`text-base font-bold ${textPrimary}`}>{user?.name}</h4>
                  <p className={`text-xs ${textSecondary}`}>{user?.mobileNumber}</p>
                  <span
                    className={`inline-block mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      isDarkMode
                        ? 'bg-[#005c4b] text-white'
                        : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30'
                    }`}
                  >
                    Role: {activeRole || 'CUSTOMER'}
                  </span>
                </div>
              </div>

              <p className={`text-xs ${textSecondary}`}>
                {activeRole === 'PROVIDER'
                  ? 'You are active as a Service Provider. Ready to manage service dispatches and job orders.'
                  : activeRole === 'COUNSELOR'
                  ? 'You are active as a Dedicated Counselor. Ready to consult incoming customer inquiries.'
                  : activeRole === 'TECHNICIAN'
                  ? 'You are active as a Field Technician. Ready for assigned repair tasks and customer location routing.'
                  : activeRole === 'ADMIN' || activeRole === 'MANAGER'
                  ? 'You are active with Administrative privileges for platform governance, audits and monitoring.'
                  : activeRole === 'SUPPORT'
                  ? 'You are active as Support Staff. Ready to resolve customer disputes and service questions.'
                  : 'You are logged in as a Customer and ready to consult counselors and book on-demand services.'}
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenOrders}
                  className="px-4 py-2 bg-[#008069] dark:bg-[#005c4b] hover:bg-[#00705c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={onOpenSettings}
                  className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-[#25D366]/20"
                >
                  Switch Role / Settings
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-xl transition-all hover:bg-rose-500/20 cursor-pointer"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className={`text-lg font-bold ${textPrimary}`}>Login or Register</h3>
                <p className={`text-xs ${textSecondary}`}>
                  Enter with your phone number to book verified technicians, chat with counselors, and track orders in real-time.
                </p>
              </div>

              {/* WhatsApp Brand Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onOpenAuth('LOGIN')}
                  className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#075E54] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login with Phone</span>
                </button>

                <button
                  onClick={() => onOpenAuth('REGISTER')}
                  className={`w-full sm:w-auto px-6 py-3 border font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isDarkMode
                      ? 'border-[#2f3b43] text-[#e9edef] hover:bg-white/5'
                      : 'border-[#d1d7db] text-[#111b21] hover:bg-[#f0f2f5]'
                  }`}
                >
                  <Zap className="w-4 h-4 text-[#25D366]" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex items-center justify-center gap-5 text-[11px] text-[#667781] dark:text-[#8696a0]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Verified Pros</span>
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>7-Day Warranty</span>
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Cash on Service</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-[#182229]/60 border-[#2f3b43]' : 'bg-white/80 border-[#e9edef]'
            }`}
          >
            <div className="text-xl mb-1.5">💬</div>
            <h4 className={`text-xs font-bold ${textPrimary}`}>1. Choose Service</h4>
            <p className={`text-[11px] mt-1 ${textSecondary}`}>
              Pick any service from the left list to open its chat window.
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-[#182229]/60 border-[#2f3b43]' : 'bg-white/80 border-[#e9edef]'
            }`}
          >
            <div className="text-xl mb-1.5">🛠️</div>
            <h4 className={`text-xs font-bold ${textPrimary}`}>2. Direct In-Chat Booking</h4>
            <p className={`text-[11px] mt-1 ${textSecondary}`}>
              Click [Book Service] to select Dhaka address and schedule dispatch.
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-[#182229]/60 border-[#2f3b43]' : 'bg-white/80 border-[#e9edef]'
            }`}
          >
            <div className="text-xl mb-1.5">📞</div>
            <h4 className={`text-xs font-bold ${textPrimary}`}>3. Live Consultation</h4>
            <p className={`text-[11px] mt-1 ${textSecondary}`}>
              Talk directly with technician counselors via audio or video call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
