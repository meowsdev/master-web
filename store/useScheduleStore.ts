import { create } from 'zustand';

export interface ChosenSchedule {
  /** YYYY-MM-DD */
  date: string;
  timeSlot: string;
}

/**
 * "Tap to Schedule" of a main service's cart: which cart the calendar is open for, and the day and time picked
 * for each cart. After Confirm the checkout opens with that time already filled in.
 */
interface ScheduleState {
  pickingFor: string | null;
  schedules: Record<string, ChosenSchedule>;
  startPicking: (mainServiceId: string) => void;
  stopPicking: () => void;
  setSchedule: (mainServiceId: string, schedule: ChosenSchedule) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  pickingFor: null,
  schedules: {},
  startPicking: (pickingFor) => set({ pickingFor }),
  stopPicking: () => set({ pickingFor: null }),
  setSchedule: (mainServiceId, schedule) => set((state) => ({ schedules: { ...state.schedules, [mainServiceId]: schedule } })),
}));
