'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth.types';
import { Sparkles, Phone, Lock, ArrowRight, ShieldCheck, Wrench, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'OTP' | 'TECHNICIAN'>('OTP');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const formatPhone = (phone: string) => {
    let clean = phone.trim();
    if (clean.startsWith('01')) {
      clean = `+88${clean}`;
    }
    return clean;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formatPhone(phoneNumber);
      const res = await authService.requestOtp({ phoneNumber: cleanPhone });
      setIsOtpSent(true);
      toast.success(res.message || 'OTP sent successfully!');
      if (res.code) {
        toast.info(`Dev OTP Code: ${res.code}`, { duration: 8000 });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formatPhone(phoneNumber);
      const res = await authService.verifyOtp({
        phoneNumber: cleanPhone,
        code: otpCode,
      });

      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success('Logged in successfully!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleTechnicianLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !password) {
      toast.error('Please enter phone number and password');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formatPhone(phoneNumber);
      const res = await authService.technicianLogin({
        phoneNumber: cleanPhone,
        password,
      });

      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success('Technician logged in successfully!');
      router.push('/provider/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Technician login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome to Master Services
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Access on-demand verified home & technical services
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('OTP');
              setIsOtpSent(false);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'OTP'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Customer / Provider (OTP)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('TECHNICIAN');
              setIsOtpSent(false);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'TECHNICIAN'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            🛠️ Technician (Direct)
          </button>
        </div>

        {/* Tab 1: OTP Login Flow */}
        {activeTab === 'OTP' && (
          <div>
            {!isOtpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="01700000000"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Change Phone
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white text-center"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5 text-center">
                    Sent to <span className="font-semibold">{phoneNumber}</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Technician Direct Password Login Flow */}
        {activeTab === 'TECHNICIAN' && (
          <form onSubmit={handleTechnicianLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Technician Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01700000000"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Technician Password (Default: 123456)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Technician Direct Login'}
              <Wrench className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
          🛡️ Protected by Master Escrow & 3-Day Free Warranty Guarantee
        </div>
      </div>
    </div>
  );
}
