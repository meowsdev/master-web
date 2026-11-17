'use client';

import { Calendar03Icon, CheckmarkCircle02Icon, Clock01Icon, Home01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { usePlaceOrderForm } from '@/hooks/usePlaceOrderForm';
import { OrderField, OrderSelect, fieldControlClass } from './OrderField';

type FormState = ReturnType<typeof usePlaceOrderForm>;

/** Dhaka's "today" would be wrong for a visitor on another clock, so the browser's own date is the floor. */
const todayIso = () => new Date().toLocaleDateString('en-CA');

/* Where (district, upazila, address) and when (date, time slot) the visit should happen. */
export function ScheduleSection({ state }: { state: FormState }) {
  const { locations } = state;

  return (
    <>
      <OrderSelect
        icon={CheckmarkCircle02Icon}
        placeholder="জেলা"
        value={state.districtId}
        options={locations.districts.map((district) => ({ value: district.id, label: district.bnName || district.name }))}
        onChange={(value) => state.selectDistrict(value ? Number(value) : null)}
      />
      <OrderSelect
        icon={Location01Icon}
        placeholder="উপজেলা"
        value={state.upazilaId}
        disabled={state.districtId === null}
        options={locations.upazilas.map((upazila) => ({ value: upazila.id, label: upazila.bnName || upazila.name }))}
        onChange={(value) => state.setUpazilaId(value ? Number(value) : null)}
      />
      {locations.hasUpazilaError && (
        <p className="mt-[6px] text-[12px] font-medium text-[#d64545]">
          উপজেলার তালিকা লোড হয়নি।{' '}
          <button type="button" onClick={() => locations.retryUpazilas()} className="cursor-pointer font-semibold underline">আবার চেষ্টা করুন</button>
        </p>
      )}
      <OrderField icon={Home01Icon}>
        <input
          value={state.addressDetail}
          onChange={(event) => state.setAddressDetail(event.target.value)}
          maxLength={300}
          placeholder="বাড়ি, রোড, এলাকা বিস্তারিত লিখুন"
          className={fieldControlClass}
        />
      </OrderField>

      <div className="flex items-end gap-[16px]">
        <div className="min-w-0 flex-1">
          <OrderField icon={Calendar03Icon}>
            <input
              type="date"
              min={todayIso()}
              value={state.scheduledDate}
              onChange={(event) => state.setScheduledDate(event.target.value)}
              aria-label="Booking date"
              className={`${fieldControlClass} cursor-pointer`}
            />
          </OrderField>
        </div>
        <div className="min-w-0 flex-1">
          <OrderSelect
            icon={Clock01Icon}
            placeholder="টাইম"
            value={state.timeSlot}
            options={(state.catalog?.timeSlots ?? []).map((slot) => ({ value: slot, label: slot }))}
            onChange={state.setTimeSlot}
          />
        </div>
      </div>
    </>
  );
}
