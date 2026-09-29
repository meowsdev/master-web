'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { chatService } from '@/services/chat.service';
import { servicesService } from '@/services/services.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Message, MessageType } from '@/types/chat.types';
import {
  Send,
  Sparkles,
  Paperclip,
  Headphones,
  User,
  ShieldCheck,
  Package,
  CheckCheck,
  ArrowLeft,
  Clock,
  LogIn,
  AlertCircle,
  RotateCcw,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

function ChatContent() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');
  const serviceIdParam = searchParams.get('serviceId') || '';
  const router = useRouter();

  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Service details if serviceId is provided
  const { data: serviceDetail } = useQuery({
    queryKey: ['chat-service-detail', serviceIdParam],
    queryFn: () => servicesService.getServiceById(serviceIdParam),
    enabled: !!serviceIdParam && serviceIdParam !== 'general-service',
  });

  // Initialize or get conversation
  const {
    data: session,
    isLoading: isSessionLoading,
    isError: isSessionError,
    error: sessionError,
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

  // Keep activeSessionId in sync with resolved session
  const effectiveSessionId = activeSessionId || session?.id || null;

  useEffect(() => {
    if (session?.id && !activeSessionId) {
      setActiveSessionId(session.id);
    }
  }, [session, activeSessionId]);

  // Query Messages for active session
  const { data: rawMessages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat-messages', effectiveSessionId],
    queryFn: () => (effectiveSessionId ? chatService.getMessages(effectiveSessionId) : []),
    enabled: !!effectiveSessionId && isAuthenticated,
    refetchInterval: 2500, // Live poll every 2.5 seconds
  });

  // Sort messages chronologically (oldest at top, newest at bottom)
  const messages = React.useMemo(() => {
    if (!Array.isArray(rawMessages)) return [];
    return [...rawMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [rawMessages]);

  // Send message mutation with instant optimistic UI
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
      }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[680px]">
        {/* Left Sidebar: Session Info & Flow A Counselor Indicator */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between">
          <div className="space-y-5">
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

            {/* Selected Service Card (If Any) */}
            {serviceDetail ? (
              <div className="p-4 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {serviceDetail.category?.name || 'Selected Service'}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    ৳ {Number(serviceDetail.basePrice || 500).toFixed(0)}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                  {serviceDetail.name}
                </h3>
                <p className="text-[11px] text-zinc-500 line-clamp-2">
                  {serviceDetail.description}
                </p>
              </div>
            ) : null}

            {/* Session Info Details */}
            <div className="p-4 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Channel
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md">
                  {providerId ? 'DIRECT_PROVIDER' : 'FLOW_A_COUNSELOR'}
                </span>
              </div>

              <div className="text-xs text-zinc-500">
                {providerId
                  ? 'Connected directly with the selected expert provider.'
                  : 'Automatically matched with the next available support counselor.'}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3-Day Warranty Guarantee</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
            💡 You can negotiate pricing and confirm on-site scheduling directly with your counselor.
          </div>
        </div>

        {/* Right Area: Messages Box & Input */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-zinc-900">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Support Counselor</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Online • Response time &lt; 1 min
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[500px]">
            {isSessionLoading ? (
              <div className="text-center py-16 text-xs text-zinc-400">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Initializing counselor consultation session...
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
              <div className="text-center py-16 text-xs text-zinc-400 space-y-2">
                <Sparkles className="w-8 h-8 text-emerald-500/60 mx-auto" />
                <h4 className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                  Welcome to Master Services Live Consultation
                </h4>
                <p className="max-w-md mx-auto text-zinc-500">
                  Tell us about your requirement or choose one of the quick options below to get started!
                </p>
              </div>
            ) : (
              messages.map((m: Message) => {
                const isMine = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isMine ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm ${
                        isMine
                          ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm shadow-emerald-600/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 px-1">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/30 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-zinc-400 shrink-0 font-medium">Quick:</span>
            {[
              'I need urgent service inspection',
              'What is the estimated cost?',
              'Can a verified technician come today?',
              'I have a specific question about warranty',
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
              placeholder="Describe your issue or ask for a quote..."
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
      </div>
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
