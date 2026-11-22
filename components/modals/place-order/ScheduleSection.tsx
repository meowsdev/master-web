'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, CheckmarkCircle02Icon, Clock01Icon, Home01Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { usePlaceOrderForm } from '@/hooks/usePlaceOrderForm';
import { OrderField, OrderSelect, fieldControlClass } from './OrderField';
import { SchedulePickerDialog, shortSlotLabel } from './SchedulePickerDialog';
import { FormPart } from './FormPart';

type FormState = ReturnType<typeof usePlaceOrderForm>;

/* Two parts of the form: where (district, upazila, address), then when (date and time slot, via "Tap to Schedule"). */
export function ScheduleSection({ state }: { state: FormState }) {
  const { locations } = state;
  const isAddressDone = Boolean(state.districtId && state.upazilaId && state.addressDetail.trim());
  const isTimeDone = Boolean(state.scheduledDate && state.timeSlot);

  return (
    <>
    <FormPart step={2} title="ঠিকানা" hint="কোথায় আসবে" isDone={isAddressDone}>
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

    </FormPart>

    <FormPart step={3} title="সময়" hint="কবে, কয়টার সময় আসবে" isDone={isTimeDone}>
      <ScheduleButton state={state} />
    </FormPart>
    </>
  );
}

/** "2026-11-25" → "Wed, 25 Nov", read as a calendar day (no timezone shift). */
const formatScheduleDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

/*
 * "Tap to Schedule": opens the date / time dialog. Once confirmed, the button shows the chosen day and
 * window, and tapping it again changes them.
 */
function ScheduleButton({ state }: { state: FormState }) {
  const [isOpen, setIsOpen] = useState(false);
  const isScheduled = Boolean(state.scheduledDate && state.timeSlot);
  const slot = isScheduled ? shortSlotLabel(state.timeSlot) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`mt-[16px] flex h-[52px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-[12px] border-2 px-[16px] text-[15px] font-semibold transition-colors ${
          isScheduled ? 'border-[#1daa61] bg-[#e7fce3] text-[#205737]' : 'border-dashed border-[#1daa61] text-[#1daa61] hover:bg-[#e7fce3]'
        }`}
      >
        <HugeiconsIcon icon={isScheduled ? Clock01Icon : Calendar03Icon} size={20} />
        {isScheduled && slot ? (
          <span className="truncate">
            {formatScheduleDay(state.scheduledDate)} · {slot.range} {slot.period}
            <span className="ml-[8px] text-[12px] font-medium text-[#697586] underline">পরিবর্তন</span>
          </span>
        ) : (
          'Tap to Schedule'
        )}
      </button>

      {isOpen && (
        <SchedulePickerDialog
          timeSlots={state.catalog?.timeSlots ?? []}
          initialDate={state.scheduledDate}
          initialTimeSlot={state.timeSlot}
          onClose={() => setIsOpen(false)}
          onConfirm={(date, timeSlot) => {
            state.setScheduledDate(date);
            state.setTimeSlot(timeSlot);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
