'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ChatMessage, OrderCardData } from '@/types/super-app.types';
import { Service } from '@/types/service.types';

interface UseSuperAppChatProps {
  playSound: (type: 'send' | 'receive') => void;
}

export function useSuperAppChat({ playSound }: UseSuperAppChatProps) {
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [serviceMessages, setServiceMessages] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('master_service_messages');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });
  const [inputText, setInputText] = useState('');
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('LIST');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track latest chat activity timestamps so active conversations jump to top
  const [serviceLastActivity, setServiceLastActivity] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('master_service_activity');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  // Sync activity map to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(serviceLastActivity).length > 0) {
      try {
        localStorage.setItem('master_service_activity', JSON.stringify(serviceLastActivity));
      } catch {
        // ignore
      }
    }
  }, [serviceLastActivity]);

  // Sync chat messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(serviceMessages).length > 0) {
      try {
        localStorage.setItem('master_service_messages', JSON.stringify(serviceMessages));
      } catch {
        // ignore
      }
    }
  }, [serviceMessages]);

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle service selection & initial greetings
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
          },
        },
      ];
      setServiceMessages((prev) => ({ ...prev, [service.id]: initialMsgs }));
    }
  };

  // Send message with strict auth check
  const handleSendMessage = (isAuthenticated: boolean, onRequireAuth: () => void) => {
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to chat with service counselors.');
      onRequireAuth();
      return;
    }
    if (!inputText.trim() || !activeServiceId) return;

    const msgText = inputText.trim();
    const sId = activeServiceId;
    setInputText('');
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
    setServiceLastActivity((prev) => ({ ...prev, [sId]: Date.now() }));

    // Simulated counselor reply after 1.2s
    setTimeout(() => {
      playSound('receive');
      const counselorReply: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'them',
        text: `Got your message regarding "${msgText}". Our certified technician is on standby. Click [Book Service] whenever you are ready!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setServiceMessages((prev) => ({
        ...prev,
        [sId]: [...(prev[sId] || []), counselorReply],
      }));
      setServiceLastActivity((prev) => ({ ...prev, [sId]: Date.now() }));
    }, 1200);
  };

  // Send voice note with auth check
  const handleSendVoiceNote = (isAuthenticated: boolean, onRequireAuth: () => void) => {
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to send voice notes.');
      onRequireAuth();
      return;
    }
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
    setServiceLastActivity((prev) => ({ ...prev, [sId]: Date.now() }));
    toast.success('Voice message sent');
  };

  // React to message with emoji
  const handleReactToMessage = (messageId: string, emoji: string) => {
    if (!activeServiceId) return;
    setServiceMessages((prev) => ({
      ...prev,
      [activeServiceId]: (prev[activeServiceId] || []).map((m) =>
        m.id === messageId ? { ...m, reaction: emoji } : m
      ),
    }));
  };

  // Active order computed for current active service
  const activeOrder: OrderCardData | null = useMemo(() => {
    if (!activeServiceId) return null;
    const msgs = serviceMessages[activeServiceId] || [];
    const orderMsgs = msgs.filter((m) => m.type === 'order_card' && m.orderCard);
    if (orderMsgs.length === 0) return null;
    return orderMsgs[orderMsgs.length - 1].orderCard || null;
  }, [serviceMessages, activeServiceId]);

  const activeOrderMessageId = useMemo(() => {
    if (!activeServiceId) return null;
    const msgs = serviceMessages[activeServiceId] || [];
    const orderMsgs = msgs.filter((m) => m.type === 'order_card' && m.orderCard);
    if (orderMsgs.length === 0) return null;
    return orderMsgs[orderMsgs.length - 1].id;
  }, [serviceMessages, activeServiceId]);

  // Any running order across all services
  const runningOrder: OrderCardData | null = useMemo(() => {
    for (const sId of Object.keys(serviceMessages)) {
      const msgs = serviceMessages[sId] || [];
      const found = msgs
        .slice()
        .reverse()
        .find((m) => m.type === 'order_card' && m.orderCard?.status === 'IN_PROGRESS');
      if (found && found.orderCard) {
        return found.orderCard;
      }
    }
    return null;
  }, [serviceMessages]);

  // Running order specifically for the current active service
  const activeServiceRunningOrder: OrderCardData | null = useMemo(() => {
    if (!activeServiceId) return null;
    const msgs = serviceMessages[activeServiceId] || [];
    const found = msgs
      .slice()
      .reverse()
      .find((m) => m.type === 'order_card' && m.orderCard?.status === 'IN_PROGRESS');
    return found?.orderCard || null;
  }, [serviceMessages, activeServiceId]);

  // Array of service IDs that currently have an IN_PROGRESS order
  const runningServiceIds: string[] = useMemo(() => {
    const ids: string[] = [];
    for (const sId of Object.keys(serviceMessages)) {
      const msgs = serviceMessages[sId] || [];
      const hasRunning = msgs.some(
        (m) => m.type === 'order_card' && m.orderCard?.status === 'IN_PROGRESS'
      );
      if (hasRunning) {
        ids.push(sId);
      }
    }
    return ids;
  }, [serviceMessages]);

  // Confirm in-chat booking with auth check and dispatch Order Card
  const handleConfirmBooking = (
    activeService: Service | null,
    address: string,
    time: string,
    paymentMode: string,
    isAuthenticated: boolean,
    onRequireAuth: () => void,
    onSuccess: () => void
  ) => {
    if (!isAuthenticated) {
      toast.info('Please log in with your phone number to book services.');
      onRequireAuth();
      return;
    }
    if (!activeService || !activeServiceId) return;

    // Rule: Same service-e 2 bar order running kora jabe na, kintu alada alada service-e eksathe running thakte parbe
    if (activeServiceRunningOrder) {
      toast.error(
        `Active Order #${activeServiceRunningOrder.orderId} for "${activeService.name}" is already in progress! Please complete it before booking this service again.`
      );
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const orderCardMsg: ChatMessage = {
      id: 'order-' + Date.now(),
      sender: 'them',
      type: 'order_card',
      text: `🎉 Order #${generatedOrderId} Placed Successfully!`,
      time: currentTime,
      orderCard: {
        orderId: generatedOrderId,
        serviceId: activeService.id,
        serviceName: activeService.name,
        serviceIcon: activeService.category?.iconUrl || '🛠️',
        address,
        scheduleTime: time,
        paymentMode,
        basePrice: activeService.basePrice,
        status: 'IN_PROGRESS',
      },
    };

    setServiceMessages((prev) => ({
      ...prev,
      [activeServiceId]: [...(prev[activeServiceId] || []), orderCardMsg],
    }));
    setServiceLastActivity((prev) => ({ ...prev, [activeServiceId]: Date.now() }));

    playSound('receive');
    toast.success(`Booked ${activeService.name} successfully! Order #${generatedOrderId} is In Progress.`);
    onSuccess();
  };

  // Mark an active order as completed directly from the chat card
  const handleCompleteOrder = (messageId: string, orderId: string) => {
    if (!activeServiceId) return;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setServiceMessages((prev) => {
      const list = prev[activeServiceId] || [];
      return {
        ...prev,
        [activeServiceId]: list.map((msg) => {
          if (msg.id === messageId && msg.orderCard) {
            return {
              ...msg,
              orderCard: {
                ...msg.orderCard,
                status: 'COMPLETED',
                completedAt: currentTime,
              },
            };
          }
          return msg;
        }),
      };
    });

    // Append celebration confirmation notice from the counselor
    const completionNotice: ChatMessage = {
      id: 'compl-' + Date.now(),
      sender: 'them',
      text: `✅ Order #${orderId} has been successfully completed! Thank you for choosing Master Services. Your 7-day service warranty is now active. ⭐⭐⭐⭐⭐`,
      time: currentTime,
      status: 'read',
    };

    setServiceMessages((prev) => ({
      ...prev,
      [activeServiceId]: [...(prev[activeServiceId] || []), completionNotice],
    }));
    setServiceLastActivity((prev) => ({ ...prev, [activeServiceId]: Date.now() }));

    playSound('receive');
    toast.success(`Order #${orderId} marked as COMPLETED! 🎉`);
  };

  const handleClearChat = (serviceId: string) => {
    setServiceMessages((prev) => ({ ...prev, [serviceId]: [] }));
    toast.success('Chat cleared');
  };

  return {
    activeServiceId,
    setActiveServiceId,
    serviceMessages,
    inputText,
    setInputText,
    mobileView,
    setMobileView,
    messagesEndRef,
    scrollToBottom,
    activeOrder,
    activeOrderMessageId,
    runningOrder,
    activeServiceRunningOrder,
    runningServiceIds,
    serviceLastActivity,
    handleSelectService,
    handleSendMessage,
    handleSendVoiceNote,
    handleReactToMessage,
    handleConfirmBooking,
    handleCompleteOrder,
    handleClearChat,
  };
}
