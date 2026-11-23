'use client';

import { useRef, useState } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input/mobile';
import { UserIcon } from '@hugeicons/core-free-icons';
import { PhoneNumberField } from '@/components/modals/auth/PhoneNumberField';
import { FormPart } from '@/components/modals/place-order/FormPart';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import type { ScheduleFormState } from '@/components/modals/place-order/ScheduleSection';
import { CustomerLookupNote } from '@/components/super-app/admin/panels/AdminCreateOrderPanel';
import { CustomerLookup, orderPlacementService } from '@/services/order-placement.service';

export interface OrderCustomer {
  phone: string;
  name: string;
  lookup: CustomerLookup | null;
}

/** Ready to order for: a valid number that is not a provider / staff / blocked customer, and a name. */
export function customerMissing(customer: OrderCustomer): string[] {
  const { lookup } = customer;
  const cannotOrderFor = lookup?.found === true && (lookup.role !== 'CUSTOMER' || lookup.status !== 'ACTIVE');
  return [
    !(customer.phone && isValidPhoneNumber(customer.phone)) || cannotOrderFor ? 'কাস্টমারের নম্বর' : null,
    !customer.name.trim() ? 'কাস্টমারের নাম' : null,
  ].filter((field): field is string => field !== null);
}

/*
 * Staff only, first part of the order confirmation: whom the order is for. A complete number is looked up at once;
 * a known customer's name and last place fill in (anything staff typed themselves is kept).
 */
export function OrderForCustomerSection({ customer, onChange, place }: { customer: OrderCustomer; onChange: (next: OrderCustomer) => void; place: ScheduleFormState }) {
  const latestPhone = useRef('');
  const filled = useRef({ name: '', address: '' });
  const [isLooking, setIsLooking] = useState(false);

  const changePhone = (phone: string) => {
    latestPhone.current = phone;
    onChange({ ...customer, phone, lookup: null });
    if (!phone || !isValidPhoneNumber(phone)) return;
    setIsLooking(true);
    orderPlacementService
      .lookupCustomer(phone)
      .then((lookup) => {
        if (latestPhone.current !== phone) return; // the number changed while this was loading
        const isCustomer = lookup.found && lookup.role === 'CUSTOMER';
        const name = isCustomer ? (lookup.name ?? '') : '';
        onChange({
          phone,
          lookup,
          name: customer.name.trim() === '' || customer.name === filled.current.name ? name : customer.name,
        });
        filled.current.name = name;

        const address = isCustomer ? (lookup.addressDetail ?? '') : '';
        if (place.addressDetail.trim() === '' || place.addressDetail === filled.current.address) place.setAddressDetail(address);
        filled.current.address = address;
        if (isCustomer && lookup.districtId && lookup.upazilaId) {
          place.selectDistrict(lookup.districtId);
          place.setUpazilaId(lookup.upazilaId);
        }
      })
      .catch(() => undefined) // only a convenience: everything can still be typed by hand
      .finally(() => setIsLooking(false));
  };

  const isDone = customerMissing(customer).length === 0;
  return (
    <FormPart step={0} title="কার জন্য অর্ডার" hint="কাস্টমারের নম্বর ও নাম" isDone={isDone}>
      <div className="mt-[14px]">
        <p className="text-[15px] font-semibold text-ink">কার জন্য অর্ডার করছেন?</p>
        <p className="mb-[4px] text-[12px] text-muted">কাস্টমারের নম্বর আর নাম দিন। নম্বর নতুন হলে নতুন কাস্টমার অ্যাকাউন্ট তৈরি হবে।</p>
        <PhoneNumberField value={customer.phone} onChange={changePhone} />
        {isLooking && <p className="mt-[8px] text-[12px] font-medium text-muted">খুঁজছি...</p>}
        {customer.lookup && <CustomerLookupNote lookup={customer.lookup} />}
        <OrderField icon={UserIcon}>
          <input
            value={customer.name}
            onChange={(event) => onChange({ ...customer, name: event.target.value })}
            maxLength={100}
            placeholder="কাস্টমারের নাম"
            className={fieldControlClass}
          />
        </OrderField>
      </div>
    </FormPart>
  );
}
