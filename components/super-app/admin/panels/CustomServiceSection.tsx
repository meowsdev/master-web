'use client';

import { Alert02Icon, Note01Icon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { FormPart } from '@/components/modals/place-order/FormPart';
import { OrderField, fieldControlClass } from '@/components/modals/place-order/OrderField';
import { formatTaka } from '@/components/modals/place-order/format-taka';

/** Same bounds as the backend (AdminCustomOrderDto). */
export const MIN_CUSTOM_ORDER_PRICE = 1;
export const MAX_CUSTOM_ORDER_PRICE = 200000;

export interface CustomServiceForm {
  mainServiceName: string;
  subServiceName: string;
  description: string;
  /** Digits only, as typed. */
  price: string;
}

export const EMPTY_CUSTOM_SERVICE: CustomServiceForm = { mainServiceName: '', subServiceName: '', description: '', price: '' };

/** The typed price as a number, or null while it is empty or out of bounds. */
export const parseCustomOrderPrice = (text: string): number | null => {
  const value = Number(text);
  return text !== '' && Number.isInteger(value) && value >= MIN_CUSTOM_ORDER_PRICE && value <= MAX_CUSTOM_ORDER_PRICE ? value : null;
};

/** What is still missing in the custom service card, in the words the form uses. */
export const customServiceMissing = (form: CustomServiceForm) =>
  [
    !form.mainServiceName.trim() && 'মেইন সার্ভিস',
    !form.subServiceName.trim() && 'সাব-সার্ভিস',
    parseCustomOrderPrice(form.price) === null && 'দাম',
  ].filter((field): field is string => Boolean(field));

/*
 * "কাস্টম সার্ভিস": a service that is not in the catalog. The admin types the main service, the sub-service,
 * the details, and then the price. The order goes to every available provider in the area.
 */
export function CustomServiceSection({ form, onChange }: { form: CustomServiceForm; onChange: (form: CustomServiceForm) => void }) {
  const set = (field: keyof CustomServiceForm) => (value: string) => onChange({ ...form, [field]: value });
  const price = parseCustomOrderPrice(form.price);
  const isPriceOutOfRange = form.price !== '' && price === null;

  return (
    <FormPart step={1} title="কাস্টম সার্ভিস" hint="সার্ভিস, বিস্তারিত ও দাম লিখুন" isDone={customServiceMissing(form).length === 0}>
      <OrderField icon={Wrench01Icon}>
        <input value={form.mainServiceName} onChange={(event) => set('mainServiceName')(event.target.value)} maxLength={100} placeholder="মেইন সার্ভিস (যেমন: জেনারেটর)" className={fieldControlClass} />
      </OrderField>
      <OrderField icon={Alert02Icon}>
        <input value={form.subServiceName} onChange={(event) => set('subServiceName')(event.target.value)} maxLength={200} placeholder="সাব-সার্ভিস (যেমন: জেনারেটর সার্ভিসিং)" className={fieldControlClass} />
      </OrderField>
      <OrderField icon={Note01Icon}>
        <textarea
          value={form.description}
          onChange={(event) => set('description')(event.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="সার্ভিসের বিস্তারিত (ঐচ্ছিক)"
          className={`${fieldControlClass} resize-none`}
        />
      </OrderField>

      <label htmlFor="custom-order-price" className="mt-[20px] block text-[13px] font-semibold text-ink">
        দাম
      </label>
      <div className={`mt-[6px] flex items-center gap-[8px] rounded-[12px] border-2 px-[12px] py-[8px] ${isPriceOutOfRange ? 'border-[#d64545]' : 'border-primary'}`}>
        <span className="text-[22px] font-semibold text-primary">৳</span>
        <input
          id="custom-order-price"
          inputMode="numeric"
          value={form.price}
          onChange={(event) => set('price')(event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 6))}
          placeholder="০"
          className="min-w-0 flex-1 bg-transparent text-[22px] font-semibold text-ink outline-none placeholder:text-muted"
        />
      </div>
      {isPriceOutOfRange && (
        <p className="mt-[6px] text-[12px] font-semibold text-[#d64545]">
          দাম {formatTaka(MIN_CUSTOM_ORDER_PRICE)} থেকে {formatTaka(MAX_CUSTOM_ORDER_PRICE)} এর মধ্যে হতে হবে।
        </p>
      )}
      <p className="mt-[8px] text-[12px] font-medium leading-relaxed text-muted">
        এই অর্ডার এলাকার সব available প্রোভাইডারের কাছে যাবে, যে আগে নেবে সে পাবে।
      </p>
    </FormPart>
  );
}
