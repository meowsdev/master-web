'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Video,
  ExternalLink,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Zap,
  XCircle,
  Send,
  Smile,
  Paperclip,
  Mic,
  ShieldCheck,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/types/order.types';
import { ProviderPriceEditModal } from '@/components/modals/ProviderPriceEditModal';
import { ProviderCompletionModal } from '@/components/modals/ProviderCompletionModal';
import { AssignTechnicianModal } from '@/components/modals/AssignTechnicianModal';

interface ProviderOrderCanvasProps {
  order: Order;
  onBack: () => void;
  onUpdateStatus: (status: OrderStatus) => Promise<void>;
  isUpdatingStatus: boolean;
  onStartCall: (type: 'voice' | 'video') => void;
  isDarkMode: boolean;
}

export function ProviderOrderCanvas({
  order,
  onBack,
  onUpdateStatus,
  isUpdatingStatus,
  onStartCall,
  isDarkMode,
}: ProviderOrderCanvasProps) {
  const [inputText, setInputText] = useState('');
  const [isPriceEditOpen, setIsPriceEditOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isAssignTechOpen, setIsAssignTechOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'provider' | 'system'; text: string; time: string }>>([
    {
      id: 'sys-1',
      sender: 'system',
      text: `Dispatch order #${order.id.slice(0, 8).toUpperCase()} assigned to your agency. Please coordinate with customer.`,
      time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const serviceIcon = order.service?.category?.iconUrl || '🛠️';
  const serviceName = order.service?.name || 'On-Demand Service';
  const customerName = order.customer?.user?.name || 'Customer';
  const customerPhone = order.customer?.user?.mobileNumber || 'N/A';
  const orderShortId = order.id.slice(0, 8).toUpperCase();

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgHeader = isDarkMode ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#ffffff] border-[#e9edef]';
  const bgCard = isDarkMode ? 'bg-[#182229] border-[#222e35]' : 'bg-white border-[#e9edef]';
  const bgComposer = isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]';
  const bgInput = isDarkMode ? 'bg-[#2a3942] text-[#d1d7db]' : 'bg-white text-[#111b21]';

  const activeRevision = order.revisions?.find(
    (r) => r.revisionStatus === 'REQUESTED' || r.revisionStatus === 'ACCEPTED'
  );
  const hasActiveRevision = !!activeRevision;
  const resolvedRevision = order.revisions?.find(
    (r) => r.revisionStatus === 'COMPLETED'
  );

  const isPending = order.orderStatus === OrderStatus.PENDING;
  const isInProgress = order.orderStatus === OrderStatus.IN_PROGRESS || order.orderStatus === OrderStatus.ACCEPTED;
  const isCompleted = order.orderStatus === OrderStatus.COMPLETED;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'provider',
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');
    toast.success('Message sent to customer');
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[#efeae2] dark:bg-[#0b141a] relative select-none">
      {/* 1. Order Top Header */}
      <header className={`h-[60px] px-4 flex items-center justify-between border-b z-20 shrink-0 ${bgHeader}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-[#54656f] dark:text-[#8696a0] hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
            title="Back to orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-[#e9edef] dark:bg-[#202c33] flex items-center justify-center text-lg shrink-0 shadow-2xs">
            {serviceIcon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className={`text-[15px] font-bold leading-tight truncate ${textPrimary}`}>
                {serviceName}
              </h2>
              {hasActiveRevision && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-black shadow-xs flex items-center gap-1 shrink-0 animate-pulse">
                  <RotateCcw className="w-3 h-3" />
                  <span>TOP PRIORITY REVISION</span>
                </span>
              )}
            </div>
            <p className={`text-[12px] truncate ${textSecondary}`}>
              Customer: <span className="font-semibold">{customerName}</span> • #{orderShortId}
            </p>
          </div>
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 text-[#54656f] dark:text-[#8696a0]">
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors"
            title="Call Customer"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => onStartCall('video')}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors"
            title="Video Consultation"
          >
            <Video className="w-4 h-4" />
          </button>
          <Link
            href={`/orders/${order.id}`}
            target="_blank"
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer transition-colors"
            title="Open Full Order Details & Financials"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* 2. Chat Canvas with Wallpaper & Order Dispatch Card */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Date Pill */}
        <div className="flex justify-center my-1">
          <span className="px-3 py-1 rounded-lg bg-white/80 dark:bg-[#182229]/80 text-[11px] font-semibold text-[#54656f] dark:text-[#8696a0] shadow-2xs uppercase tracking-wider backdrop-blur-xs">
            Today • Job Dispatch
          </span>
        </div>

        {/* Authentic Job Dispatch Card */}
        <div className={`max-w-xl mx-auto rounded-2xl p-4 sm:p-5 shadow-md border space-y-4 ${bgCard}`}>
          {/* Card Top: Order ID & Current Status Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#008069] dark:text-[#25D366]">
                ORDER #{orderShortId}
              </span>
              <span className="text-[11px] text-[#8696a0]">
                • {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs ${
                hasActiveRevision
                  ? 'bg-amber-400 dark:bg-amber-500 text-black font-black border border-amber-300 shadow-xs animate-pulse'
                  : isInProgress
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 animate-pulse'
                  : isPending
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50'
                  : isCompleted
                  ? 'bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366] border border-[#25D366]/40'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {hasActiveRevision ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping inline-block" />
                  <span>⚠️ REVISION REQUESTED</span>
                </>
              ) : (
                <>
                  {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />}
                  <span>{order.orderStatus}</span>
                </>
              )}
            </span>
          </div>

          {/* Customer & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 space-y-1">
              <p className={`font-bold flex items-center gap-1.5 ${textPrimary}`}>
                <UserCheck className="w-3.5 h-3.5 text-[#008069] dark:text-[#25D366]" />
                <span>{customerName}</span>
              </p>
              <p className={textSecondary}>Phone: {customerPhone}</p>
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 space-y-1">
              <p className={`font-bold flex items-center gap-1.5 ${textPrimary}`}>
                <CreditCard className="w-3.5 h-3.5 text-[#008069] dark:text-[#25D366]" />
                <span>Payment: {order.paymentStatus}</span>
              </p>
              <p className="font-bold text-[#008069] dark:text-[#25D366]">
                Total Price: ৳{order.totalPrice}
              </p>
            </div>
          </div>

          {/* Active Customer Revision Request Banner */}
          {hasActiveRevision && activeRevision && (
            <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500 text-amber-950 dark:text-amber-100 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-amber-800 dark:text-amber-300">
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>CUSTOMER REVISION REQUEST (3-Day Free Warranty)</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black uppercase tracking-wider animate-pulse shadow-xs">
                  ⚡ TOP PRIORITY
                </span>
              </div>
              <div className="p-3 rounded-lg bg-amber-400/20 dark:bg-amber-900/40 border border-amber-500/30">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-0.5">Problem / Issue Reported:</p>
                <p className="text-xs font-medium italic">&ldquo;{activeRevision.issueDescription}&rdquo;</p>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-400">
                ⚠️ Please resolve this issue for the customer immediately. Once resolved, click below to mark it completed.
              </p>
            </div>
          )}

          {/* Provider Lifecycle Actions */}
          <div className="pt-2">
            {isPending && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onUpdateStatus(OrderStatus.IN_PROGRESS)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Accept & Start Work</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onUpdateStatus(OrderStatus.CANCELLED)}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>
            )}

            {isInProgress && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onUpdateStatus(OrderStatus.COMPLETED)}
                  className={`w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    hasActiveRevision
                      ? 'bg-gradient-to-r from-amber-500 via-emerald-600 to-emerald-700 hover:from-amber-600 hover:to-emerald-800 shadow-amber-500/20 ring-1 ring-amber-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {hasActiveRevision
                      ? '✅ Solve Revision & Complete Order (রিভিশন সম্পন্ন করুন)'
                      : 'Mark Service Finished & Complete Order'}
                  </span>
                </button>

                {/* Additional Provider Actions: Price Edit, Complete on Behalf of Guest, Assign Tech */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPriceEditOpen(true)}
                    className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>✏️ Edit Price (+Add-on)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAssignTechOpen(true)}
                    className="py-2 px-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>👷 Assign Technician</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompletionModalOpen(true)}
                    className="py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#008069] dark:text-[#25D366] font-bold text-[11px] border border-emerald-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>💵 Guest Cash Settle</span>
                  </button>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="p-3 rounded-xl bg-[#d9fdd3] dark:bg-[#005c4b]/40 border border-[#25D366]/40 text-center space-y-1">
                <p className="text-xs font-bold text-[#008069] dark:text-[#25D366] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {resolvedRevision
                      ? 'Revision Successfully Solved & Order Completed! ✅'
                      : 'Order Completed & Settled'}
                  </span>
                </p>
                <p className={`text-[11px] ${textSecondary}`}>
                  {resolvedRevision
                    ? 'Customer warranty rework has been fulfilled. Order is fully completed & settled.'
                    : 'Commission reconciled and added to your completed orders counter.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* In-Chat Communication Messages */}
        <div className="max-w-xl mx-auto space-y-2 pt-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'provider' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs shadow-xs select-text ${
                  m.sender === 'provider'
                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef]'
                    : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef]'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <span className="block text-[10px] text-right mt-1 opacity-70">
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bottom Composer for Provider */}
      <footer className={`p-2.5 flex items-center gap-2 border-t shrink-0 ${bgComposer} border-black/5 dark:border-white/10`}>
        <button
          type="button"
          onClick={() => toast.info('Emoji picker')}
          className="p-1.5 text-[#54656f] dark:text-[#8696a0] hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
        >
          <Smile className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => toast.info('Attach service photo')}
          className="p-1.5 text-[#54656f] dark:text-[#8696a0] hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send status update to customer (e.g. 'I am on the way')..."
            className={`flex-1 py-2 px-3.5 rounded-[8px] text-xs focus:outline-none ${bgInput}`}
          />
          {inputText.trim() ? (
            <button
              type="submit"
              className="p-2 bg-[#008069] text-white rounded-full hover:bg-[#00705c] transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toast.info('Voice notes available')}
              className="p-2 text-[#54656f] dark:text-[#8696a0] hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </footer>

      {/* Provider Modals */}
      <ProviderPriceEditModal
        order={order}
        isOpen={isPriceEditOpen}
        onClose={() => setIsPriceEditOpen(false)}
        onPriceUpdated={() => onUpdateStatus(order.orderStatus)}
        isDarkMode={isDarkMode}
      />
      <ProviderCompletionModal
        order={order}
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onOrderCompleted={() => onUpdateStatus(OrderStatus.COMPLETED)}
        isDarkMode={isDarkMode}
      />
      <AssignTechnicianModal
        order={order}
        isOpen={isAssignTechOpen}
        onClose={() => setIsAssignTechOpen(false)}
        onAssigned={() => onUpdateStatus(order.orderStatus)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
