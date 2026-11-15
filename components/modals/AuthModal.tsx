'use client';

import React, { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService, formatPhoneNumber } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { User, UserRole } from '@/types/auth.types';
import { useOtpCooldown } from '@/hooks/useOtpCooldown';
import { parseOtpError } from '@/lib/otp-errors';
import { getPostAuthRedirectPath } from '@/lib/safe-redirect';
import { AuthDrawerShell, AuthPrimaryButton, authLinkClass } from '@/components/modals/auth/AuthDrawerShell';
import { AuthField } from '@/components/modals/auth/AuthField';
import { PhoneNumberField } from '@/components/modals/auth/PhoneNumberField';
import { CreateAccountForm, ProfileDraft, ProfileInitialValues } from '@/components/modals/auth/CreateAccountForm';
import { AvatarPicker } from '@/components/modals/auth/AvatarPicker';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
  isDarkMode: boolean;
}

const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (!message) return fallback;
  return Array.isArray(message) ? message[0] : message;
};

/*
 * The drawer lives in its own component so every open starts from a clean
 * slate: no phone number, OTP state or profile left behind by whoever used the
 * panel before (a previous user must never be visible to the next one).
 */
export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;
  return <AuthDrawer onClose={onClose} />;
}

function AuthDrawer({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { setAuth, setRole, setUser, setPendingRegistration, pendingRegistrationUser } = useAuthStore();
  // A number that already passed OTP but never finished sign-up (e.g. the page was reloaded).
  const isSignUpPending = pendingRegistrationUser !== null;
  const [isTechLogin, setIsTechLogin] = useState(false);
  // Set once an already-registered number is verified: their details fill this same form in place.
  const [returningUser, setReturningUser] = useState<User | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [phone, setPhone] = useState(pendingRegistrationUser?.mobileNumber ?? '');
  const [otp, setOtp] = useState('');
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [techPassword, setTechPassword] = useState('123456');

  // OTP progress: Save stays disabled until the code has been verified.
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(isSignUpPending);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTechLoggingIn, setIsTechLoggingIn] = useState(false);
  const otpCooldown = useOtpCooldown(formatPhoneNumber(phone));

  const prefill = useMemo<ProfileInitialValues | null>(
    () =>
      returningUser && {
        fullName: returningUser.name ?? '',
        username: returningUser.username ?? '',
        districtId: returningUser.districtId ?? null,
        upazilaId: returningUser.upazilaId ?? null,
      },
    [returningUser],
  );

  // After a finished sign-up/login: close the panel and go back to the page the
  // visitor came from (`?next=`), or home.
  const finishAndRedirect = () => {
    onClose();
    router.replace(getPostAuthRedirectPath());
  };

  // Changing the number invalidates any code sent to the previous one.
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setOtp('');
    setServerCode(null);
    setIsOtpSent(false);
  };

  // 1. Request OTP via Backend
  const requestOtp = async () => {
    // Guard against double clicks while a request is open.
    if (isSendingOtp) return;
    if (!phone.trim()) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await authService.requestOtp({ phoneNumber: phone });
      otpCooldown.startCooldown(res.retryAfterSeconds);
      if (res.code) {
        setServerCode(res.code);
        setOtp(res.code); // Auto-fill for convenience
      }
      toast.success(res.message || 'OTP sent successfully!');
      setIsOtpSent(true);
    } catch (err: unknown) {
      const parsed = parseOtpError(err);
      // Resync the countdown to the server's truth (e.g. after a page refresh).
      if (parsed.kind === 'COOLDOWN' && parsed.retryAfterSeconds !== undefined) {
        otpCooldown.startCooldown(parsed.retryAfterSeconds);
        setIsOtpSent(true);
      }
      toast.error(parsed.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify OTP via Backend (only when the user presses Verify, never on typing)
  const verifyOtpCode = async (code: string) => {
    if (isVerifyingOtp || isOtpVerified) return;
    setIsVerifyingOtp(true);
    try {
      const res = await authService.verifyOtp({ phoneNumber: phone, code });
      // Tokens arrive as httpOnly cookies; only the user object is kept in JS.

      setIsOtpVerified(true); // phone is now a locked, verified identity in both branches below

      // Strict single role constraint: A mobile number cannot have more than one role.
      if (res.user.name) {
        setAuth(res.user);
        setRole(res.user.role);
        toast.success(`স্বাগতম, ${res.user.name}! (${res.user.role})`);
        // Already registered: their saved details fill this same panel in place.
        setPhotoUrl(res.user.profilePhoto ?? null);
        setReturningUser(res.user);
      } else {
        // Brand new number: NOT logged in yet. The app stays in guest mode and this
        // panel can't be closed until the profile is saved.
        setPendingRegistration(res.user);
        toast.info('নম্বর যাচাই হয়েছে। বাকি তথ্য পূরণ করে Save করুন।');
      }
    } catch (err: unknown) {
      toast.error(parseOtpError(err).message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 3. Complete Profile (validated by the backend: unique username, real district/upazila pair)
  const handleSave = async (profile: ProfileDraft) => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.completeProfile({
        ...profile,
        profilePhoto: photoUrl ?? undefined,
        // A role is only chosen when the account is first created.
        ...(returningUser ? {} : { role: UserRole.CUSTOMER }),
      });

      if (returningUser) {
        setUser(updatedUser);
        toast.success('Profile updated successfully! ✨');
      } else {
        setAuth(updatedUser);
        setRole(updatedUser.role);
        toast.success('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
      }
      finishAndRedirect();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to complete profile'));
    } finally {
      setIsSaving(false);
    }
  };

  // Direct Technician Login with Password
  const handleTechnicianLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTechLoggingIn(true);
    try {
      const res = await authService.technicianLogin({
        phoneNumber: phone,
        password: techPassword,
      });
      setAuth(res.user, res.accessToken, res.refreshToken);
      setRole(UserRole.TECHNICIAN);
      toast.success(`Technician logged in: ${res.user.name || res.user.mobileNumber}`);
      finishAndRedirect();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Invalid technician credentials'));
    } finally {
      setIsTechLoggingIn(false);
    }
  };

  return (
    // No close button while a verified number is still unregistered: Save is the only way out.
    <AuthDrawerShell
      title={isTechLogin ? 'Technician Login' : returningUser ? 'Edit Profile' : 'Create Account'}
      onClose={isSignUpPending ? undefined : returningUser ? finishAndRedirect : onClose}
      blockOutside={isSignUpPending}
      avatar={isTechLogin ? undefined : <AvatarPicker photoUrl={photoUrl} onChange={setPhotoUrl} />}
    >
      {isTechLogin ? (
        <form onSubmit={handleTechnicianLogin} className="flex w-full flex-col items-center gap-[48px]">
          <PhoneNumberField value={phone} onChange={setPhone} />
          <div className="w-full space-y-[8px]">
            <AuthField
              icon={Lock}
              type="password"
              value={techPassword}
              onChange={(e) => setTechPassword(e.target.value)}
              placeholder="Password (default: 123456)"
              required
            />
            <p className="pl-[36px] text-[12px] font-medium text-[#697586]">Default technician password: 123456</p>
          </div>
          <AuthPrimaryButton disabled={isTechLoggingIn}>
            {isTechLoggingIn ? 'Logging in...' : 'Login as Technician'}
          </AuthPrimaryButton>
          <button type="button" onClick={() => setIsTechLogin(false)} className={authLinkClass}>
            ← Back to Phone OTP Login
          </button>
        </form>
      ) : (
        <CreateAccountForm
          mode="create"
          phone={phone}
          onPhoneChange={handlePhoneChange}
          prefill={prefill}
          hasExtraChanges={photoUrl !== (returningUser?.profilePhoto ?? null)}
          otp={{
            value: otp,
            onChange: setOtp,
            canEnter: isOtpSent || otpCooldown.isCoolingDown,
            isVerified: isOtpVerified,
            isSending: isSendingOtp,
            isVerifying: isVerifyingOtp,
            secondsLeft: otpCooldown.secondsLeft,
            onSend: () => void requestOtp(),
            onVerify: () => void verifyOtpCode(otp),
            serverCode,
            onUseServerCode: () => serverCode && setOtp(serverCode),
          }}
          isSaving={isSaving}
          onSave={(profile) => void handleSave(profile)}
          onTechnicianLogin={isSignUpPending || returningUser ? undefined : () => setIsTechLogin(true)}
        />
      )}
    </AuthDrawerShell>
  );
}
