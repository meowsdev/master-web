'use client';

import React, { useState } from 'react';
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
import { CreateAccountForm, ProfileDraft } from '@/components/modals/auth/CreateAccountForm';
import { LoginOtpForm } from '@/components/modals/auth/LoginOtpForm';
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
  const { setAuth, setRole, setUser } = useAuthStore();
  // Set right after OTP for a number with no profile yet: the optional "Edit Account" step.
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const isProfileStep = profileUser !== null;
  const [isTechLogin, setIsTechLogin] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [techPassword, setTechPassword] = useState('123456');

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTechLoggingIn, setIsTechLoggingIn] = useState(false);
  const otpCooldown = useOtpCooldown(formatPhoneNumber(phone));

  // After a finished login/sign-up: close the panel and go back to the page the
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

  const requestOtp = async () => {
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
        setOtp(res.code); // dev convenience: the backend only returns it outside production
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

  // Verify only on the Verify press, never while typing. The backend sets the
  // httpOnly session cookies (1-year refresh), so a returning browser never sees this panel again.
  const verifyOtpCode = async (code: string) => {
    if (isVerifyingOtp) return;
    setIsVerifyingOtp(true);
    try {
      const res = await authService.verifyOtp({ phoneNumber: phone, code });
      // The verified number alone is a full identity: log in right away.
      setAuth(res.user);
      setRole(res.user.role);
      setPhone(res.user.mobileNumber);

      const hasProfile = Boolean(res.user.name && res.user.username);
      if (hasProfile) {
        toast.success(`স্বাগতম, ${res.user.name}!`);
        finishAndRedirect();
        return;
      }
      // First visit: offer the profile form, but it is optional and can be closed.
      setProfileUser(res.user);
      toast.success('লগইন সফল হয়েছে। চাইলে প্রোফাইল পূরণ করতে পারেন।');
    } catch (err: unknown) {
      toast.error(parseOtpError(err).message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Profile step (validated by the backend: unique username, real district/upazila pair)
  const handleSave = async (profile: ProfileDraft) => {
    if (!profileUser) return;
    setIsSaving(true);
    try {
      const updatedUser = await authService.completeProfile({
        ...profile,
        profilePhoto: photoUrl ?? undefined,
        // A role is only chosen when the account is first created.
        ...(profileUser.name ? {} : { role: UserRole.CUSTOMER }),
      });
      setUser(updatedUser);
      toast.success('প্রোফাইল সংরক্ষণ হয়েছে!');
      finishAndRedirect();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to complete profile'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTechnicianLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTechLoggingIn(true);
    try {
      const res = await authService.technicianLogin({ phoneNumber: phone, password: techPassword });
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

  const title = isProfileStep ? 'Edit Account' : isTechLogin ? 'Technician Login' : 'Login';

  return (
    // The profile step is optional: closing it keeps the phone-number login.
    <AuthDrawerShell
      title={title}
      onClose={isProfileStep ? finishAndRedirect : onClose}
      avatar={isProfileStep ? <AvatarPicker photoUrl={photoUrl} onChange={setPhotoUrl} /> : undefined}
    >
      {isProfileStep ? (
        <CreateAccountForm
          phone={phone}
          initialValues={{
            fullName: profileUser.name ?? '',
            username: profileUser.username ?? '',
            districtId: profileUser.districtId ?? null,
            upazilaId: profileUser.upazilaId ?? null,
          }}
          hasExtraChanges={photoUrl !== null}
          isSaving={isSaving}
          onSave={(profile) => void handleSave(profile)}
        />
      ) : isTechLogin ? (
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
        <LoginOtpForm
          phone={phone}
          onPhoneChange={handlePhoneChange}
          onTechnicianLogin={() => setIsTechLogin(true)}
          otp={{
            value: otp,
            onChange: setOtp,
            canEnter: isOtpSent || otpCooldown.isCoolingDown,
            isSending: isSendingOtp,
            isVerifying: isVerifyingOtp,
            secondsLeft: otpCooldown.secondsLeft,
            onSend: () => void requestOtp(),
            onVerify: () => void verifyOtpCode(otp),
            serverCode,
            onUseServerCode: () => serverCode && setOtp(serverCode),
          }}
        />
      )}
    </AuthDrawerShell>
  );
}
