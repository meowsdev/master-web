import { Service } from '@/types/service.types';

// Message structure for in-chat conversations
export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'voice_call' | 'service_card';
  reaction?: string;
  serviceCard?: {
    title: string;
    price: number | string;
    duration: string;
  };
}

// Status Stories structure
export interface StatusStory {
  id: string;
  author: string;
  avatar: string;
  time: string;
  title: string;
  caption: string;
  color: string;
}

// Navigation Rail tab identifiers
export type RailTab = 'CHATS' | 'STATUS' | 'CHANNELS' | 'COMMUNITIES' | 'SETTINGS';

// Custom filter list structure for WhatsApp Web user-created lists
export interface CustomFilterList {
  id: string;
  name: string;
  serviceIds: string[];
  createdAt: number;
}

// Filter chips available in WhatsApp Web sidebar (Groups replaced with Save)
export type StandardFilterChip = 'All' | 'Unread' | 'Favorites' | 'Save';
export type FilterChip = StandardFilterChip | string;

// Payment methods for in-chat service booking
export type PaymentMode = 'CASH' | 'BKASH' | 'NAGAD';

// Quick Dhaka Area presets for fast booking in chat
export const DHAKA_AREAS: string[] = [
  'Dhanmondi 27, Dhaka',
  'Gulshan-2 Circle, Dhaka',
  'Uttara Sector 7, Dhaka',
  'Mirpur-10 Roundabout, Dhaka',
  'Banani Road 11, Dhaka',
  'Mohammadpur Housing, Dhaka',
  'Bashundhara R/A Block C, Dhaka',
];

// Pre-seeded WhatsApp status stories
export const STATUS_STORIES: StatusStory[] = [
  {
    id: 's1',
    author: 'Super app Official',
    avatar: '🛡️',
    time: 'Today at 5:40 PM',
    title: '❄️ 20% Off AC Chemical Wash',
    caption: 'Pure high-pressure cooling before summer peaks! Certified technicians with 7 days free warranty.',
    color: 'from-[#075E54] to-[#128C7E]',
  },
  {
    id: 's2',
    author: 'Engr. Tanvir (AC Tech)',
    avatar: '❄️',
    time: 'Today at 4:15 PM',
    title: 'Completed 5-Star AC Repair at Gulshan',
    caption: 'Replaced faulty capacitor & completed high pressure jet-pump chemical wash. 5-star customer rating! 🌟',
    color: 'from-[#128C7E] to-[#25D366]',
  },
  {
    id: 's3',
    author: 'Deep Cleaning Squad',
    avatar: '🧹',
    time: 'Today at 2:30 PM',
    title: 'German Steam Sanitization Active',
    caption: 'Full residential complex disinfection dispatched to Uttara Sector 7.',
    color: 'from-[#075E54] to-[#25D366]',
  },
];
