import { create } from 'zustand';
import { SupportMemberRole } from '@/types/support-chat.types';

/** The provider/customer an admin has open in the support chat. */
export interface SelectedSupportMember {
  id: string;
  role: SupportMemberRole;
  name: string;
  /** "Provider", "Technician" or "Customer", shown under the name. */
  roleLabel: string;
  photo: string | null;
}

interface SupportChatState {
  selected: SelectedSupportMember | null;
  select: (member: SelectedSupportMember) => void;
  /** Called on logout: the next person on this browser must not see who the last admin was talking to. */
  reset: () => void;
}

// Memory only (no persist): nothing about a conversation outlives the tab.
export const useSupportChatStore = create<SupportChatState>((set) => ({
  selected: null,
  select: (selected) => set({ selected }),
  reset: () => set({ selected: null }),
}));
