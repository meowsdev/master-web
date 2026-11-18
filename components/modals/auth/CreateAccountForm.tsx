'use client';

import { useState } from 'react';
import { AtSign, BadgeCheck, Check, CheckCircle2, Loader2, MapPin, User as UserIcon, XCircle } from 'lucide-react';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { useUsernameAvailability, UsernameStatus } from '@/hooks/useUsernameAvailability';
import { AuthField } from './AuthField';
import { PhoneNumberField } from './PhoneNumberField';
import { LocationSelect } from './LocationSelect';

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

interface CreateAccountFormProps {
  phone: string;
  initialValues?: ProfileInitialValues;
  /**
   * Fills the fields of an already-open form, e.g. when a registered number is
   * verified. The form stays mounted, so nothing flickers or resets.
   */
  prefill?: ProfileInitialValues | null;
  isSaving: boolean;
  onSave: (profile: ProfileDraft) => void;
  /** Changes made outside the form (e.g. the profile photo) that should enable Save. */
  hasExtraChanges?: boolean;
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
  phone,
  initialValues,
  prefill = null,
  isSaving,
  onSave,
  hasExtraChanges = false,
}: CreateAccountFormProps) {
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

  // The number was already verified by OTP before this form opens.
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
        onChange={() => undefined}
        readOnly
        trailing={<Check className="size-[24px] shrink-0 text-[#1daa61]" strokeWidth={1.5} />}
      />

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

    </form>
  );
}
