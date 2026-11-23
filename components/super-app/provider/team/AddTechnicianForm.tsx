'use client';

import { useState } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { UserIcon } from '@hugeicons/core-free-icons';
import { PhoneNumberField } from '@/components/modals/auth/PhoneNumberField';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { useAddTeamTechnician } from '@/hooks/useProviderTeam';

/*
 * "Add worker": a provider adds a technician to their own team with a name and phone number. The same form
 * sits in Assign Worker and in the Team panel. The backend refuses a number with another role or a
 * technician who already works for another provider.
 */
export function AddTechnicianForm({ userId, onDone, onCancel }: { userId: string; onDone?: () => void; onCancel?: () => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const add = useAddTeamTechnician(userId, () => {
    setPhone('');
    setName('');
    onDone?.();
  });

  const isPhoneReady = phone !== '' && isValidPhoneNumber(phone);
  const isReady = isPhoneReady && name.trim().length > 0;

  return (
    <div className="rounded-[12px] border border-line bg-white p-[14px]">
      <p className="mb-[8px] text-[14px] font-semibold text-ink">নতুন টেকনিশিয়ান যোগ করুন</p>
      <p className="mb-[8px] text-[12px] font-medium leading-relaxed text-muted">
        এই নম্বর দিয়েই টেকনিশিয়ান অ্যাপে লগইন করবে। যোগ করার পর তাকে যেকোনো অর্ডারে assign করতে পারবেন।
      </p>
      <PhoneNumberField value={phone} onChange={setPhone} />
      <OrderField icon={UserIcon}>
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} placeholder="নাম" className={fieldControlClass} />
      </OrderField>

      <div className="mt-[16px] flex items-center justify-center gap-[10px]">
        <button
          type="button"
          disabled={!isReady || add.isPending}
          onClick={() => add.mutate({ mobileNumber: phone, name: name.trim() })}
          className="cursor-pointer rounded-[8px] bg-primary px-[20px] py-[8px] text-[14px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
        >
          {add.isPending ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cursor-pointer rounded-[8px] px-[16px] py-[8px] text-[14px] font-semibold text-muted hover:bg-surface">
            বাতিল
          </button>
        )}
      </div>
    </div>
  );
}
