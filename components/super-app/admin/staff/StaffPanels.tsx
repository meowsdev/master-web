'use client';

import { useState } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { Briefcase01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { SidePanelShell } from '@/components/modals/SidePanelShell';
import { PhoneNumberField } from '@/components/modals/auth/PhoneNumberField';
import { OrderField, OrderSelect, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { GRANTABLE_STAFF_ROLES, STAFF_ROLE_LABEL, useStaffAccounts } from '@/hooks/useStaffAccounts';
import { StaffRole } from '@/services/admin-staff.service';

const ROLE_OPTIONS = GRANTABLE_STAFF_ROLES.map((role) => ({ value: role, label: STAFF_ROLE_LABEL[role] }));

const ROLE_NOTE: Record<StaffRole, string> = {
  MANAGER: 'সব অর্ডার, সার্ভিস, পার্টনার ও কাস্টমার পরিচালনা করতে পারবেন। ব্যান ও টেকনিশিয়ান পরিচালনা পারবেন না।',
  SUPPORT: 'সব অর্ডার দেখবেন এবং পার্টনার, টেকনিশিয়ান ও কাস্টমারের সাথে চ্যাট করবেন।',
  HR: 'সব অর্ডার ও তার চ্যাট দেখবেন।',
  COUNSELOR: 'সব অর্ডার ও তার চ্যাট দেখবেন।',
};

const primaryButton = 'cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled';

/* Admin adds an office staff member: number, name, position. They then sign in with OTP on that number. */
export function AddStaffPanel({ adminId, onClose }: { adminId: string; onClose: () => void }) {
  const { create } = useStaffAccounts(adminId);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');
  const isReady = phone !== '' && isValidPhoneNumber(phone) && name.trim().length >= 2 && role !== '' && !create.isPending;

  return (
    <SidePanelShell title="নতুন স্টাফ যোগ করুন" onClose={onClose}>
      <p className="mb-[8px] text-[13px] font-medium leading-relaxed text-muted">
        এই নম্বরে তিনি OTP দিয়ে লগইন করবেন এবং তার পদ অনুযায়ী স্ক্রিন পাবেন। কাস্টমার বা পার্টনারের নম্বর স্টাফ হতে পারবে না।
      </p>
      <PhoneNumberField value={phone} onChange={setPhone} />
      <OrderField icon={UserIcon}>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="নাম" className={fieldControlClass} />
      </OrderField>
      <OrderSelect icon={Briefcase01Icon} placeholder="পদ সিলেক্ট করুন" value={role || null} options={ROLE_OPTIONS} onChange={(value) => setRole(value as StaffRole | '')} />
      {role && <p className="mt-[8px] text-[12px] font-medium text-muted">{ROLE_NOTE[role]}</p>}

      <div className="mt-[28px] flex justify-center">
        <button type="button" disabled={!isReady} onClick={() => role && create.mutate({ mobileNumber: phone, name: name.trim(), role }, { onSuccess: onClose })} className={primaryButton}>
          {create.isPending ? 'যোগ হচ্ছে...' : 'স্টাফ যোগ করুন'}
        </button>
      </div>
    </SidePanelShell>
  );
}

/* One staff member: their details, change of position, turn the account off / on. Admin accounts are read only. */
export function StaffDetailsPanel({ adminId, staffId, onClose }: { adminId: string; staffId: string; onClose: () => void }) {
  const { staff, update } = useStaffAccounts(adminId);
  const person = staff.find((item) => item.id === staffId);
  const [role, setRole] = useState<StaffRole | null>(null);
  if (!person) return null;

  const isAdminAccount = person.role === 'ADMIN';
  const isSelf = person.id === adminId;
  const isOff = person.status !== 'ACTIVE';
  const chosenRole = role ?? (person.role as StaffRole);
  const canEdit = !isAdminAccount && !isSelf && person.status !== 'BANNED';

  return (
    <SidePanelShell title={person.name || person.mobileNumber} onClose={onClose}>
      <dl className="flex flex-col gap-[10px] text-[14px] font-medium text-ink">
        <div className="flex justify-between gap-[12px]"><dt className="text-muted">ফোন</dt><dd>{person.mobileNumber}</dd></div>
        <div className="flex justify-between gap-[12px]"><dt className="text-muted">পদ</dt><dd>{STAFF_ROLE_LABEL[person.role] ?? person.role}</dd></div>
        <div className="flex justify-between gap-[12px]"><dt className="text-muted">অবস্থা</dt><dd className={isOff ? 'text-[#d64545]' : 'text-primary'}>{isOff ? 'বন্ধ' : 'চালু'}</dd></div>
        <div className="flex justify-between gap-[12px]"><dt className="text-muted">লগইন</dt><dd>{person.isVerified ? 'করেছেন' : 'এখনো করেননি'}</dd></div>
        <div className="flex justify-between gap-[12px]"><dt className="text-muted">যোগ হয়েছেন</dt><dd>{new Date(person.createdAt).toLocaleDateString('bn-BD')}</dd></div>
      </dl>

      {!canEdit && (
        <p className="mt-[20px] text-[13px] font-medium text-muted">{isSelf ? 'নিজের অ্যাকাউন্ট এখান থেকে বদলানো যায় না।' : 'Admin অ্যাকাউন্ট এখান থেকে বদলানো যায় না।'}</p>
      )}

      {canEdit && (
        <>
          <p className="mb-[4px] mt-[24px] text-[14px] font-semibold text-ink">পদ বদলান</p>
          <OrderSelect icon={Briefcase01Icon} placeholder="পদ" value={chosenRole} options={ROLE_OPTIONS} onChange={(value) => value && setRole(value as StaffRole)} />
          <p className="mt-[8px] text-[12px] font-medium text-muted">{ROLE_NOTE[chosenRole]} পদ বদলালে তাকে আবার লগইন করতে হবে।</p>
          <div className="mt-[16px] flex justify-center">
            <button type="button" disabled={chosenRole === person.role || update.isPending} onClick={() => update.mutate({ staffId, change: { role: chosenRole } }, { onSuccess: () => setRole(null) })} className={primaryButton}>
              পদ সেভ করুন
            </button>
          </div>

          <div className="mt-[28px] border-t border-line pt-[16px]">
            <p className="text-[14px] font-semibold text-ink">{isOff ? 'অ্যাকাউন্ট চালু করুন' : 'অ্যাকাউন্ট বন্ধ করুন'}</p>
            <p className="mt-[4px] text-[12px] font-medium text-muted">{isOff ? 'আবার লগইন করতে পারবেন।' : 'সাথে সাথে লগআউট হবেন এবং আর লগইন করতে পারবেন না, যতক্ষণ না আবার চালু করা হয়।'}</p>
            <button
              type="button"
              disabled={update.isPending}
              onClick={() => update.mutate({ staffId, change: { status: isOff ? 'ACTIVE' : 'SUSPENDED' } })}
              className={`mt-[10px] h-[36px] cursor-pointer rounded-[8px] px-[16px] text-[14px] font-semibold text-white disabled:opacity-50 ${isOff ? 'bg-primary hover:bg-primary/90' : 'bg-[#d64545] hover:bg-[#bd3b3b]'}`}
            >
              {isOff ? 'চালু করুন' : 'বন্ধ করুন'}
            </button>
          </div>
        </>
      )}
    </SidePanelShell>
  );
}
