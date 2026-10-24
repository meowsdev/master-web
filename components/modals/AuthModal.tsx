'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  Lock,
  User as UserIcon,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth.types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
  isDarkMode: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'LOGIN',
  isDarkMode,
}: AuthModalProps) {
  const { setAuth, setRole } = useAuthStore();
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'TECH'>(initialMode);
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'PROFILE'>('PHONE');

  // Form Inputs
  const [phone, setPhone] = useState('01711223344');
  const [otp, setOtp] = useState('');
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [techPassword, setTechPassword] = useState('123456');

  // Profile Setup Inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const inputBg = isDarkMode
    ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]'
    : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]';

  // 1. Request OTP via Backend
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.requestOtp({ phoneNumber: phone });
      if (res.code) {
        setServerCode(res.code);
        setOtp(res.code); // Auto-fill for convenience
      }
      toast.success(res.message || 'OTP sent successfully!');
      setStep('OTP');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ||
        'Failed to request OTP';
      toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP via Backend
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the verification code');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ phoneNumber: phone, code: otp });
      setAuth(res.user, res.accessToken, res.refreshToken);

      // Strict single role constraint: A mobile number cannot have more than one role.
      if (res.user.name) {
        setRole(res.user.role);
        if (authMode === 'REGISTER') {
          toast.info(
            `এই ফোন নাম্বারটি ইতিমধ্যে ${res.user.role} হিসেবে নিবন্ধিত। একই নাম্বারে একের বেশি রোল সম্ভব নয়।`,
          );
        } else {
          toast.success(`স্বাগতম, ${res.user.name}! (${res.user.role})`);
        }
        onClose();
      } else {
        // Brand new number: Proceed to complete profile and choose its single permanent role
        setStep('PROFILE');
        toast.info('নতুন একাউন্ট সম্পন্ন করতে নাম ও আপনার একমাত্র রোলটি নির্বাচন করুন।');
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ||
        'Verification failed. Invalid OTP.';
      toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Complete Profile & Assign Single Permanent Role
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await authService.completeProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        role: selectedRole,
      });

      setRole(updatedUser.role);
      toast.success(
        `${updatedUser.role} হিসেবে সফলভাবে নিবন্ধিত হয়েছেন! এই নাম্বারের জন্য রোলটি স্থায়ীভাবে নির্ধারিত হয়েছে।`,
      );
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ||
        'Failed to complete profile';
      toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Direct Technician Login with Password
  const handleTechnicianLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.technicianLogin({
        phoneNumber: phone,
        password: techPassword,
      });
      setAuth(res.user, res.accessToken, res.refreshToken);
      setRole(UserRole.TECHNICIAN);
      toast.success(`Technician logged in: ${res.user.name || res.user.mobileNumber}`);
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message ||
        'Invalid technician credentials';
      toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto ${
          isDarkMode ? 'bg-[#182229] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div>
            <h3 className={`text-lg font-bold ${textPrimary}`}>
              {step === 'PROFILE'
                ? 'Complete Profile & Select Role'
                : authMode === 'TECH'
                ? 'Technician Login'
                : authMode === 'LOGIN'
                ? 'Login to Super app'
                : 'Register Account'}
            </h3>
            <p className={`text-xs ${textSecondary}`}>
              {step === 'PROFILE'
                ? 'Choose your active role in the Super app ecosystem'
                : 'Directly integrated with database authentication'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch (only if not on profile completion step) */}
        {step !== 'PROFILE' && (
          <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-1 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setStep('PHONE');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                authMode === 'LOGIN'
                  ? 'bg-white dark:bg-[#202c33] text-[#008069] dark:text-[#25D366] shadow-xs'
                  : textSecondary
              }`}
            >
              Login (OTP)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('REGISTER');
                setStep('PHONE');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                authMode === 'REGISTER'
                  ? 'bg-white dark:bg-[#202c33] text-[#008069] dark:text-[#25D366] shadow-xs'
                  : textSecondary
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('TECH');
                setStep('PHONE');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                authMode === 'TECH'
                  ? 'bg-white dark:bg-[#202c33] text-[#008069] dark:text-[#25D366] shadow-xs'
                  : textSecondary
              }`}
            >
              Technician
            </button>
          </div>
        )}

        {/* STEP 1: Phone Entry */}
        {step === 'PHONE' && authMode !== 'TECH' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${textPrimary}`}>Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-[#54656f] dark:text-[#8696a0]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX or +88017XXXXXXXX"
                  required
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none ${inputBg} focus:ring-2 focus:ring-[#25D366]`}
                />
              </div>
              <p className={`text-[11px] ${textSecondary}`}>
                Enter any Bangladeshi mobile number (e.g. 01711223344)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
            </button>
          </form>
        )}

        {/* STEP 1 (TECH): Technician Password Login */}
        {step === 'PHONE' && authMode === 'TECH' && (
          <form onSubmit={handleTechnicianLogin} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${textPrimary}`}>Technician Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-[#54656f] dark:text-[#8696a0]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  required
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none ${inputBg} focus:ring-2 focus:ring-[#25D366]`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${textPrimary}`}>Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#54656f] dark:text-[#8696a0]" />
                <input
                  type="password"
                  value={techPassword}
                  onChange={(e) => setTechPassword(e.target.value)}
                  placeholder="Password (default: 123456)"
                  required
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none ${inputBg} focus:ring-2 focus:ring-[#25D366]`}
                />
              </div>
              <p className={`text-[11px] ${textSecondary}`}>Default technician password: 123456</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Logging in...' : 'Login as Technician'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold ${textPrimary}`}>Enter Verification Code</label>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-xs text-[#008069] dark:text-[#25D366] hover:underline cursor-pointer"
                >
                  Change Phone
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#54656f] dark:text-[#8696a0]" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  autoFocus
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none tracking-widest font-mono ${inputBg} focus:ring-2 focus:ring-[#25D366]`}
                />
              </div>

              {serverCode && (
                <div
                  onClick={() => setOtp(serverCode)}
                  className="p-2 rounded-lg bg-[#d9fdd3] dark:bg-[#005c4b]/40 text-[#008069] dark:text-[#25D366] text-xs font-medium flex items-center justify-between cursor-pointer border border-[#25D366]/30"
                  title="Click to auto-fill"
                >
                  <span>Backend Code: <strong>{serverCode}</strong></span>
                  <span className="text-[11px] underline">Auto-fill</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
            </button>
          </form>
        )}

        {/* STEP 3: Profile Setup & Role Selection */}
        {step === 'PROFILE' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${textPrimary}`}>Full Name *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-[#54656f] dark:text-[#8696a0]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alif Khan"
                  required
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none ${inputBg} focus:ring-2 focus:ring-[#25D366]`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-bold ${textPrimary}`}>Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#54656f] dark:text-[#8696a0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alif@example.com"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none ${inputBg} focus:ring-2 focus:ring-[#25D366]`}
                />
              </div>
            </div>

            {/* Single Role Policy Notice */}
            <div
              className={`p-2.5 rounded-xl border text-[11px] leading-relaxed space-y-1 ${
                isDarkMode ? 'bg-[#202c33]/70 border-[#2f3b43] text-[#8696a0]' : 'bg-[#f0f2f5] border-[#e9edef] text-[#667781]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span>এক নাম্বারে একটি মাত্র রোল নির্ধারিত নীতি</span>
              </div>
              <p className="text-[10px]">
                নির্বাচিত রোলটি এই ফোন নাম্বারের জন্য স্থায়ী হবে। পরবর্তীতে এই নাম্বারে অন্য কোনো রোল পরিবর্তন করা যাবে না।
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className={`text-xs font-bold ${textPrimary}`}>Select Primary Role *</label>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {[
                  { role: UserRole.CUSTOMER, label: 'Customer', desc: 'Book on-demand services' },
                  { role: UserRole.PROVIDER, label: 'Provider', desc: 'Accept job dispatches' },
                  { role: UserRole.COUNSELOR, label: 'Counselor', desc: 'Advise customer inquiries' },
                  { role: UserRole.TECHNICIAN, label: 'Technician', desc: 'Repair & maintenance' },
                  { role: UserRole.ADMIN, label: 'Admin', desc: 'Platform governance' },
                  { role: UserRole.MANAGER, label: 'Manager', desc: 'Operations oversight' },
                  { role: UserRole.SUPPORT, label: 'Support', desc: 'Customer help desk' },
                ].map(({ role, label, desc }) => {
                  const isSelected = selectedRole === role;
                  return (
                    <div
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#25D366] bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366]'
                          : `border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 ${textSecondary}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-inherit">{label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <p className="text-[10px] opacity-75 mt-0.5 leading-tight">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !fullName.trim()}
              className="w-full py-3 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete & Enter Super app'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
