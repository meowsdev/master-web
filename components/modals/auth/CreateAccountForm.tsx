'use client';

import { useState } from 'react';
import { AtSign, BadgeCheck, Check, CheckCircle2, Loader2, MapPin, User as UserIcon, XCircle } from 'lucide-react';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { useUsernameAvailability, UsernameStatus } from '@/hooks/useUsernameAvailability';
import { formatCountdown, OTP_LENGTH } from '@/lib/otp-errors';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { AuthField } from './AuthField';
import { PhoneNumberField } from './PhoneNumberField';
import { LocationSelect } from './LocationSelect';
import { OtpCodeBoxes } from './OtpCodeBoxes';

export interface ProfileDraft {
  fullName: string;
  username: string;
  /** Optional: both set, or both null. */
  districtId: number | null;
  upazilaId: number | null;
}

/** Values the form starts from when an existing account is being edited. */
export interface ProfileInitialValues {
  fullName: string;
  username: string;
  districtId: number | null;
  upazilaId: number | null;
}

/** Everything the OTP row needs. Only the "create" form has one. */
export interface OtpControls {
  value: string;
  onChange: (value: string) => void;
  /** Boxes accept input only after a code was sent to this number. */
  canEnter: boolean;
  isVerified: boolean;
  isSending: boolean;
  isVerifying: boolean;
  secondsLeft: number;
  onSend: () => void;
  /** Runs only when the user presses Verify (or Enter); typing the code never submits it. */
  onVerify: () => void;
  serverCode: string | null;
  onUseServerCode: () => void;
}

interface CreateAccountFormProps {
  /** "create": join with a phone + OTP. "edit": same layout for the signed-in user. */
  mode: 'create' | 'edit';
  phone: string;
  /** Create mode only; in edit mode the number is a permanent, verified identity. */
  onPhoneChange?: (value: string) => void;
  initialValues?: ProfileInitialValues;
  /**
   * Fills the fields of an already-open form, e.g. when a registered number is
   * verified. The form stays mounted, so nothing flickers or resets.
   */
  prefill?: ProfileInitialValues | null;
  otp?: OtpControls;
  isSaving: boolean;
  onSave: (profile: ProfileDraft) => void;
  /** Changes made outside the form (e.g. the profile photo) that should enable Save. */
  hasExtraChanges?: boolean;
  onTechnicianLogin?: () => void;
}

const USERNAME_HINTS: Partial<Record<UsernameStatus, string>> = {
  invalid: '3-20 characters: lowercase letters, digits or _',
  taken: 'This username is already taken',
};

function UsernameStatusIcon({ status }: { status: UsernameStatus }) {
  if (status === 'checking') return <Loader2 className="size-[24px] shrink-0 animate-spin text-[#697586]" />;
  if (status === 'available') return <CheckCircle2 className="size-[24px] shrink-0 text-[#1daa61]" strokeWidth={1.5} />;
  if (status === 'taken' || status === 'invalid') {
    return <XCircle className="size-[24px] shrink-0 text-[#d64545]" strokeWidth={1.5} />;
  }
  return null;
}

const primaryButtonClass =
  'cursor-pointer rounded-[12px] bg-[#1daa61] px-[16px] py-[8px] text-[20px] font-semibold tracking-[-0.4px] text-white transition-opacity hover:bg-[#189452] disabled:cursor-not-allowed disabled:bg-[#1daa61]/50';

/*
 * The single "Create Account" form from Figma, reused for editing a profile so
 * both look and behave the same. The server decides what is valid (unique
 * username, real district/upazila pair); this form only gates Save.
 */
export function CreateAccountForm({
  mode,
  phone,
  onPhoneChange,
  initialValues,
  prefill = null,
  otp,
  isSaving,
  onSave,
  hasExtraChanges = false,
  onTechnicianLogin,
}: CreateAccountFormProps) {
  const isEdit = mode === 'edit';
  const [fullName, setFullName] = useState(initialValues?.fullName ?? '');
  const [username, setUsername] = useState(initialValues?.username ?? '');
  const [districtId, setDistrictId] = useState<number | null>(initialValues?.districtId ?? null);
  const [upazilaId, setUpazilaId] = useState<number | null>(initialValues?.upazilaId ?? null);

  // Adopt a prefill the moment it arrives (state derived during render, the React-endorsed
  // way to reset fields from a prop without an effect or a remount).
  const [appliedPrefill, setAppliedPrefill] = useState<ProfileInitialValues | null>(null);
  if (prefill && prefill !== appliedPrefill) {
    setAppliedPrefill(prefill);
    setFullName(prefill.fullName);
    setUsername(prefill.username);
    setDistrictId(prefill.districtId);
    setUpazilaId(prefill.upazilaId);
  }

  // What the saved profile currently says: changes are measured against it.
  const baseline = initialValues ?? appliedPrefill;

  const usernameStatus = useUsernameAvailability(username, baseline?.username);
  const { districts, upazilas, isLoadingUpazilas } = useLocationOptions(districtId);

  const isPhoneVerified = isEdit || Boolean(otp?.isVerified);
  const isPhoneValid = isPhoneVerified || (phone !== '' && isValidPhoneNumber(phone));
  // The OTP button is "Send OTP" until a code is on its way, then "Verify".
  const isCodeSent = Boolean(otp?.canEnter);
  const canSendOtp = Boolean(otp) && isPhoneValid && !otp?.isSending && otp?.secondsLeft === 0;
  const canVerify = Boolean(otp) && otp?.value.length === OTP_LENGTH && !otp?.isVerifying;
  const canResend = Boolean(otp) && canSendOtp;

  // An existing profile (edit mode, or a verified registered number) saves only when something changed.
  const hasChanges =
    baseline === null ||
    hasExtraChanges ||
    fullName.trim() !== baseline.fullName ||
    username.trim().toLowerCase() !== baseline.username ||
    districtId !== baseline.districtId ||
    upazilaId !== baseline.upazilaId;

  // Location is optional, but a district without an upazila (or vice versa) is half a place.
  const isLocationComplete = (districtId === null) === (upazilaId === null);

  const canSave =
    isPhoneVerified &&
    hasChanges &&
    !isSaving &&
    fullName.trim().length > 0 &&
    usernameStatus === 'available' &&
    isLocationComplete;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    onSave({
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      districtId,
      upazilaId,
    });
  };

  const handleDistrictChange = (id: number | null) => {
    setDistrictId(id);
    setUpazilaId(null); // an upazila only makes sense inside its own district
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-[48px]">
      <AuthField
        icon={UserIcon}
        type="text"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Full name"
        maxLength={100}
      />

      <div className="w-full space-y-[6px]">
        <AuthField
          icon={AtSign}
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
          placeholder="Username"
          maxLength={20}
          autoCapitalize="none"
          trailing={<UsernameStatusIcon status={usernameStatus} />}
        />
        {USERNAME_HINTS[usernameStatus] && (
          <p className="pl-[36px] text-[12px] font-medium text-[#d64545]">{USERNAME_HINTS[usernameStatus]}</p>
        )}
      </div>

      <PhoneNumberField
        value={phone}
        onChange={(value) => onPhoneChange?.(value)}
        readOnly={isPhoneVerified}
        trailing={isPhoneVerified ? <Check className="size-[24px] shrink-0 text-[#1daa61]" strokeWidth={1.5} /> : null}
      />

      {otp && !isEdit && (
        <div className="w-full space-y-[12px]">
          {/* On a phone the timer + button no longer fit beside six boxes, so they wrap below. */}
          <div className="flex w-full flex-wrap items-center justify-between gap-x-[12px] gap-y-[12px]">
            <OtpCodeBoxes
              value={otp.value}
              onChange={otp.onChange}
              disabled={!otp.canEnter || otp.isVerified}
              onEnter={() => canVerify && otp.onVerify()}
            />
            <div className="ml-auto flex items-center gap-[12px]">
            <span className="text-[18px] tracking-[-0.36px] text-[#697586]" aria-live="polite">
              {formatCountdown(otp.isVerified ? 0 : otp.secondsLeft).replace(':', '.')}
            </span>
            {otp.isVerified ? (
              <button type="button" disabled className={`whitespace-nowrap ${primaryButtonClass}`}>
                Verified
              </button>
            ) : isCodeSent ? (
              <button
                type="button"
                onClick={otp.onVerify}
                disabled={!canVerify}
                className={`whitespace-nowrap ${primaryButtonClass}`}
              >
                {otp.isVerifying ? 'Verifying...' : 'Verify'}
              </button>
            ) : (
              <button
                type="button"
                onClick={otp.onSend}
                disabled={!canSendOtp}
                className={`whitespace-nowrap ${primaryButtonClass}`}
              >
                {otp.isSending ? 'Sending...' : 'Send OTP'}
              </button>
            )}
            </div>
          </div>

          {isCodeSent && !otp.isVerified && (
            <button
              type="button"
              onClick={otp.onSend}
              disabled={!canResend}
              className="cursor-pointer text-[14px] font-semibold text-[#1daa61] hover:underline disabled:cursor-not-allowed disabled:text-[#697586] disabled:no-underline"
            >
              {otp.isSending ? 'Sending...' : 'Resend OTP'}
              {otp.secondsLeft > 0 && ` in ${formatCountdown(otp.secondsLeft)}`}
            </button>
          )}

          {otp.serverCode && !otp.isVerified && (
            <div
              onClick={otp.onUseServerCode}
              className="flex w-full cursor-pointer items-center justify-between rounded-[12px] border border-[#bccdba] bg-[#d7fdd2] p-[10px] text-[14px] font-medium text-[#205737]"
              title="Click to auto-fill"
            >
              <span>
                Backend Code: <strong>{otp.serverCode}</strong>
              </span>
              <span className="text-[12px] underline">Auto-fill</span>
            </div>
          )}
        </div>
      )}

      <LocationSelect
        icon={BadgeCheck}
        placeholder="জেলা"
        options={districts.map((district) => ({ id: district.id, label: district.bnName }))}
        value={districtId}
        onChange={handleDistrictChange}
      />

      <LocationSelect
        icon={MapPin}
        placeholder={isLoadingUpazilas ? 'লোড হচ্ছে...' : 'উপজেলা'}
        options={upazilas.map((upazila) => ({ id: upazila.id, label: upazila.bnName }))}
        value={upazilaId}
        onChange={setUpazilaId}
        disabled={districtId === null}
      />

      <button type="submit" disabled={!canSave} className={primaryButtonClass}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>

      {onTechnicianLogin && !isEdit && (
        <button
          type="button"
          onClick={onTechnicianLogin}
          className="cursor-pointer text-[14px] font-semibold text-[#1daa61] hover:underline"
        >
          Technician with password? Click here →
        </button>
      )}
    </form>
  );
}
