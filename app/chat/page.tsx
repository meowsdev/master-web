'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/Navbar';
import { chatService } from '@/services/chat.service';
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
} from 'lucide-react';
import { toast } from 'sonner';

function ChatContent() {
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');
  const serviceId = searchParams.get('serviceId') || 'general-service';
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or get conversation
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['chat-session', serviceId, providerId],
    queryFn: async () => {
      const res = await chatService.getOrCreateConversation({
        serviceId,
        providerId: providerId || undefined,
      });
      if (res?.id) {
        setActiveSessionId(res.id);
      }
      return res;
    },
    enabled: isAuthenticated,
  });

  // Query Messages for active session
  const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat-messages', activeSessionId],
    queryFn: () => (activeSessionId ? chatService.getMessages(activeSessionId) : []),
    enabled: !!activeSessionId,
    refetchInterval: 3000, // Live poll every 3 seconds
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      chatService.sendMessage({
        sessionId: activeSessionId!,
        text,
        type: MessageType.TEXT,
      }),
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({
        queryKey: ['chat-messages', activeSessionId],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send message');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSessionId) return;
    sendMutation.mutate(inputText);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        {/* Left Sidebar: Session Info & Flow A Counselor Indicator */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Flow A Smart Routing
                </h2>
                <p className="text-[11px] text-emerald-600 font-medium">
                  ● Least Active Load Counselor
                </p>
              </div>
            </div>

            {/* Chat Session Card */}
            <div className="p-4 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Routing Channel
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
                <span>Encrypted & Audited Session</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
            💡 You can request custom order quotations directly inside this conversation.
          </div>
        </div>

        {/* Right Area: Messages Box & Input */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-zinc-900">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                {providerId ? 'P' : 'C'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {providerId ? 'Provider Live Chat' : 'Assigned Support Counselor'}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Online • Typically replies in 1 minute
                </p>
              </div>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[500px]">
            {isMessagesLoading ? (
              <div className="text-center py-12 text-xs text-zinc-400">
                Loading conversation history...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16 text-xs text-zinc-400">
                <Sparkles className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                No messages yet. Send a message to start the consultation!
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
                      <p className="leading-relaxed">{m.text}</p>
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

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-zinc-50/50 dark:bg-zinc-900/50"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your issue or ask for a price quote..."
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-900 dark:text-white"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sendMutation.isPending}
              className="p-2.5 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
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
