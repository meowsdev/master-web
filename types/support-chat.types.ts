/** Who a staff member can write to. Technicians are reached through their provider. */
export type SupportMemberRole = 'PROVIDER' | 'CUSTOMER';

/** One row of the staff directory: a provider or customer and the state of their support thread. */
export interface SupportDirectoryEntry {
  id: string;
  name: string | null;
  username: string | null;
  /** Staff only: the backend never sends numbers to anyone else. */
  mobileNumber?: string;
  profilePhoto: string | null;
  /** PROVIDER or TECHNICIAN in the providers list. */
  role: string;
  threadId: string | null;
  lastMessage: { text: string; createdAt: string } | null;
  unreadCount: number;
}

export interface SupportMessage {
  id: string;
  text: string;
  createdAt: string;
  /** true = written by the platform's staff, false = by the provider/customer. */
  fromSupport: boolean;
}

export interface MySupportThread {
  threadId: string | null;
  unreadCount: number;
  lastMessage: { text: string; createdAt: string } | null;
}
