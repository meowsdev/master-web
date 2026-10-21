'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { servicesService } from '@/services/services.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth.types';
import { Service } from '@/types/service.types';
import {
  MessageSquare,
  Radio,
  Users,
  Sparkles,
  Star,
  Settings,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Video,
  Phone,
  Paperclip,
  Smile,
  Mic,
  Send,
  CheckCheck,
  ArrowLeft,
  X,
  PhoneMissed,
  Wrench,
  Zap,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  LogIn,
  LogOut,
  Camera,
  FileText,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ShieldCheck,
  Clock,
  Award,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

// Quick Dhaka Area suggestions for in-chat service booking
const DHAKA_AREAS = [
  'Dhanmondi 27, Dhaka',
  'Gulshan-2 Circle, Dhaka',
  'Uttara Sector 7, Dhaka',
  'Mirpur-10 Roundabout, Dhaka',
  'Banani Road 11, Dhaka',
  'Mohammadpur Housing, Dhaka',
  'Bashundhara R/A Block C, Dhaka',
];

interface ChatMessage {
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
    category?: string;
  };
}

// WhatsApp Status Stories
const STATUS_STORIES = [
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

export default function SuperAppPage() {
  const { user, isAuthenticated, activeRole, setAuth, logout, setRole } = useAuthStore();

  // Dark/Light theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Navigation Rail tab
  const [activeRailTab, setActiveRailTab] = useState<'CHATS' | 'STATUS' | 'CHANNELS' | 'COMMUNITIES' | 'SETTINGS'>('CHATS');

  // Active selected service ID (null = Show Welcome Screen initially)
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  // Search query for services list
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filter chip selection ('All' | 'Unread' | 'Favorites' | 'Groups')
  const [activeFilterChip, setActiveFilterChip] = useState<'All' | 'Unread' | 'Favorites' | 'Groups'>('All');

  // In-chat messages mapped per service ID
  const [serviceMessages, setServiceMessages] = useState<Record<string, ChatMessage[]>>({});

  // Input & composer state
  const [inputText, setInputText] = useState('');
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authPhone, setAuthPhone] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // In-chat booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingAddress, setBookingAddress] = useState(DHAKA_AREAS[0]);
  const [bookingTime, setBookingTime] = useState('Today, Within 2 Hours');
  const [bookingPaymentMode, setBookingPaymentMode] = useState<'CASH' | 'BKASH' | 'NAGAD'>('CASH');

  // Calling modal
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Status Stories viewer
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);

  // Settings & Role drawer
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  // Mobile navigation view: 'LIST' or 'CHAT'
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('CHAT');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Audio synthesizer for WhatsApp sound effects
  const playSound = (type: 'send' | 'receive') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {}
  };

  // 1. Fetch real services list from database backend
  const { data: dbServices = [], isLoading: isServicesLoading } = useQuery<Service[]>({
    queryKey: ['super-app-services'],
    queryFn: () => servicesService.getServices(),
  });

  // Filtered services based on search query and filter chips
  const filteredServices = useMemo(() => {
    let list = dbServices;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          (s.category?.name && s.category.name.toLowerCase().includes(query))
      );
    }
    if (activeFilterChip === 'Unread') {
      list = list.slice(0, 3);
    } else if (activeFilterChip === 'Favorites') {
      list = list.filter((s: any) => s.isPopular || s.basePrice >= 800);
    } else if (activeFilterChip === 'Groups') {
      list = list.filter((s) => s.category?.name?.toLowerCase().includes('clean') || s.name.toLowerCase().includes('ac') || s.name.toLowerCase().includes('install'));
    }
    return list;
  }, [dbServices, searchQuery, activeFilterChip]);

  // Active selected service object
  const activeService = useMemo(() => {
    if (!activeServiceId) return null;
    return dbServices.find((s) => s.id === activeServiceId) || null;
  }, [dbServices, activeServiceId]);

  // Current service chat messages
  const currentMessages = useMemo(() => {
    if (!activeServiceId) return [];
    return serviceMessages[activeServiceId] || [];
  }, [serviceMessages, activeServiceId]);

  // Calling timer
  useEffect(() => {
    let timer: any;
    if (isCallingModalOpen) {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallingModalOpen]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Sync dark class on document element so Tailwind dark variants only activate when isDarkMode is true
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Select service and initialize conversation if needed
  const handleSelectService = (service: Service) => {
    setActiveServiceId(service.id);
    setMobileView('CHAT');

    if (!serviceMessages[service.id] || serviceMessages[service.id].length === 0) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initialMsgs: ChatMessage[] = [
        {
          id: 'init-1',
          sender: 'them',
          text: `Assalamu Alaikum! Welcome to ${service.name}. I am your dedicated service counselor.`,
          time: currentTime,
        },
        {
          id: 'init-2',
          sender: 'them',
          text: service.description || 'Here are the details for this verified on-demand service:',
          time: currentTime,
          type: 'service_card',
          serviceCard: {
            title: service.name,
            price: service.basePrice,
            duration: `${service.durationMin || 45} mins`,
            category: service.category?.name || 'On-Demand Service',
          },
        },
      ];

      setServiceMessages((prev) => ({
        ...prev,
        [service.id]: initialMsgs,
      }));
    }
  };

  // Send message in active service chat
  const handleSendMessage = () => {
    if (!inputText.trim() || !activeServiceId) return;

    const msgText = inputText.trim();
    const sId = activeServiceId;
    setInputText('');
    setIsAttachmentOpen(false);
    setIsEmojiPickerOpen(false);
    playSound('send');

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'me',
      text: msgText,
      time: currentTime,
      status: 'read',
    };

    setServiceMessages((prev) => ({
      ...prev,
      [sId]: [...(prev[sId] || []), newMsg],
    }));

    // Realistic Counselor reply simulation
    setTimeout(() => {
      playSound('receive');
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const autoReply: ChatMessage = {
        id: 'cns-' + Date.now(),
        sender: 'them',
        text: `Got your message regarding ${activeService?.name || 'this service'}. Our verified technician is available. Click 'Book Service' above or let me know your preferred time slot!`,
        time: replyTime,
      };

      setServiceMessages((prev) => ({
        ...prev,
        [sId]: [...(prev[sId] || []), autoReply],
      }));
    }, 1300);
  };

  // Add emoji reaction
  const handleReactToMessage = (msgId: string, emoji: string) => {
    if (!activeServiceId) return;
    const sId = activeServiceId;
    setServiceMessages((prev) => ({
      ...prev,
      [sId]: (prev[sId] || []).map((m) =>
        m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m
      ),
    }));
  };

  // Confirm booking in chat
  const handleConfirmBooking = () => {
    if (!activeServiceId || !activeService) return;
    const sId = activeServiceId;
    setIsBookingModalOpen(false);
    playSound('send');

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const confirmationMsg: ChatMessage = {
      id: 'bk-' + Date.now(),
      sender: 'them',
      text: `✅ Dispatch Request Confirmed!\n• Service: ${activeService.name}\n• Rate: ৳${activeService.basePrice}\n• Address: ${bookingAddress}\n• Time: ${bookingTime}\n• Payment: ${bookingPaymentMode}\n• Status: Certified Technician Assigned`,
      time: currentTime,
    };

    setServiceMessages((prev) => ({
      ...prev,
      [sId]: [...(prev[sId] || []), confirmationMsg],
    }));

    toast.success('Technician booked successfully!', {
      description: `Dispatch scheduled for ${bookingAddress}`,
    });
  };

  // Format phone number
  const formatPhone = (phone: string) => {
    let clean = phone.trim();
    if (clean.startsWith('01')) {
      clean = `+88${clean}`;
    }
    return clean;
  };

  // Auth: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone) {
      toast.error('Please enter your phone number');
      return;
    }

    setAuthLoading(true);
    try {
      const cleanPhone = formatPhone(authPhone);
      const res = await authService.requestOtp({ phoneNumber: cleanPhone });
      setIsOtpSent(true);
      toast.success(res.message || 'OTP sent successfully!');
      if (res.code) {
        toast.info(`Dev OTP Code: ${res.code}`, { duration: 8000 });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp || authOtp.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setAuthLoading(true);
    try {
      const cleanPhone = formatPhone(authPhone);
      const res = await authService.verifyOtp({
        phoneNumber: cleanPhone,
        code: authOtp,
      });

      setAuth(res.user, res.accessToken, res.refreshToken);
      toast.success('Logged in successfully!');
      setIsAuthModalOpen(false);
      setIsOtpSent(false);
      setAuthOtp('');
      setAuthPhone('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  // Demo 1-Click login
  const handleDemoLogin = (role: UserRole) => {
    const dummyUser = {
      id: 'demo-user-' + role.toLowerCase(),
      name: role === UserRole.CUSTOMER ? 'Alif Khan' : `Super App ${role} Lead`,
      mobileNumber: '+880 1700-000000',
      role: role,
      status: 'ACTIVE',
      isVerified: true,
      profilePhoto: '/avatars/cat_avatar.jpg',
    };
    setAuth(dummyUser as any, 'mock-jwt-token', 'mock-refresh-token');
    setRole(role);
    toast.success(`Logged in as ${role}!`);
    setIsAuthModalOpen(false);
  };

  // Authentic WhatsApp Web desktop exact color tokens
  const bgMain = isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]';
  const bgRail = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';
  const bgSidebar = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';
  const bgHeader = isDarkMode ? 'bg-[#202c33] border-[#222e35] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]';
  const bgComposer = isDarkMode ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]';
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const headerIconBtn = isDarkMode
    ? 'text-[#aebac1] hover:text-white hover:bg-white/10'
    : 'text-[#54656f] hover:text-[#111b21] hover:bg-black/5';
  const bubbleIncoming = isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const bubbleOutgoing = isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]';

  return (
    <div className={`flex h-screen w-screen overflow-hidden select-none font-sans ${bgMain}`}>
      {/* ──────────────────────────────────────────────────────────
          1. FAR LEFT RAIL: WhatsApp Navigation Rail (64px)
      ────────────────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col items-center justify-between w-16 border-r py-3.5 z-20 shrink-0 ${bgRail}`}>
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Chats Tab with WhatsApp Green active highlight */}
          <button
            onClick={() => setActiveRailTab('CHATS')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              activeRailTab === 'CHATS'
                ? isDarkMode
                  ? 'bg-[#005c4b]/50 text-[#25D366]'
                  : 'bg-[#e7fce3] text-[#008069]'
                : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/10`
            }`}
            title="Chats & Services"
          >
            <MessageSquare className="w-5 h-5" />
            {activeRailTab === 'CHATS' && (
              <span className="absolute -left-3 w-1.5 h-6 bg-[#25D366] rounded-r-full" />
            )}
          </button>

          {/* Status Updates Tab */}
          <button
            onClick={() => {
              setActiveRailTab('STATUS');
              setIsStatusViewerOpen(true);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              activeRailTab === 'STATUS'
                ? isDarkMode
                  ? 'bg-[#005c4b]/50 text-[#25D366]'
                  : 'bg-[#e7fce3] text-[#008069]'
                : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/10`
            }`}
            title="Status updates"
          >
            <Radio className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#25D366] rounded-full ring-2 ring-white dark:ring-[#202c33]" />
          </button>

          {/* Channels Tab */}
          <button
            onClick={() => {
              setActiveRailTab('CHANNELS');
              toast.info('Channels: Super app Service Verified Broadcasts');
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              activeRailTab === 'CHANNELS'
                ? isDarkMode
                  ? 'bg-[#005c4b]/50 text-[#25D366]'
                  : 'bg-[#e7fce3] text-[#008069]'
                : `${textSecondary} hover:bg-black/5 dark:hover:bg-white/10`
            }`}
            title="Channels"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Meta AI / Assistant Tab */}
          <button
            onClick={() => {
              toast.info('Super app AI Counselor active');
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#25D366] hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="AI Support Counselor"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          {/* Theme Dark/Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Starred Messages */}
          <button
            onClick={() => toast.info('No starred messages')}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
            title="Starred"
          >
            <Star className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsDrawerOpen(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
            title="Settings & Role"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => setIsSettingsDrawerOpen(true)}
            className="w-9 h-9 rounded-full overflow-hidden border border-[#d1d7db] dark:border-[#374248] bg-white flex items-center justify-center hover:ring-2 hover:ring-[#25D366] transition-all cursor-pointer relative"
            title={user ? `${user.name} (${activeRole})` : 'Profile / Login'}
          >
            {user?.profilePhoto ? (
              <Image src={user.profilePhoto} alt="User" width={36} height={36} className="object-cover" />
            ) : (
              <span className="text-xs font-bold text-[#54656f]">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </span>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border border-white dark:border-[#202c33]" />
          </button>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────
          2. CHATS SIDEBAR: Bold Super app Header & Database Services List
      ────────────────────────────────────────────────────────── */}
      <section
        className={`${
          mobileView === 'LIST' ? 'flex' : 'hidden md:flex'
        } flex-col w-full md:w-[380px] lg:w-[420px] border-r shrink-0 h-full relative z-10 ${bgSidebar}`}
      >
        {/* Header with Bold "Super app" Title in Authentic WhatsApp Web Desktop Style */}
        <div className={`h-[60px] px-4 flex items-center justify-between border-b shrink-0 z-10 ${bgHeader}`}>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-bold tracking-tight text-[#111b21] dark:text-[#e9edef]">
              Super app
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {/* New Service / Chat action */}
            <button
              onClick={() => setActiveServiceId(null)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
              title="Welcome screen"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
                title="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className={`absolute right-0 top-11 w-52 rounded-xl shadow-2xl py-2 border z-50 text-sm ${
                  isDarkMode ? 'bg-[#233138] border-[#2f3b43] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
                }`}>
                  <button
                    onClick={() => {
                      setActiveServiceId(null);
                      setMobileView('CHAT');
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-[#25D366]" />
                    <span>Welcome Screen</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsDrawerOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings & Switch Role</span>
                  </button>

                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      toast.info(`Sound notifications: ${!soundEnabled ? 'ON' : 'OFF'}`);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-[#25D366]" /> : <VolumeX className="w-4 h-4" />}
                    <span>{soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}</span>
                  </button>

                  <div className={`my-1 border-t ${isDarkMode ? 'border-[#2f3b43]' : 'border-[#e9edef]'}`} />

                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logout();
                        toast.info('Logged out');
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out ({user?.name})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[#e7fce3] dark:hover:bg-[#005c4b]/30 text-[#075E54] dark:text-[#25D366] font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login / Register</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Web Style Search Bar */}
        <div className="px-3 pt-2 pb-1.5 bg-white dark:bg-[#111b21] shrink-0">
          <div className={`flex items-center h-9 px-3 rounded-[8px] transition-all ${
            isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'
          } ${isSearchFocused ? 'ring-1 ring-[#008069] dark:ring-[#25D366]' : ''}`}>
            <Search className="w-4 h-4 mr-2.5 shrink-0 text-[#54656f] dark:text-[#8696a0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search or start a new chat"
              className="bg-transparent border-none outline-none text-[13.5px] w-full placeholder:text-[#8696a0]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-[#54656f] hover:text-[#111b21] dark:hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp Web Authentic Filter Chips */}
        <div className="px-3 pb-2 pt-0.5 bg-white dark:bg-[#111b21] flex items-center gap-1.5 overflow-x-auto border-b border-[#e9edef] dark:border-[#222e35] shrink-0 scrollbar-none">
          {(['All', 'Unread', 'Favorites', 'Groups'] as const).map((chip) => {
            const isActive = activeFilterChip === chip;
            return (
              <button
                key={chip}
                onClick={() => setActiveFilterChip(chip)}
                className={`px-3 py-1 text-[13px] rounded-full transition-colors font-medium shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#d9fdd3] text-[#008069] dark:bg-[#005c4b] dark:text-[#25D366]'
                    : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef] dark:bg-[#202c33] dark:text-[#8696a0] dark:hover:bg-[#2a3942]'
                }`}
              >
                {chip}
              </button>
            );
          })}
          <button
            onClick={() => toast.info('Super app custom category filter')}
            className="w-6 h-6 rounded-full bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef] dark:bg-[#202c33] dark:text-[#8696a0] flex items-center justify-center shrink-0 cursor-pointer"
            title="Add filter"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Database Services List (Filtered by search) */}
        <div className="flex-1 overflow-y-auto">
          {isServicesLoading ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className={`text-xs ${textSecondary}`}>Loading services from database...</p>
            </div>
          ) : dbServices.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className={`text-sm ${textPrimary}`}>No services found in database.</p>
              <p className={`text-xs ${textSecondary}`}>Add services in database to display them here.</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className={`text-sm font-medium ${textPrimary}`}>
                No services found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p className={`text-xs ${textSecondary}`}>Try searching with different keywords</p>
              <button
                onClick={() => setSearchQuery('')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#005c4b] text-white hover:bg-[#25D366]'
                    : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
                }`}
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredServices.map((service) => {
              const isSelected = service.id === activeServiceId;
              const categoryIcon = service.category?.iconUrl || '🛠️';

              return (
                <div
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className={`flex items-center gap-3 px-3 py-1 cursor-pointer transition-colors relative group select-none ${
                    isSelected
                      ? isDarkMode
                        ? 'bg-[#2a3942]'
                        : 'bg-[#f0f2f5]'
                      : isDarkMode
                      ? 'hover:bg-[#202c33]'
                      : 'hover:bg-[#f5f6f6]'
                  }`}
                >
                  {/* Service Icon Avatar */}
                  <div className="relative shrink-0 my-1">
                    <div className="w-12 h-12 rounded-full bg-[#e9edef] dark:bg-[#202c33] flex items-center justify-center text-xl shadow-2xs">
                      {categoryIcon}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white dark:border-[#111b21]" />
                  </div>

                  {/* Service Content with WhatsApp indented border */}
                  <div className="flex-1 min-w-0 py-2 border-b border-[#e9edef] dark:border-[#222e35]">
                    {/* Top Row: Service Name and Price */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[15.5px] font-normal leading-tight truncate ${textPrimary}`}>
                        {service.name}
                      </span>
                      <span className={`text-[12px] font-normal shrink-0 ml-2 ${textSecondary}`}>
                        ৳{service.basePrice}
                      </span>
                    </div>

                    {/* Bottom Row: Blue Double Tick + Last Message / Description + Chevron */}
                    <div className="flex items-center justify-between mt-1 text-[13px]">
                      <div className={`flex items-center gap-1.5 min-w-0 truncate ${textSecondary}`}>
                        <CheckCheck className="w-4 h-4 text-[#53bdeb] shrink-0" />
                        <span className="truncate">
                          {service.description || 'Assalamu Alaikum! Counselor ready.'}
                        </span>
                      </div>

                      {/* WhatsApp Dropdown Chevron */}
                      <ChevronDown
                        className={`w-4 h-4 text-[#8696a0] shrink-0 ml-1.5 transition-opacity ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className={`p-3 border-t flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-[#182229] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]'
        }`}>
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#008069] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${textPrimary}`}>{user?.name}</p>
                <p className="text-[11px] text-[#25D366] font-bold">{activeRole || 'CUSTOMER'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className={`text-xs ${textSecondary}`}>Guest User</span>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-[#25D366]/25"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. MAIN WINDOW: Welcome Screen OR Service Chat Window
      ────────────────────────────────────────────────────────── */}
      <main
        className={`${
          mobileView === 'CHAT' ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 h-full relative z-0 min-w-0`}
      >
        {activeService ? (
          /* ── ACTIVE SERVICE CHAT ── */
          <>
            {/* Top Chat Header in Authentic WhatsApp Web Style */}
            <div className={`h-[60px] border-b px-4 flex items-center justify-between shrink-0 ${bgHeader}`}>
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileView('LIST')}
                  className={`md:hidden p-1.5 rounded-full cursor-pointer transition-colors ${headerIconBtn}`}
                  title="Back to Services"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Back to Welcome Screen */}
                <button
                  onClick={() => setActiveServiceId(null)}
                  className={`hidden md:flex p-1.5 rounded-full cursor-pointer transition-colors ${headerIconBtn}`}
                  title="Back to Welcome Screen"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {/* Service Avatar with WhatsApp Green Indicator */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center text-lg shrink-0 border border-[#e9edef] dark:border-[#374248]">
                    {activeService.category?.iconUrl || '🛠️'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-white dark:border-[#202c33]" />
                </div>

                {/* Title & Counselor Online */}
                <div className="min-w-0">
                  <h2 className={`text-[15.5px] font-medium truncate leading-tight ${textPrimary}`}>
                    {activeService.name}
                  </h2>
                  <p className={`text-[12px] ${textSecondary} font-normal flex items-center gap-1.5`}>
                    <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
                    <span>Counselor Online • ৳{activeService.basePrice}</span>
                  </p>
                </div>
              </div>

              {/* Right Action Buttons in Authentic WhatsApp Web style */}
              <div className="flex items-center gap-1">
                {/* Book Service Button (WhatsApp Web pill button style) */}
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="border border-[#d1d7db] dark:border-[#3b4a54] bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] text-[12.5px] font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942] transition-colors cursor-pointer mr-1"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#008069] dark:text-[#25D366]" />
                  <span>Book Service</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#54656f] dark:text-[#8696a0]" />
                </button>

                {/* Video Call */}
                <button
                  onClick={() => {
                    setCallType('video');
                    setIsCallingModalOpen(true);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
                  title="Video call"
                >
                  <Video className="w-5 h-5" />
                </button>

                {/* Voice Call */}
                <button
                  onClick={() => {
                    setCallType('voice');
                    setIsCallingModalOpen(true);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
                  title="Voice call"
                >
                  <Phone className="w-5 h-5" />
                </button>

                {/* Search Inside Chat */}
                <button
                  onClick={() => toast.info('Search inside service messages')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
                  title="Search chat"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Chat Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${headerIconBtn}`}
                    title="Menu"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {isChatMenuOpen && (
                    <div className={`absolute right-0 top-11 w-48 rounded-xl shadow-xl py-2 border z-50 text-sm ${
                      isDarkMode ? 'bg-[#233138] border-[#2f3b43] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
                    }`}>
                      <button
                        onClick={() => {
                          setIsBookingModalOpen(true);
                          setIsChatMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 text-[#008069] dark:text-[#25D366] font-bold cursor-pointer"
                      >
                        Book Service Now
                      </button>
                      <button
                        onClick={() => {
                          if (activeServiceId) {
                            setServiceMessages((prev) => ({
                              ...prev,
                              [activeServiceId]: [],
                            }));
                            toast.success('Chat cleared');
                          }
                          setIsChatMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-rose-500/10 text-rose-500 cursor-pointer"
                      >
                        Clear messages
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages Canvas with WhatsApp Doodle Wallpaper */}
            <div
              className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-16 py-4 whatsapp-wallpaper space-y-2.5"
              style={{
                backgroundColor: isDarkMode ? '#0b141a' : '#efeae2',
                filter: isDarkMode ? 'brightness(0.88)' : 'none',
              }}
            >
              {/* Date Divider */}
              <div className="flex justify-center my-3">
                <span className={`text-[12px] font-medium px-3.5 py-1 rounded-md shadow-xs ${
                  isDarkMode ? 'bg-[#182229] text-[#8696a0]' : 'bg-white/95 text-[#54656f]'
                }`}>
                  Today
                </span>
              </div>

              {/* Messages list */}
              {currentMessages.map((msg) => (
                <React.Fragment key={msg.id}>
                  {msg.type === 'service_card' && msg.serviceCard ? (
                    /* Service Attachment Card */
                    <div className="flex justify-start my-2">
                      <div className={`rounded-2xl p-4 shadow-md max-w-sm w-full space-y-3 border ${
                        isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl ${
                            isDarkMode ? 'bg-[#005c4b]/50 text-white' : 'bg-[#e7fce3] text-[#075E54]'
                          }`}>
                            {activeService.category?.iconUrl || '🛠️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-[10.5px] uppercase font-extrabold tracking-wider ${
                              isDarkMode ? 'text-[#25D366]' : 'text-[#075E54]'
                            }`}>
                              {msg.serviceCard.category}
                            </span>
                            <h3 className={`text-[15px] font-bold leading-snug ${textPrimary}`}>
                              {msg.serviceCard.title}
                            </h3>
                            <p className={`text-[12px] mt-0.5 ${textSecondary}`}>
                              Estimated duration: {msg.serviceCard.duration}
                            </p>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl flex items-center justify-between ${
                          isDarkMode ? 'bg-[#111b21]' : 'bg-[#f0f2f5]'
                        }`}>
                          <div>
                            <span className={`text-[11px] ${textSecondary}`}>Fixed Base Price</span>
                            <div className={`text-[19px] font-black ${
                              isDarkMode ? 'text-[#25D366]' : 'text-[#075E54]'
                            }`}>
                              ৳{msg.serviceCard.price}
                            </div>
                          </div>
                          <span className={`text-[11.5px] px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${
                            isDarkMode
                              ? 'bg-[#005c4b] text-white'
                              : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30'
                          }`}>
                            Verified Dispatch
                          </span>
                        </div>

                        <button
                          onClick={() => setIsBookingModalOpen(true)}
                          className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[13px] rounded-xl shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book Technician Now</span>
                        </button>

                        <div className="flex justify-end pt-1">
                          <span className={`text-[11px] ${textSecondary}`}>{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  ) : msg.sender === 'me' ? (
                    /* Outgoing message (WhatsApp green bubble) */
                    <div className="flex justify-end my-0.5 relative group">
                      <div className={`rounded-lg rounded-tr-none px-3.5 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] max-w-[85%] sm:max-w-[70%] md:max-w-[60%] text-[14.2px] leading-[19px] relative whitespace-pre-line ${bubbleOutgoing}`}>
                        <span>{msg.text}</span>
                        <span className="float-right ml-3 mt-1.5 text-[11px] opacity-75 flex items-center gap-1 select-none">
                          <span>{msg.time}</span>
                          <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                        </span>

                        {msg.reaction && (
                          <span className="absolute -bottom-2.5 right-2 bg-white dark:bg-[#202c33] rounded-full px-1.5 py-0.5 shadow-sm text-xs border border-black/5 dark:border-white/10">
                            {msg.reaction}
                          </span>
                        )}

                        {/* Hover reaction bar */}
                        <div className="hidden group-hover:flex items-center gap-1 absolute -top-8 right-0 bg-white dark:bg-[#233138] rounded-full px-2 py-1 shadow-lg border border-black/5 dark:border-white/10 text-sm z-10">
                          {['👍', '❤️', '😂', '🔥', '🙏'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReactToMessage(msg.id, emoji)}
                              className="hover:scale-125 transition-transform p-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Incoming message */
                    <div className="flex justify-start my-0.5 relative group">
                      <div className={`rounded-lg rounded-tl-none px-3.5 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] max-w-[85%] sm:max-w-[70%] md:max-w-[60%] text-[14.2px] leading-[19px] relative whitespace-pre-line ${bubbleIncoming}`}>
                        <span>{msg.text}</span>
                        <span className="float-right ml-3 mt-1.5 text-[11px] opacity-75 select-none">
                          {msg.time}
                        </span>

                        {msg.reaction && (
                          <span className="absolute -bottom-2.5 left-2 bg-white dark:bg-[#202c33] rounded-full px-1.5 py-0.5 shadow-sm text-xs border border-black/5 dark:border-white/10">
                            {msg.reaction}
                          </span>
                        )}

                        {/* Hover reaction bar */}
                        <div className="hidden group-hover:flex items-center gap-1 absolute -top-8 left-0 bg-white dark:bg-[#233138] rounded-full px-2 py-1 shadow-lg border border-black/5 dark:border-white/10 text-sm z-10">
                          {['👍', '❤️', '😂', '🔥', '🙏'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReactToMessage(msg.id, emoji)}
                              className="hover:scale-125 transition-transform p-0.5"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Composer */}
            <div className={`h-[62px] border-t px-3 md:px-4 flex items-center gap-2 shrink-0 relative ${bgComposer}`}>
              {/* Attachment Clip */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsAttachmentOpen(!isAttachmentOpen);
                    setIsEmojiPickerOpen(false);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
                  title="Attach"
                >
                  <Paperclip className="w-5 h-5 text-[#54656f] dark:text-[#8696a0]" />
                </button>

                {isAttachmentOpen && (
                  <div className={`absolute left-0 bottom-14 w-56 rounded-2xl shadow-2xl p-2 border z-50 space-y-1 ${
                    isDarkMode ? 'bg-[#233138] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                  }`}>
                    <button
                      onClick={() => {
                        setIsBookingModalOpen(true);
                        setIsAttachmentOpen(false);
                      }}
                      className="w-full px-3 py-2 hover:bg-[#e7fce3] dark:hover:bg-[#005c4b]/30 rounded-xl flex items-center gap-3 text-[#075E54] dark:text-[#25D366] text-sm font-bold cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <span>Book Service</span>
                    </button>

                    <button
                      onClick={() => {
                        setInputText('📍 Current Location: Dhanmondi 27, Dhaka');
                        setIsAttachmentOpen(false);
                      }}
                      className="w-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 text-sm cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-rose-500" />
                      </div>
                      <span>Send Location</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Emoji Picker Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsEmojiPickerOpen(!isEmojiPickerOpen);
                    setIsAttachmentOpen(false);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer`}
                  title="Emoji"
                >
                  <Smile className="w-5 h-5 text-[#54656f] dark:text-[#8696a0]" />
                </button>

                {isEmojiPickerOpen && (
                  <div className={`absolute left-0 bottom-14 rounded-2xl shadow-xl p-3 border z-50 flex gap-2 text-2xl ${
                    isDarkMode ? 'bg-[#233138] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
                  }`}>
                    {['👍', '❤️', '😂', '🔥', '🙏', '⚡', '🛠️', '❄️'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setInputText((prev) => prev + emoji);
                          setIsEmojiPickerOpen(false);
                        }}
                        className="hover:scale-125 transition-transform cursor-pointer p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Type a message"
                className={`rounded-[8px] px-4 py-2 text-[14.5px] outline-none flex-1 border-none shadow-none ${
                  isDarkMode
                    ? 'bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0]'
                    : 'bg-white text-[#111b21] placeholder:text-[#8696a0]'
                }`}
              />

              {/* Send or Voice Record Button in WhatsApp Brand Green */}
              {inputText.trim() ? (
                <button
                  onClick={handleSendMessage}
                  className="w-9 h-9 rounded-full bg-[#008069] hover:bg-[#075E54] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!activeServiceId) return;
                    const sId = activeServiceId;
                    playSound('send');
                    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const voiceMsg: ChatMessage = {
                      id: 'vmsg-' + Date.now(),
                      sender: 'me',
                      text: '🎙️ Voice note (0:14)',
                      time: currentTime,
                      status: 'read',
                    };
                    setServiceMessages((prev) => ({
                      ...prev,
                      [sId]: [...(prev[sId] || []), voiceMsg],
                    }));
                    toast.success('Voice message sent');
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0`}
                  title="Record voice note"
                >
                  <Mic className="w-5 h-5 text-[#54656f] dark:text-[#8696a0]" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* ── WELCOME SCREEN (Shown initially or when no chat is active) ── */
          <div
            className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto relative whatsapp-wallpaper"
            style={{
              backgroundColor: isDarkMode ? '#0b141a' : '#efeae2',
            }}
          >
            {/* WhatsApp Web Signature Bottom Green Accent Bar */}
            <div className="h-2 w-full bg-[#25D366] absolute bottom-0 left-0" />

            <div className="max-w-xl w-full text-center space-y-7 animate-in fade-in duration-300 relative z-10 py-6">
              {/* App Brand Header with WhatsApp Green Gradient */}
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#075E54] via-[#008069] to-[#25D366] text-white flex items-center justify-center font-black text-3xl mx-auto shadow-2xl shadow-[#25D366]/40 ring-4 ring-[#25D366]/20">
                  S
                </div>
                <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
                  Welcome to <span className="text-[#008069] dark:text-[#25D366]">Super app</span>
                </h2>
                <p className={`text-sm md:text-base leading-relaxed max-w-md mx-auto ${textSecondary}`}>
                  Your instant technician messaging and on-demand home service platform. Select any service from the left list to start live chatting.
                </p>
              </div>

              {/* Login & Registration Card with WhatsApp Brand Colors */}
              <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xs ${
                isDarkMode ? 'bg-[#182229]/95 border-[#2f3b43]' : 'bg-white/95 border-[#e9edef]'
              }`}>
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#008069] text-white flex items-center justify-center text-lg font-bold shadow-md shadow-[#008069]/30">
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="text-left">
                        <h4 className={`text-base font-bold ${textPrimary}`}>{user?.name}</h4>
                        <p className={`text-xs ${textSecondary}`}>{user?.mobileNumber}</p>
                        <span className={`inline-block mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          isDarkMode ? 'bg-[#005c4b] text-white' : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30'
                        }`}>
                          Role: {activeRole || 'CUSTOMER'}
                        </span>
                      </div>
                    </div>

                    <p className={`text-xs ${textSecondary}`}>
                      You are logged in and ready to consult counselors and book services.
                    </p>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setIsSettingsDrawerOpen(true)}
                        className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-[#25D366]/20"
                      >
                        Switch Role / Settings
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          toast.info('Logged out');
                        }}
                        className="px-4 py-2 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-xl transition-all hover:bg-rose-500/20 cursor-pointer"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className={`text-lg font-bold ${textPrimary}`}>Login or Register</h3>
                      <p className={`text-xs ${textSecondary}`}>
                        Enter with your phone number to book verified technicians, chat with counselors, and track orders in real-time.
                      </p>
                    </div>

                    {/* WhatsApp Brand Buttons: Primary Green & Outline */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setAuthMode('LOGIN');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full sm:w-auto px-7 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#075E54] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#25D366]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Login with Phone</span>
                      </button>

                      <button
                        onClick={() => {
                          setAuthMode('REGISTER');
                          setIsAuthModalOpen(true);
                        }}
                        className={`w-full sm:w-auto px-7 py-3.5 border-2 font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isDarkMode
                            ? 'border-[#25D366] text-[#25D366] hover:bg-[#005c4b]/30'
                            : 'border-[#008069] text-[#075E54] hover:bg-[#e7fce3]'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Registration</span>
                      </button>
                    </div>

                    {/* 1-Click Fast Test Logins */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${textSecondary}`}>
                        Instant 1-Click Test Access
                      </span>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleDemoLogin(UserRole.CUSTOMER)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                            isDarkMode
                              ? 'bg-[#005c4b] text-white hover:bg-[#25D366]'
                              : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
                          }`}
                        >
                          Customer Demo
                        </button>
                        <button
                          onClick={() => handleDemoLogin(UserRole.COUNSELOR)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                            isDarkMode
                              ? 'bg-[#005c4b] text-white hover:bg-[#25D366]'
                              : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
                          }`}
                        >
                          Counselor Demo
                        </button>
                        <button
                          onClick={() => handleDemoLogin(UserRole.PROVIDER)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                            isDarkMode
                              ? 'bg-[#005c4b] text-white hover:bg-[#25D366]'
                              : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
                          }`}
                        >
                          Provider Demo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Features Highlights in WhatsApp Greens */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                {[
                  { icon: <Zap className="w-5 h-5 text-[#25D366]" />, title: '30m Dispatch', desc: 'Fast response in Dhaka' },
                  { icon: <ShieldCheck className="w-5 h-5 text-[#008069] dark:text-[#25D366]" />, title: 'Verified Techs', desc: '100% background checked' },
                  { icon: <Award className="w-5 h-5 text-[#075E54] dark:text-[#25D366]" />, title: 'Fixed Rates', desc: 'No hidden surge pricing' },
                  { icon: <Clock className="w-5 h-5 text-[#128C7E] dark:text-[#25D366]" />, title: '7 Days Warranty', desc: 'Free re-service guarantee' },
                ].map((f, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl border ${
                      isDarkMode ? 'bg-[#182229]/90 border-[#2f3b43]' : 'bg-white/90 border-[#e9edef]'
                    }`}
                  >
                    <div className="mb-2">{f.icon}</div>
                    <h5 className={`text-xs font-bold ${textPrimary}`}>{f.title}</h5>
                    <p className={`text-[11px] mt-0.5 ${textSecondary}`}>{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* End-to-end encrypted lock footer */}
              <div className={`flex items-center justify-center gap-1.5 text-[13px] ${textSecondary}`}>
                <Lock className="w-4 h-4 text-[#008069] dark:text-[#25D366]" />
                <span>End-to-end encrypted communication</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ──────────────────────────────────────────────────────────
          4. LOGIN & REGISTRATION MODAL WITH WHATSAPP BRAND GREEN
      ────────────────────────────────────────────────────────── */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className={`rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border ${
            isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
          }`}>
            {/* WhatsApp Teal Header */}
            <div className="bg-gradient-to-r from-[#075E54] via-[#008069] to-[#128C7E] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {authMode === 'LOGIN' ? 'Login' : 'Registration'}
                  </h3>
                  <p className="text-xs text-white/80">Super app Phone OTP</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsOtpSent(false);
                }}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!isOtpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-bold ${textPrimary}`}>Mobile Number</label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={`w-full p-3 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-[#25D366] ${
                        isDarkMode
                          ? 'bg-[#111b21] border-[#2f3b43] text-white'
                          : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
                      }`}
                      autoFocus
                    />
                    <p className={`text-[11px] ${textSecondary}`}>
                      We will send a 6-digit verification code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? 'Sending OTP...' : 'Send OTP Code'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                      className="text-xs text-[#075E54] dark:text-[#25D366] font-bold hover:underline cursor-pointer"
                    >
                      {authMode === 'LOGIN'
                        ? "Don't have an account? Register"
                        : 'Already have an account? Login'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-bold ${textPrimary}`}>Enter 6-Digit OTP</label>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-[11px] text-[#25D366] font-bold hover:underline cursor-pointer"
                      >
                        Change Phone
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      placeholder="123456"
                      className={`w-full p-3 rounded-xl text-center text-xl tracking-widest font-bold outline-none border focus:ring-2 focus:ring-[#25D366] ${
                        isDarkMode
                          ? 'bg-[#111b21] border-[#2f3b43] text-white'
                          : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
                      }`}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          5. IN-CHAT SERVICE BOOKING MODAL
      ────────────────────────────────────────────────────────── */}
      {isBookingModalOpen && activeService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className={`rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border ${
            isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
          }`}>
            {/* WhatsApp Teal Header */}
            <div className="bg-gradient-to-r from-[#075E54] via-[#008069] to-[#128C7E] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">In-Chat Booking</h3>
                  <p className="text-xs text-white/80">Instant technician dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Service Summary */}
              <div className={`p-3 rounded-xl flex items-center justify-between ${
                isDarkMode ? 'bg-[#111b21]' : 'bg-[#e7fce3]'
              }`}>
                <div>
                  <div className={`text-xs ${textSecondary}`}>Selected Service</div>
                  <div className={`text-sm font-bold ${textPrimary}`}>
                    {activeService.name}
                  </div>
                </div>
                <div className="text-base font-extrabold text-[#008069] dark:text-[#25D366]">
                  ৳{activeService.basePrice}
                </div>
              </div>

              {/* Address Selection */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${textPrimary}`}>Service Address in Dhaka</label>
                <select
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs outline-none border ${
                    isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
                  }`}
                >
                  {DHAKA_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${textPrimary}`}>Dispatch Timing</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs outline-none border ${
                    isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
                  }`}
                >
                  <option value="Today, Within 2 Hours">Today, Within 2 Hours (Urgent)</option>
                  <option value="Today, Afternoon (3 PM - 6 PM)">Today, Afternoon (3 PM - 6 PM)</option>
                  <option value="Tomorrow Morning (10 AM - 1 PM)">Tomorrow Morning (10 AM - 1 PM)</option>
                </select>
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold ${textPrimary}`}>Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'BKASH', 'NAGAD'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBookingPaymentMode(mode)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        bookingPaymentMode === mode
                          ? isDarkMode
                            ? 'bg-[#005c4b] border-[#25D366] text-white'
                            : 'bg-[#e7fce3] border-[#25D366] text-[#075E54]'
                          : isDarkMode
                          ? 'bg-[#111b21] border-transparent text-[#8696a0]'
                          : 'bg-[#f0f2f5] border-transparent text-[#54656f]'
                      }`}
                    >
                      {mode === 'CASH' ? 'Cash on Work' : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleConfirmBooking}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer"
              >
                Confirm Booking & Send to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          6. SETTINGS & ROLE DRAWER
      ────────────────────────────────────────────────────────── */}
      {isSettingsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-md h-full shadow-2xl flex flex-col ${isDarkMode ? 'bg-[#111b21]' : 'bg-white'}`}>
            <div className="h-[60px] bg-gradient-to-r from-[#075E54] via-[#008069] to-[#128C7E] text-white px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsDrawerOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold">Settings & Switch Role</h3>
              </div>
              <button
                onClick={() => setIsSettingsDrawerOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Profile Card */}
              <div className={`flex items-center gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#e7fce3]'}`}>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-200 border-2 border-[#25D366] flex items-center justify-center font-bold text-xl text-[#008069]">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className={`text-base font-bold ${textPrimary}`}>
                    {user?.name || 'Guest User'}
                  </h3>
                  <p className={`text-xs ${textSecondary}`}>
                    {user?.mobileNumber || 'Not logged in'}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[11px] font-bold rounded-md ${
                    isDarkMode
                      ? 'bg-[#005c4b] text-white'
                      : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30'
                  }`}>
                    Role: {activeRole || 'CUSTOMER'}
                  </span>
                </div>
              </div>

              {/* Role Switcher */}
              <div className="space-y-3">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                  Switch Active Role
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    UserRole.CUSTOMER,
                    UserRole.COUNSELOR,
                    UserRole.PROVIDER,
                    UserRole.ADMIN,
                  ].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setRole(role);
                        toast.success(`Role switched to ${role}`);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        activeRole === role
                          ? isDarkMode
                            ? 'bg-[#005c4b] border-[#25D366] text-white'
                            : 'bg-[#e7fce3] border-[#25D366] text-[#075E54]'
                          : isDarkMode
                          ? 'bg-[#202c33] border-transparent text-[#8696a0] hover:bg-[#2a3942]'
                          : 'bg-[#f0f2f5] border-transparent text-[#54656f] hover:bg-[#e9edef]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout button */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    toast.info('Logged out');
                    setIsSettingsDrawerOpen(false);
                  }}
                  className="w-full py-3 bg-rose-500/10 text-rose-500 font-bold text-xs rounded-xl hover:bg-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          7. WHATSAPP STATUS STORIES VIEWER
      ────────────────────────────────────────────────────────── */}
      {isStatusViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full h-[600px] bg-zinc-900 rounded-3xl overflow-hidden flex flex-col relative text-white border border-zinc-800 shadow-2xl">
            {/* Story Progress Bars */}
            <div className="p-3 flex items-center gap-1.5 z-20">
              {STATUS_STORIES.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-[#25D366] transition-all duration-300 ${
                      i < activeStatusIndex
                        ? 'w-full'
                        : i === activeStatusIndex
                        ? 'w-full animate-pulse'
                        : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="px-4 py-2 flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                  {STATUS_STORIES[activeStatusIndex].avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{STATUS_STORIES[activeStatusIndex].author}</h4>
                  <p className="text-[11px] text-zinc-400">{STATUS_STORIES[activeStatusIndex].time}</p>
                </div>
              </div>
              <button
                onClick={() => setIsStatusViewerOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Story Content Canvas with WhatsApp Brand Gradient */}
            <div
              className={`flex-1 p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br ${STATUS_STORIES[activeStatusIndex].color} relative`}
            >
              <h2 className="text-2xl font-black leading-tight drop-shadow-md">
                {STATUS_STORIES[activeStatusIndex].title}
              </h2>
              <p className="text-sm text-white/90 mt-4 leading-relaxed max-w-xs drop-shadow">
                {STATUS_STORIES[activeStatusIndex].caption}
              </p>

              {/* Prev / Next Click areas */}
              <button
                onClick={() => setActiveStatusIndex((prev) => Math.max(0, prev - 1))}
                className="absolute left-0 top-0 bottom-0 w-1/3 opacity-0 cursor-pointer"
              />
              <button
                onClick={() =>
                  setActiveStatusIndex((prev) =>
                    prev + 1 < STATUS_STORIES.length ? prev + 1 : 0
                  )
                }
                className="absolute right-0 top-0 bottom-0 w-1/3 opacity-0 cursor-pointer"
              />
            </div>

            {/* Bottom Reply Bar */}
            <div className="p-4 bg-zinc-950/80 flex items-center gap-3 z-20">
              <input
                type="text"
                placeholder="Reply to status..."
                className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-xs text-white outline-none border border-zinc-700 focus:border-[#25D366]"
              />
              <button
                onClick={() => {
                  toast.success('Reply sent to counselor!');
                  setIsStatusViewerOpen(false);
                }}
                className="p-2 rounded-full bg-[#25D366] text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          8. CALLING MODAL
      ────────────────────────────────────────────────────────── */}
      {isCallingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-white flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-3xl mx-auto border-2 border-[#25D366]/40">
                {activeService?.category?.iconUrl || '🛠️'}
              </div>
              <h3 className="text-lg font-bold">{activeService?.name || 'Super app Counselor'}</h3>
              <p className="text-xs text-zinc-400">
                {callDuration === 0
                  ? 'Connecting...'
                  : `${String(Math.floor(callDuration / 60)).padStart(2, '0')}:${String(
                      callDuration % 60
                    ).padStart(2, '0')}`}
              </p>
            </div>

            {callType === 'video' && (
              <div className="w-full h-32 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 text-xs gap-2">
                <Camera className="w-4 h-4" />
                <span>Live Video Stream Active</span>
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  isMuted ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsCallingModalOpen(false)}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-lg shadow-rose-600/40 cursor-pointer"
              >
                <PhoneMissed className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
