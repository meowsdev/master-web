'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ChatMessage } from '@/types/super-app.types';
import { Service } from '@/types/service.types';

interface UseSuperAppChatProps {
  playSound: (type: 'send' | 'receive') => void;
}

export function useSuperAppChat({ playSound }: UseSuperAppChatProps) {
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [serviceMessages, setServiceMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');
  const [mobileView, setMobileView] = useState<'LIST' | 'CHAT'>('LIST');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Confirm in-chat booking with auth check
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

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const confirmationMsg: ChatMessage = {
      id: 'book-' + Date.now(),
      sender: 'them',
      text: `🎉 Booking Confirmed!\n\n📍 Location: ${address}\n⏰ Scheduled: ${time}\n💳 Payment Mode: ${paymentMode}\n💰 Base Fare: ৳${activeService.basePrice}\n\nOur verified technician is preparing tools for dispatch!`,
      time: currentTime,
    };

    setServiceMessages((prev) => ({
      ...prev,
      [activeServiceId]: [...(prev[activeServiceId] || []), confirmationMsg],
    }));

    playSound('receive');
    toast.success(`Booked ${activeService.name} successfully!`);
    onSuccess();
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
    handleSelectService,
    handleSendMessage,
    handleSendVoiceNote,
    handleReactToMessage,
    handleConfirmBooking,
    handleClearChat,
  };
}
