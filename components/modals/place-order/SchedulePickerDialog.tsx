'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

/** How many days the strip offers, starting today. The backend accepts up to 30 days ahead. */
const DAYS_SHOWN = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

interface ScheduleDay {
  /** YYYY-MM-DD in the browser's own calendar, the form the backend expects. */
  iso: string;
  day: string;
  weekday: string;
  month: string;
  isToday: boolean;
}

function upcomingDays(now = new Date()): ScheduleDay[] {
  return Array.from({ length: DAYS_SHOWN }, (_, index) => {
    const date = new Date(now.getTime() + index * DAY_MS);
    return {
      iso: date.toLocaleDateString('en-CA'),
      day: date.toLocaleDateString('en-GB', { day: '2-digit' }),
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase(),
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
      isToday: index === 0,
    };
  });
}

/** "09:00 AM - 11:00 AM" → the slot's start as minutes after midnight (540), or null if unreadable. */
function slotStartMinutes(slot: string): number | null {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(slot.trim());
  if (!match) return null;
  const hour = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

/** "09:00 AM - 11:00 AM" → { range: "9 - 11", period: "am" }; "11:00 AM - 01:00 PM" → "11 - 1", "pm". */
export function shortSlotLabel(slot: string): { range: string; period: string } {
  const parts = slot.split('-').map((part) => part.trim());
  const read = (part?: string) => /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(part ?? '');
  const start = read(parts[0]);
  const end = read(parts[1]);
  if (!start || !end) return { range: slot, period: '' };
  const hour = (match: RegExpExecArray) => `${Number(match[1])}${match[2] === '00' ? '' : `:${match[2]}`}`;
  return { range: `${hour(start)} - ${hour(end)}`, period: end[3].toLowerCase() };
}

/** Today's slots that have already started cannot be picked: nobody can arrive in the past. */
function isSlotPast(slot: string, dayIso: string, now = new Date()) {
  if (dayIso !== now.toLocaleDateString('en-CA')) return false;
  const start = slotStartMinutes(slot);
  return start !== null && start <= now.getHours() * 60 + now.getMinutes();
}

interface SchedulePickerDialogProps {
  timeSlots: readonly string[];
  initialDate: string;
  initialTimeSlot: string;
  onConfirm: (date: string, timeSlot: string) => void;
  onClose: () => void;
}

/*
 * "Tap to Schedule": a centred dialog over the whole screen. The customer picks a day from the strip; the
 * time windows for that day then appear; Confirm turns on once a window is picked. Nothing reaches the form
 * until Confirm. The backend checks the date and slot again when the order is placed.
 */
export function SchedulePickerDialog({ timeSlots, initialDate, initialTimeSlot, onConfirm, onClose }: SchedulePickerDialogProps) {
  const [days] = useState(() => upcomingDays());
  const [date, setDate] = useState(() => (days.some((day) => day.iso === initialDate) ? initialDate : ''));
  const [timeSlot, setTimeSlot] = useState(() => (date && !isSlotPast(initialTimeSlot, date) ? initialTimeSlot : ''));
  const stripRef = useRef<HTMLDivElement>(null);

  // Escape closes, and the page behind does not scroll while the dialog is open.
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const scrollStrip = (direction: 1 | -1) => stripRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });

  const pickDate = (iso: string) => {
    setDate(iso);
    // A new day shows its own windows: the previous pick may not exist (or be over) there.
    setTimeSlot('');
  };

  const availableOnDate = date ? timeSlots.filter((slot) => !isSlotPast(slot, date)) : [];
  const hasNoSlotsLeft = Boolean(date) && availableOnDate.length === 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0b141a]/50 p-[16px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="schedule-title" className="flex max-h-[calc(100dvh-32px)] w-full max-w-[680px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <header className="flex items-center justify-between border-b border-line px-[20px] py-[14px]">
          <h2 id="schedule-title" className="text-[17px] font-semibold text-ink">সময় নির্বাচন করুন</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-[32px] cursor-pointer items-center justify-center rounded-full text-muted hover:bg-surface">
            <HugeiconsIcon icon={Cancel01Icon} size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-[20px] py-[20px]">
          <p className="text-center text-[18px] font-semibold text-ink">কখন সার্ভিস নিতে চান?</p>
          <p className="mt-[6px] text-center text-[13px] font-medium text-muted">তারিখ বেছে নিন</p>

          <div className="relative mt-[14px]">
            <button type="button" onClick={() => scrollStrip(-1)} aria-label="Earlier dates" className="absolute left-0 top-1/2 z-10 hidden size-[32px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-surface sm:flex">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            </button>
            <div ref={stripRef} className="flex snap-x gap-[8px] overflow-x-auto scroll-smooth px-[4px] pb-[4px] [scrollbar-width:none] sm:px-[36px] [&::-webkit-scrollbar]:hidden">
              {days.map((day) => {
                const isSelected = day.iso === date;
                return (
                  <button
                    key={day.iso}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${day.weekday} ${day.day} ${day.month}`}
                    onClick={() => pickDate(day.iso)}
                    className={`flex h-[80px] w-[62px] shrink-0 snap-start cursor-pointer flex-col items-center justify-center rounded-[10px] border transition-colors ${isSelected ? 'border-primary bg-secondary' : 'border-line bg-white hover:border-primary/50'}`}
                  >
                    <span className={`text-[26px] font-semibold leading-none ${isSelected ? 'text-primary' : 'text-ink'}`}>{day.day}</span>
                    <span className={`mt-[6px] text-[11px] font-semibold tracking-[0.4px] ${isSelected ? 'text-primary' : 'text-muted'}`}>{day.isToday ? 'TODAY' : day.weekday}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => scrollStrip(1)} aria-label="Later dates" className="absolute right-0 top-1/2 z-10 hidden size-[32px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-surface sm:flex">
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </button>
          </div>

          {date && (
            <>
              <p className="mt-[24px] text-center text-[13px] font-medium text-muted">সময় বেছে নিন, এক্সপার্ট এই সময়ের মধ্যে পৌঁছাবেন</p>
              {hasNoSlotsLeft ? (
                <p className="mt-[14px] rounded-[10px] bg-[#fff4e5] p-[12px] text-center text-[13px] font-medium text-[#b7791f]">আজকের সব সময় পার হয়ে গেছে। অন্য একটি তারিখ বেছে নিন।</p>
              ) : (
                <div role="radiogroup" aria-label="Time slot" className="mt-[14px] grid grid-cols-2 gap-[10px] sm:grid-cols-3">
                  {timeSlots.map((slot) => {
                    const isPast = isSlotPast(slot, date);
                    const isSelected = slot === timeSlot;
                    const label = shortSlotLabel(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={slot}
                        disabled={isPast}
                        onClick={() => setTimeSlot(slot)}
                        className={`h-[44px] cursor-pointer rounded-[8px] border text-[15px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${isSelected ? 'border-primary bg-secondary font-semibold text-primary' : 'border-line bg-white font-medium text-ink hover:border-primary/50'}`}
                      >
                        {label.range} <span className={isSelected ? 'text-primary' : 'text-muted'}>{label.period}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <footer className="flex justify-center border-t border-line px-[20px] py-[14px]">
          <button
            type="button"
            disabled={!date || !timeSlot}
            onClick={() => onConfirm(date, timeSlot)}
            className="h-[44px] min-w-[180px] cursor-pointer rounded-[10px] bg-primary px-[24px] text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary-disabled"
          >
            Confirm
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
