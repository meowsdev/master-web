'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CameraAdd01Icon } from '@hugeicons/core-free-icons';
import { AtSign, BadgeCheck, Camera, Check, Home, MapPin, User as UserIcon } from 'lucide-react';
import { formatTaka } from '@/components/modals/place-order/format-taka';
import { AuthField } from '@/components/modals/auth/AuthField';
import { PhoneNumberField } from '@/components/modals/auth/PhoneNumberField';
import { useMyReviews } from '@/components/super-app/reviews/MyRatingButton';
import { ReviewList } from '@/components/super-app/reviews/ReviewList';
import { useLocationOptions } from '@/hooks/useLocationOptions';
import { User, UserRole } from '@/types/auth.types';

/** Staff accounts have no orders or reviews, so their profile shows only the details. */
const ROLES_WITH_STATS: string[] = [UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.TECHNICIAN];

/*
 * The 120px circle of the edit form: the photo, or the same grey camera circle. With onPick, hovering shows a
 * camera + mark (always shown on touch screens); pressing it opens the gallery / file chooser, and the chosen
 * picture is handed to onPick to upload and save straight away.
 */
export function ProfilePhoto({ photoUrl, onPick, isUploading = false }: { photoUrl: string | null; onPick?: (file: File) => void; isUploading?: boolean }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const picture = photoUrl ? (
    <Image src={photoUrl} alt="Profile photo" width={120} height={120} unoptimized className="size-full object-cover" />
  ) : (
    <Camera className="size-[40px] text-ink" strokeWidth={1.5} />
  );

  if (!onPick) {
    return <div className="flex size-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface">{picture}</div>;
  }

  return (
    <>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInput.current?.click()}
        aria-label="Change profile photo"
        className="group relative flex size-[120px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface disabled:cursor-wait"
      >
        {picture}
        <span
          className={`absolute inset-0 flex items-center justify-center bg-ink/45 text-white transition-opacity ${
            isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100 pointer-coarse:bg-ink/25'
          }`}
        >
          {isUploading ? <span className="text-[13px] font-semibold">Uploading...</span> : <HugeiconsIcon icon={CameraAdd01Icon} size={34} strokeWidth={1.8} />}
        </span>
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onPick(file);
        }}
      />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-[4px] rounded-[12px] bg-surface px-[8px] py-[14px] text-center">
      <span className="text-[20px] font-semibold tracking-[-0.4px] text-ink">{value}</span>
      <span className="text-[12px] font-medium text-muted">{label}</span>
    </div>
  );
}

/*
 * The signed-in person's profile, read-only: the same fields as Edit Profile (so nothing looks different;
 * the edit icon sits beside the photo), and below it what they have done here, the way a marketplace profile shows it: completed
 * orders, rating, money spent (customer) or earned (provider, technician), and the reviews about them.
 */
export function ProfileView({ user }: { user: User }) {
  const hasStats = ROLES_WITH_STATS.includes(user.role);
  const { districts, upazilas } = useLocationOptions(user.districtId ?? null);
  const districtName = districts.find((district) => district.id === user.districtId)?.bnName ?? '';
  const upazilaName = upazilas.find((upazila) => upazila.id === user.upazilaId)?.bnName ?? '';
  const savedAddress = user.addresses?.find((address) => address.isDefault)?.addressText ?? '';

  return (
    <>
      <div className="flex w-full flex-col items-center gap-[48px]">
        <AuthField icon={UserIcon} type="text" value={user.name ?? ''} placeholder="Full name" readOnly />
        <AuthField icon={AtSign} type="text" value={user.username ?? ''} placeholder="Username" readOnly />
        <PhoneNumberField value={user.mobileNumber} onChange={() => undefined} readOnly trailing={<Check className="size-[24px] shrink-0 text-primary" strokeWidth={1.5} />} />
        <AuthField icon={BadgeCheck} type="text" value={districtName} placeholder="জেলা" readOnly />
        <AuthField icon={MapPin} type="text" value={upazilaName} placeholder="উপজেলা" readOnly />
        {/* Saved from the last order; the Place Order form starts with it. */}
        <AuthField icon={Home} type="text" value={savedAddress} placeholder="ঠিকানা (প্রথম অর্ডারে সেভ হবে)" readOnly />
      </div>

      {hasStats && <ProfileStats user={user} />}
    </>
  );
}

function ProfileStats({ user }: { user: User }) {
  const { data, isLoading, isError } = useMyReviews(user.id);
  const isCustomer = user.role === UserRole.CUSTOMER;
  const amountLabel = isCustomer ? 'মোট খরচ' : user.role === UserRole.TECHNICIAN ? 'কাজের মোট আয়' : 'মোট আয়';

  return (
    <section className="flex w-full flex-col gap-[16px]">
      <h4 className="text-[16px] font-semibold tracking-[-0.32px] text-ink">আমার কার্যক্রম</h4>
      {isLoading && <p className="text-[14px] font-medium text-muted">Loading...</p>}
      {isError && <p className="text-[14px] font-medium text-[#d64545]">তথ্য লোড করা যায়নি।</p>}
      {data && (
        <>
          <div className="grid grid-cols-3 gap-[8px]">
            <Stat value={String(data.completedOrders)} label="সম্পন্ন অর্ডার" />
            <Stat value={data.rating > 0 ? `★ ${data.rating.toFixed(1)}` : 'New'} label={`রেটিং (${data.count})`} />
            <Stat value={formatTaka(data.totalAmount)} label={amountLabel} />
          </div>

          <h4 className="pt-[8px] text-[16px] font-semibold tracking-[-0.32px] text-ink">
            {isCustomer ? 'প্রোভাইডারদের মতামত' : 'কাস্টমারদের মতামত'}
          </h4>
          <ReviewList reviews={data.reviews} emptyText="এখনো কোনো রিভিউ নেই।" />
        </>
      )}
    </section>
  );
}
