'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { chatService, InChatBookingDto, CustomOfferDto } from '@/services/chat.service';
import { servicesService } from '@/services/services.service';
import { ordersService } from '@/services/orders.service';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth.types';
import { Message, MessageType, ChatSession } from '@/types/chat.types';
import { Order, OrderStatus } from '@/types/order.types';
import {
  Send,
  Sparkles,
  Headphones,
  User,
  ShieldCheck,
  CheckCheck,
  ArrowLeft,
  Clock,
  LogIn,
  AlertCircle,
  RotateCcw,
  Search,
  MessageSquare,
  PlusCircle,
  ChevronRight,
  Info,
  Layers,
  Wrench,
  X,
  Zap,
  Tag,
  CreditCard,
  Banknote,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Gift,
  FileText,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Quick address suggestions for easy 1-click filling
const DHAKA_AREAS = [
  'Dhanmondi, Dhaka',
  'Gulshan-2, Dhaka',
  'Uttara Sector 7, Dhaka',
  'Mirpur-10, Dhaka',
  'Banani, Dhaka',
  'Mohammadpur, Dhaka',
  'Bashundhara R/A, Dhaka',
];

function ChatContent() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');
  const serviceIdParam = searchParams.get('serviceId') || '';
  const router = useRouter();

  const { user, isAuthenticated, activeRole } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchConvQuery, setSearchConvQuery] = useState('');
  const [mobileActiveTab, setMobileActiveTab] = useState<'LIST' | 'CHAT' | 'INFO'>('CHAT');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // In-Chat Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingCustomPrice, setBookingCustomPrice] = useState<number | null>(null);
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingTime, setBookingTime] = useState('Today, Within 2 Hours');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingPaymentMode, setBookingPaymentMode] = useState<'CASH' | 'BKASH' | 'NAGAD' | 'CARD'>('CASH');

  // Custom Offer Modal State (for Counselor/Provider/Admin)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(1500);
  const [offerDescription, setOfferDescription] = useState('');
  const [offerDuration, setOfferDuration] = useState('Standard Same-Day Dispatch');

  // Cancel confirmation state
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // 1. Query all user conversations list (Section 1 Sidebar)
  const {
    data: conversations = [],
    isLoading: isConversationsLoading,
  } = useQuery({
    queryKey: ['user-conversations'],
    queryFn: () => chatService.getUserConversations(),
    enabled: isAuthenticated,
    refetchInterval: 4000,
  });

  // 2. Query Orders to check for active running orders
  const {
    data: allOrders = [],
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersService.getOrders(),
    enabled: isAuthenticated,
    refetchInterval: 3500,
  });

  // 3. Fetch Service details if serviceId is provided in URL
  const { data: directServiceDetail } = useQuery({
    queryKey: ['chat-service-detail', serviceIdParam],
    queryFn: () => servicesService.getServiceById(serviceIdParam),
    enabled: !!serviceIdParam && serviceIdParam !== 'general-service' && serviceIdParam !== 'all-popular',
  });

  // 4. Initialize or get conversation for target serviceId / providerId
  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ['chat-session', serviceIdParam, providerId],
    queryFn: async () => {
      const res = await chatService.getOrCreateConversation({
        serviceId: serviceIdParam || undefined,
        providerId: providerId || undefined,
      });
      if (res?.id) {
        setActiveSessionId(res.id);
      }
      return res;
    },
    enabled: isAuthenticated,
    retry: 2,
  });

  // Keep activeSessionId in sync with resolved session or first available conversation
  const effectiveSessionId = activeSessionId || session?.id || conversations?.[0]?.id || null;

  useEffect(() => {
    if (session?.id && !activeSessionId) {
      setActiveSessionId(session.id);
    } else if (!activeSessionId && conversations.length > 0 && !serviceIdParam) {
      setActiveSessionId(conversations[0].id);
    }
  }, [session, activeSessionId, conversations, serviceIdParam]);

  // Current active conversation object
  const currentConversation = useMemo(() => {
    return conversations.find((c) => c.id === effectiveSessionId) || session || null;
  }, [conversations, effectiveSessionId, session]);

  // Selected Service Detail (from active conversation or direct service detail query)
  const serviceDetail = currentConversation?.service || directServiceDetail || null;

  // Compute if there is an active running order for this service / conversation
  const currentActiveOrder = useMemo(() => {
    const currentServiceId = serviceDetail?.id || currentConversation?.serviceId || serviceIdParam;
    if (!currentServiceId || !Array.isArray(allOrders)) return null;

    return allOrders.find((o) => {
      const isTargetService = o.serviceId === currentServiceId;
      const isRunning =
        o.orderStatus === OrderStatus.PENDING ||
        o.orderStatus === OrderStatus.ACCEPTED ||
        o.orderStatus === OrderStatus.IN_PROGRESS;
      return isTargetService && isRunning;
    }) || null;
  }, [allOrders, serviceDetail, currentConversation, serviceIdParam]);

  // Filtered conversation list by search query
  const filteredConversations = useMemo(() => {
    if (!searchConvQuery.trim()) return conversations;
    const q = searchConvQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.service?.name?.toLowerCase().includes(q) ||
        c.service?.category?.name?.toLowerCase().includes(q) ||
        c.messages?.[0]?.text?.toLowerCase().includes(q)
    );
  }, [conversations, searchConvQuery]);

  // 5. Query Messages for the currently active session
  const { data: rawMessages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat-messages', effectiveSessionId],
    queryFn: () => (effectiveSessionId ? chatService.getMessages(effectiveSessionId) : []),
    enabled: !!effectiveSessionId && isAuthenticated,
    refetchInterval: 2500, // Live polling
  });

  // Sort messages chronologically (oldest at top, newest at bottom)
  const messages = useMemo(() => {
    if (!Array.isArray(rawMessages)) return [];
    return [...rawMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [rawMessages]);

  // 6. Send message mutation with instant optimistic UI
  const sendMutation = useMutation({
    mutationFn: ({ text, sessionId }: { text: string; sessionId: string }) =>
      chatService.sendMessage({
        conversationId: sessionId,
        text,
        type: MessageType.TEXT,
      }),
    onMutate: async ({ text, sessionId }) => {
      setInputText('');
      await queryClient.cancelQueries({ queryKey: ['chat-messages', sessionId] });
      const previousMessages = queryClient.getQueryData<Message[]>(['chat-messages', sessionId]) || [];

      const optimisticMsg: Message = {
        id: 'temp-' + Date.now(),
        sessionId: sessionId,
        senderId: user?.id || 'me',
        text,
        fileUrl: null,
        type: MessageType.TEXT,
        isRead: false,
        isSend: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(['chat-messages', sessionId], [
        ...previousMessages,
        optimisticMsg,
      ]);

      return { previousMessages, sessionId };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousMessages && context?.sessionId) {
        queryClient.setQueryData(['chat-messages', context.sessionId], context.previousMessages);
      }
      toast.error(err.response?.data?.message || err.message || 'Failed to send message');
    },
    onSettled: (_data, _err, variables) => {
      if (variables?.sessionId) {
        queryClient.invalidateQueries({
          queryKey: ['chat-messages', variables.sessionId],
        });
        queryClient.invalidateQueries({
          queryKey: ['user-conversations'],
        });
      }
    },
  });

  // 7. In-Chat Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: (dto: InChatBookingDto) => chatService.createInChatBooking(dto),
    onSuccess: () => {
      toast.success('🎉 Service booked successfully from chat!');
      setIsBookingModalOpen(false);
      setBookingNotes('');
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      if (effectiveSessionId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', effectiveSessionId] });
        queryClient.invalidateQueries({ queryKey: ['user-conversations'] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to confirm booking.');
    },
  });

  // 8. Cancel Order Mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersService.updateStatus(orderId, OrderStatus.CANCELLED),
    onSuccess: (updated) => {
      toast.success(`Order #${updated.id.slice(0, 8).toUpperCase()} has been cancelled.`);
      setIsCancelConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      if (effectiveSessionId) {
        // Send a notification in chat
        chatService.sendMessage({
          conversationId: effectiveSessionId,
          text: `❌ Order #${updated.id.slice(0, 8).toUpperCase()} was cancelled. You can now request a new consultation or place a fresh booking.`,
          type: MessageType.TEXT,
        });
        queryClient.invalidateQueries({ queryKey: ['chat-messages', effectiveSessionId] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to cancel order.');
    },
  });

  // 8.5 Start Order Service Mutation (For Provider / Technician)
  const startOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersService.updateStatus(orderId, OrderStatus.IN_PROGRESS),
    onSuccess: (updated) => {
      toast.success(`🚀 Order #${updated.id.slice(0, 8).toUpperCase()} started! Work is now IN_PROGRESS.`);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      if (effectiveSessionId) {
        chatService.sendMessage({
          conversationId: effectiveSessionId,
          text: `🚀 Provider/Technician has arrived on site and started service work for Order #${updated.id.slice(0, 8).toUpperCase()}.`,
          type: MessageType.TEXT,
        });
        queryClient.invalidateQueries({ queryKey: ['chat-messages', effectiveSessionId] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to start service work.');
    },
  });

  // 9. Complete Order Mutation (For Customer or Provider)
  const completeOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersService.updateStatus(orderId, OrderStatus.COMPLETED),
    onSuccess: (updated) => {
      toast.success(`Order #${updated.id.slice(0, 8).toUpperCase()} marked as COMPLETED!`);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      if (effectiveSessionId) {
        chatService.sendMessage({
          conversationId: effectiveSessionId,
          text: `✅ Order #${updated.id.slice(0, 8).toUpperCase()} marked as COMPLETED. 3-Day Free Warranty is now active. Thank you!`,
          type: MessageType.TEXT,
        });
        queryClient.invalidateQueries({ queryKey: ['chat-messages', effectiveSessionId] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete order.');
    },
  });

  // 10. Custom Offer Mutation (For Providers / Counselors / Admins)
  const offerMutation = useMutation({
    mutationFn: (dto: CustomOfferDto) => chatService.sendCustomOffer(dto),
    onSuccess: () => {
      toast.success('💼 Custom offer dispatched to customer!');
      setIsOfferModalOpen(false);
      setOfferDescription('');
      if (effectiveSessionId) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', effectiveSessionId] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to dispatch offer.');
    },
  });

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || sendMutation.isPending) return;

    let targetSessionId = effectiveSessionId;
    if (!targetSessionId) {
      try {
        const newSession = await chatService.getOrCreateConversation({
          serviceId: serviceIdParam || undefined,
          providerId: providerId || undefined,
        });
        if (newSession?.id) {
          targetSessionId = newSession.id;
          setActiveSessionId(newSession.id);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Could not connect to consultation session.');
        return;
      }
    }

    if (targetSessionId) {
      sendMutation.mutate({ text: textToSend, sessionId: targetSessionId });
    }
  };

  const handleQuickReply = async (text: string) => {
    if (sendMutation.isPending) return;
    let targetSessionId = effectiveSessionId;
    if (!targetSessionId) {
      try {
        const newSession = await chatService.getOrCreateConversation({
          serviceId: serviceIdParam || undefined,
          providerId: providerId || undefined,
        });
        if (newSession?.id) {
          targetSessionId = newSession.id;
          setActiveSessionId(newSession.id);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Could not connect to consultation session.');
        return;
      }
    }

    if (targetSessionId) {
      sendMutation.mutate({ text, sessionId: targetSessionId });
    }
  };

  const handleSelectConversation = (conv: ChatSession) => {
    setActiveSessionId(conv.id);
    setMobileActiveTab('CHAT');
    router.replace(`/chat?serviceId=${conv.serviceId}${conv.providerId ? `&providerId=${conv.providerId}` : ''}`, {
      scroll: false,
    });
  };

  // Open booking modal prefilled with custom price or base price
  const handleOpenBooking = (customPrice?: number) => {
    if (currentActiveOrder) {
      toast.error(
        `🚫 You already have an active running order (#${currentActiveOrder.id.slice(0, 8).toUpperCase()}). Please complete or cancel it before placing another order.`,
        { duration: 5000 }
      );
      return;
    }
    const base = Number(serviceDetail?.basePrice || 500);
    setBookingCustomPrice(customPrice !== undefined ? customPrice : base);
    setIsBookingModalOpen(true);
  };

  // Execute in-chat order booking
  const handleConfirmBooking = () => {
    if (currentActiveOrder) {
      toast.error(
        `🚫 You already have an active running order (#${currentActiveOrder.id.slice(0, 8).toUpperCase()}). Please complete or cancel it first.`
      );
      return;
    }
    if (!effectiveSessionId) {
      toast.error('Active consultation session required.');
      return;
    }
    const serviceId = serviceDetail?.id || currentConversation?.serviceId || serviceIdParam;
    if (!serviceId) {
      toast.error('Please select a service before placing an order.');
      return;
    }

    bookingMutation.mutate({
      conversationId: effectiveSessionId,
      serviceId,
      providerId: currentConversation?.providerId || undefined,
      customPrice: bookingCustomPrice || undefined,
      addressText: bookingAddress.trim() || 'Dhanmondi, Dhaka (Confirmed via Chat)',
      preferredTime: bookingTime || 'Today, Within 2 Hours',
      notes: bookingNotes.trim() || undefined,
      paymentMode: bookingPaymentMode,
    });
  };

  // Dispatch custom offer
  const handleSendOffer = () => {
    if (!effectiveSessionId) {
      toast.error('Active session required.');
      return;
    }
    if (!offerDescription.trim()) {
      toast.error('Please describe what is included in this offer.');
      return;
    }
    offerMutation.mutate({
      conversationId: effectiveSessionId,
      serviceId: serviceDetail?.id || currentConversation?.serviceId,
      customPrice: Number(offerPrice) || 1000,
      description: offerDescription.trim(),
      duration: offerDuration,
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper for category emoji
  const getCategoryEmoji = (catName?: string) => {
    const name = catName?.toLowerCase() || '';
    if (name.includes('ac')) return '❄️';
    if (name.includes('clean')) return '🧹';
    if (name.includes('elect')) return '⚡';
    if (name.includes('plumb')) return '🚰';
    if (name.includes('paint')) return '🎨';
    if (name.includes('appliance') || name.includes('fridge')) return '🧊';
    return '🛠️';
  };

  // Safe JSON parser for OFFER and ORDER_CONFIRMED messages
  const parseJsonMessage = (text?: string | null) => {
    if (!text || typeof text !== 'string') return null;
    if (!text.trim().startsWith('{')) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const isStaffRole =
    activeRole === UserRole.PROVIDER ||
    activeRole === UserRole.COUNSELOR ||
    activeRole === UserRole.ADMIN ||
    activeRole === UserRole.MANAGER ||
    activeRole === UserRole.SUPPORT;

  // If Not Authenticated -> Show friendly Login card
  if (!isAuthenticated) {
    const redirectUrl = `/chat?serviceId=${encodeURIComponent(serviceIdParam || '')}${
      providerId ? `&providerId=${encodeURIComponent(providerId)}` : ''
    }`;

    return (
      <main className="flex-1 max-w-lg w-full mx-auto p-6 flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Headphones className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white">
              Login to Consult Support Counselor
            </h2>
            <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
              Please log in with your phone number to initialize your encrypted Flow A Counselor session, request price assessments, and get assigned verified technicians.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login with Mobile OTP</span>
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white block cursor-pointer"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-[1600px] w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col min-h-[calc(100vh-4.5rem)]">
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center justify-between p-1.5 mb-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setMobileActiveTab('LIST')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveTab === 'LIST'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Chats ({conversations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActiveTab('CHAT')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveTab === 'CHAT'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Live Chat</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActiveTab('INFO')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            mobileActiveTab === 'INFO'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Service & Order {currentActiveOrder && '🔴'}</span>
        </button>
      </div>

      {/* Main 3-Column Box */}
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[720px] max-h-[860px]">
        {/* ============================================================ */}
        {/* SECTION 1: CONVERSATION / CHAT LIST SIDEBAR (LEFT)           */}
        {/* ============================================================ */}
        <div
          className={`w-full md:w-80 lg:w-[320px] shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 flex flex-col justify-between ${
            mobileActiveTab === 'LIST' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Top: Header & Search */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-600/30">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-black text-zinc-900 dark:text-white">
                  Consultations
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-full">
                  {conversations.length}
                </span>
              </div>

              <Link
                href="/"
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                title="Browse more services"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            </div>

            {/* Search within conversations */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchConvQuery}
                onChange={(e) => setSearchConvQuery(e.target.value)}
                placeholder="Search AC, cleaning, wiring..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
              {searchConvQuery && (
                <button
                  type="button"
                  onClick={() => setSearchConvQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Middle: Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {isConversationsLoading && conversations.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400 space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading consultations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400 space-y-3">
                <Sparkles className="w-8 h-8 text-emerald-500/50 mx-auto" />
                <p className="font-semibold text-zinc-300">No consultations found</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Browse our home & technical services and consult our counselor for any service!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-600/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Browse Services</span>
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === effectiveSessionId;
                const catName = conv.service?.category?.name || 'Service';
                const serviceName = conv.service?.name || 'On-Demand Service';
                const parsedMsg = parseJsonMessage(conv.messages?.[0]?.text);
                const latestMsg = parsedMsg?.type === 'OFFER'
                  ? `💼 Custom Offer: ৳${parsedMsg.price}`
                  : parsedMsg?.type === 'ORDER_CONFIRMED'
                  ? `🎉 Order Placed: #${parsedMsg.shortOrderId}`
                  : conv.messages?.[0]?.text || 'No messages yet';
                const emoji = getCategoryEmoji(catName);

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-900/20'
                        : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:border-zinc-700'
                    }`}
                  >
                    {/* Emoji / Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base shadow-sm ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <span>{emoji}</span>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                          {catName}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {new Date(conv.updatedAt || conv.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold line-clamp-1 ${
                          isSelected
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-zinc-900 dark:text-zinc-100'
                        }`}
                      >
                        {serviceName}
                      </h4>

                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {latestMsg}
                      </p>
                    </div>

                    {/* Active Selected Pulse */}
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Sidebar Note */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/50 text-[11px] text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>In-Chat 1-Click Booking Enabled</span>
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: ACTIVE CONVERSATION STREAM & INPUT (CENTER)       */}
        {/* ============================================================ */}
        <div
          className={`flex-1 flex flex-col justify-between bg-white dark:bg-zinc-900 min-w-0 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 ${
            mobileActiveTab === 'CHAT' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Support Counselor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Online • Flow A Smart Routing • Response &lt; 1 min
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* If staff, offer creator button */}
              {isStaffRole && (
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(true)}
                  className="text-xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/80 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Send Offer</span>
                </button>
              )}

              {/* Fast 1-Click Book header button for customer */}
              {!currentActiveOrder ? (
                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Book Now</span>
                </button>
              ) : (
                <span className="px-2.5 py-1 text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Order #{currentActiveOrder.id.slice(0, 8).toUpperCase()} Active</span>
                </span>
              )}

              <Link
                href="/"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Services</span>
              </Link>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[540px]">
            {isSessionLoading ? (
              <div className="text-center py-16 text-xs text-zinc-400 space-y-3">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Initializing counselor consultation session...</p>
              </div>
            ) : isSessionError ? (
              <div className="text-center py-12 text-xs text-red-500 space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p>Could not initialize chat session.</p>
                <button
                  onClick={() => refetchSession()}
                  className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            ) : isMessagesLoading && messages.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-400">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-xs text-zinc-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                  Welcome to Master Services Live Consultation
                </h4>
                <p className="max-w-md mx-auto text-zinc-500 text-xs">
                  Ask questions regarding pricing, warranty, or scheduling. You can also accept customized offers or click <b>Book Now</b> anytime to dispatch technicians!
                </p>
              </div>
            ) : (
              messages.map((m: Message) => {
                const isMine = m.senderId === user?.id;
                const parsedJson = parseJsonMessage(m.text);

                // -------------------------------------------------------------
                // A. SPECIAL OFFER CARD (Fiverr Style MessageType.OFFER)
                // -------------------------------------------------------------
                if (m.type === MessageType.OFFER || parsedJson?.type === 'OFFER') {
                  const offerPriceValue = parsedJson?.price || 1500;
                  const offerDesc = parsedJson?.description || m.text || 'Custom Service Package';
                  const offerDurationText = parsedJson?.duration || 'Standard Dispatch';

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col items-center my-3 w-full"
                    >
                      <div className="w-full max-w-md bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 dark:from-amber-950/40 dark:via-zinc-900 dark:to-emerald-950/40 border-2 border-amber-500/40 dark:border-amber-500/50 rounded-3xl p-5 shadow-xl space-y-4">
                        {/* Header Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                Specialized Custom Offer
                              </span>
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                                {serviceDetail?.name || 'On-Demand Service Solution'}
                              </h4>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                              ৳ {offerPriceValue.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Description Box */}
                        <div className="bg-white/80 dark:bg-zinc-800/80 p-3.5 rounded-2xl border border-amber-200/50 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed space-y-2">
                          <p>{offerDesc}</p>
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {offerDurationText}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              3-Day Warranty Included
                            </span>
                          </div>
                        </div>

                        {/* Accept & Book CTA */}
                        <div className="flex items-center gap-2 pt-1">
                          {isMine ? (
                            <div className="w-full py-2.5 px-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                              <span>Offer Dispatched — Waiting for Customer to Accept & Book</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenBooking(offerPriceValue)}
                              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <Zap className="w-4 h-4" />
                              <span>
                                {currentActiveOrder
                                  ? 'Active Order Running'
                                  : `Accept & Book (৳ ${offerPriceValue.toLocaleString()})`}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-zinc-400 mt-1">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // B. ORDER CONFIRMED AUTOMATED CARD (MessageType.SYSTEM)
                // -------------------------------------------------------------
                if (m.type === MessageType.SYSTEM && parsedJson?.type === 'ORDER_CONFIRMED') {
                  return (
                    <div
                      key={m.id}
                      className="flex flex-col items-center my-3 w-full"
                    >
                      <div className="w-full max-w-md bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-xl space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                Order Confirmed & Dispatched
                              </span>
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                                {parsedJson.serviceName}
                              </h4>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 text-[11px] font-extrabold bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 rounded-lg">
                            #{parsedJson.shortOrderId || 'ORDER'}
                          </span>
                        </div>

                        {/* Order Snapshot Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-900/90 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-medium">Agreed Price</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              ৳ {Number(parsedJson.price || 0).toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-zinc-400 block font-medium">Payment Mode</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">
                              {parsedJson.paymentMode === 'CASH' ? '💵 Cash on Delivery' : parsedJson.paymentMode}
                            </span>
                          </div>

                          <div className="col-span-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                            <span className="text-[10px] text-zinc-400 block font-medium">Delivery Address</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                              📍 {parsedJson.address}
                            </span>
                          </div>

                          <div className="col-span-2">
                            <span className="text-[10px] text-zinc-400 block font-medium">Scheduled Time</span>
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                              ⏰ {parsedJson.preferredTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold px-1">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> 3-Day Warranty Active
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Technician Assigned
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-zinc-400 mt-1">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                }

                // -------------------------------------------------------------
                // C. STANDARD CHAT BUBBLE (MessageType.TEXT / MessageType.SYSTEM)
                // -------------------------------------------------------------
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isMine ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm ${
                        m.type === MessageType.SYSTEM
                          ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium'
                          : isMine
                          ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm shadow-emerald-600/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 px-1 flex items-center gap-1">
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMine && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/30 flex items-center gap-2 overflow-x-auto text-[11px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-zinc-400 shrink-0 font-medium">Quick:</span>
            {[
              'Can I get a custom quote?',
              'Can a verified technician come today?',
              'What is included in the 3-day warranty?',
              'Please dispatch technician to my address',
            ].map((msg) => (
              <button
                key={msg}
                type="button"
                onClick={() => handleQuickReply(msg)}
                disabled={sendMutation.isPending}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 text-nowrap transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
              >
                {msg}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type message, ask for custom quote, or negotiate..."
              disabled={sendMutation.isPending}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sendMutation.isPending}
              className="p-2.5 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">
                {sendMutation.isPending ? 'Sending...' : 'Send'}
              </span>
            </button>
          </form>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: SESSION INFO & ROUTING DETAILS (RIGHT SIDEBAR)     */}
        {/* ============================================================ */}
        <div
          className={`w-full md:w-72 lg:w-80 shrink-0 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between overflow-y-auto ${
            mobileActiveTab === 'INFO' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-4">
            {/* Counselor Routing Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Flow A Smart Routing
                </h2>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Least-Loaded Counselor
                </p>
              </div>
            </div>

            {/* Selected Service Card */}
            {serviceDetail ? (
              <div className="p-4 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {serviceDetail.category?.name || 'Selected Service'}
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ৳ {Number(serviceDetail.basePrice || 500).toFixed(0)}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2">
                  {serviceDetail.name}
                </h3>
                {serviceDetail.description && (
                  <p className="text-[11px] text-zinc-500 line-clamp-2">
                    {serviceDetail.description}
                  </p>
                )}
                <div className="pt-1 flex items-center gap-2 text-[10px] text-zinc-400 font-semibold">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>Est. Duration: {serviceDetail.durationMin || 45} mins</span>
                </div>

                {/* ACTIVE RUNNING ORDER CARD OR BOOKING BUTTON */}
                {currentActiveOrder ? (
                  <div className="mt-3 p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        Active Order Running
                      </span>
                      <span className="px-2 py-0.5 font-black text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-md">
                        #{currentActiveOrder.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-zinc-600 dark:text-zinc-300">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {currentActiveOrder.orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-bold">
                          ৳ {Number(currentActiveOrder.totalPrice || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="pt-1 space-y-1.5">
                      <Link
                        href={`/orders/${currentActiveOrder.id}`}
                        className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Order Details</span>
                      </Link>

                      {/* STAGE 1: PENDING / ACCEPTED */}
                      {(currentActiveOrder.orderStatus === OrderStatus.PENDING || currentActiveOrder.orderStatus === OrderStatus.ACCEPTED) && (
                        <>
                          {/* Provider / Staff starts the work */}
                          {isStaffRole && (
                            <button
                              type="button"
                              onClick={() => startOrderMutation.mutate(currentActiveOrder.id)}
                              disabled={startOrderMutation.isPending}
                              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/30 disabled:opacity-50"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>🚀 Start Service Work</span>
                            </button>
                          )}

                          {/* Customer can cancel before work starts */}
                          {!isStaffRole && (
                            <button
                              type="button"
                              onClick={() => setIsCancelConfirmOpen(true)}
                              disabled={cancelOrderMutation.isPending}
                              className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel Order</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* STAGE 2: IN_PROGRESS */}
                      {currentActiveOrder.orderStatus === OrderStatus.IN_PROGRESS && (
                        <>
                          {/* Customer confirms completion */}
                          {!isStaffRole ? (
                            <button
                              type="button"
                              onClick={() => completeOrderMutation.mutate(currentActiveOrder.id)}
                              disabled={completeOrderMutation.isPending}
                              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/30 disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>✅ Confirm Service Done & Complete</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => completeOrderMutation.mutate(currentActiveOrder.id)}
                              disabled={completeOrderMutation.isPending}
                              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>🏁 Mark Service Finished</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <p className="text-[10px] text-zinc-400 text-center leading-tight pt-1">
                      ⚠️ You cannot place another order until this order is completed or cancelled.
                    </p>
                  </div>
                ) : (
                  /* Primary Action Button: 1-Click In-Chat Booking */
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>⚡ Book & Confirm This Service</span>
                  </button>
                )}
              </div>
            ) : null}

            {/* Session Channel Details */}
            <div className="p-4 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Channel
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md">
                  {currentConversation?.providerId ? 'DIRECT_PROVIDER' : 'FLOW_A_COUNSELOR'}
                </span>
              </div>

              <div className="text-xs text-zinc-500 leading-relaxed">
                {currentConversation?.providerId
                  ? 'Connected directly with the selected expert provider.'
                  : 'Automatically matched with the next available support counselor.'}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>3-Day Free Warranty Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Master Escrow Safe Booking</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            💡 You can negotiate pricing, request custom quotes, and place your order directly within this chat!
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CANCEL ORDER CONFIRMATION MODAL                              */}
      {/* ============================================================ */}
      {isCancelConfirmOpen && currentActiveOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Cancel Active Order #{currentActiveOrder.id.slice(0, 8).toUpperCase()}?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to cancel this order? Once cancelled, you will be able to book another service or request a new counselor dispatch.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCancelConfirmOpen(false)}
                disabled={cancelOrderMutation.isPending}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={() => cancelOrderMutation.mutate(currentActiveOrder.id)}
                disabled={cancelOrderMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {cancelOrderMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1-CLICK IN-CHAT BOOKING MODAL (POPUP)                         */}
      {/* ============================================================ */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                    Confirm In-Chat Booking
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Instant confirmation • Automated technician assignment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Service & Price Summary Banner */}
            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
                  Service Selected
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {serviceDetail?.name || 'On-Demand Service'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-medium">Total Amount</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ৳ {(bookingCustomPrice || Number(serviceDetail?.basePrice) || 500).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Address Form Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Service Address</span>
              </label>
              <input
                type="text"
                value={bookingAddress}
                onChange={(e) => setBookingAddress(e.target.value)}
                placeholder="House, Road, Area (e.g. Dhanmondi, Dhaka)"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
              />
              {/* Quick Area Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {DHAKA_AREAS.slice(0, 4).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setBookingAddress(area)}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    {area.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Time Form Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Preferred Time Slot</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Today, Within 2 Hours',
                  'Tomorrow Morning (10 AM)',
                  'Tomorrow Afternoon (3 PM)',
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setBookingTime(slot)}
                    className={`p-2 text-left text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      bookingTime === slot
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Mode</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingPaymentMode('CASH')}
                  className={`p-2.5 text-left rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    bookingPaymentMode === 'CASH'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold block">Cash on Delivery</span>
                    <span className="text-[10px] text-zinc-400">Pay after completion</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingPaymentMode('BKASH')}
                  className={`p-2.5 text-left rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    bookingPaymentMode === 'BKASH'
                      ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Zap className="w-4 h-4 text-pink-600" />
                  <div>
                    <span className="text-xs font-bold block">bKash / Online</span>
                    <span className="text-[10px] text-zinc-400">Escrow Protected</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Special Instructions (Optional)
              </label>
              <input
                type="text"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="e.g. Please bring ladder, 2 ton AC unit..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                disabled={bookingMutation.isPending}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={bookingMutation.isPending}
                className="flex-[2] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {bookingMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Book (৳ {(bookingCustomPrice || Number(serviceDetail?.basePrice) || 500).toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SEND CUSTOM OFFER MODAL (FOR COUNSELOR / PROVIDER)           */}
      {/* ============================================================ */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                    Create Custom In-Chat Offer
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Propose specialized package & custom price to customer
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Offer Price Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Custom Offer Price (৳ BDT)
              </label>
              <input
                type="number"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                placeholder="e.g. 1800"
                className="w-full px-3.5 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Offer Description Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Offer Description & Deliverables
              </label>
              <textarea
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                rows={3}
                placeholder="e.g. AC Deep Chemical Cleaning + Jet Wash + 1lb Freon Gas topup included..."
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Turnaround / Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Estimated Duration / Turnaround
              </label>
              <input
                type="text"
                value={offerDuration}
                onChange={(e) => setOfferDuration(e.target.value)}
                placeholder="e.g. Same-Day Dispatch (Within 3 Hours)"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                disabled={offerMutation.isPending}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendOffer}
                disabled={offerMutation.isPending || !offerDescription.trim()}
                className="flex-[2] py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {offerMutation.isPending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Offer...</span>
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4" />
                    <span>Send Custom Offer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
            Initializing Flow A Chat routing...
          </div>
        }
      >
        <ChatContent />
      </Suspense>
    </div>
  );
}
