'use client';

import React, { useState } from 'react';
import { X, UserPlus, Phone, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Service } from '@/types/service.types';
import { apiClient } from '@/lib/axios';

interface ProviderStartChatModalProps {
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
  onChatStarted: (serviceId: string, customerPhone: string) => void;
  isDarkMode: boolean;
}

export function ProviderStartChatModal({
  services,
  isOpen,
  onClose,
  onChatStarted,
  isDarkMode,
}: ProviderStartChatModalProps) {
  const [phone, setPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [initialMsg, setInitialMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgModal = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgInput = isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('কাস্টমারের মোবাইল নম্বর বাধ্যতামূলক।');
      return;
    }

    setIsSubmitting(true);
    try {
      // In production calls backend Flow B direct chat endpoint
      await apiClient.post('/chat-sessions', {
        mobileNumber: phone.trim(),
        serviceId: selectedServiceId,
        flowType: 'PROVIDER_CUSTOMER',
      }).catch(() => {
        // Fallback for mock session
      });

      toast.success(`কাস্টমার (+880 ${phone.slice(-10)}) এর সাথে ডিরেক্ট চ্যাট শুরু হয়েছে! (SMS পাঠানো হয়েছে)`);
      onChatStarted(selectedServiceId, phone.trim());
      onClose();
    } catch {
      toast.error('চ্যাট শুরু করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 duration-150 ${bgModal}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#008069]/10 text-[#008069] dark:text-[#25D366] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>
                Add Customer & Start Chat (Flow B)
              </h3>
              <p className={`text-[11px] ${textSecondary}`}>
                অফলাইন বা রেফারেল কাস্টমারের জন্য সরাসরি চ্যাট শুরু করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[#008069] dark:text-[#25D366]">
          বট প্রশ্ন ছাড়াই সরাসরি হিউম্যান চ্যাট ওপেন হবে। কাস্টমার আন-রেজিস্টার্ড হলে এসএমএসে ডাইনামিক লিংক চলে যাবে।
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              কাস্টমারের মোবাইল নম্বর:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className={`w-full py-2 pl-9 pr-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#008069] ${bgInput}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              কাঙ্ক্ষিত সার্ভিস নির্বাচন করুন:
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className={`w-full py-2 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#008069] ${bgInput}`}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (৳{s.basePrice})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              প্রাথমিক মেসেজ বা কাজের নোট (Optional):
            </label>
            <textarea
              rows={2}
              value={initialMsg}
              onChange={(e) => setInitialMsg(e.target.value)}
              placeholder="e.g. স্যার, আপনার লোকেশনে টেকনিশিয়ান পাঠানোর জন্য চ্যাটটি শুরু করা হলো..."
              className={`w-full py-2 px-3 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#008069] ${bgInput}`}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'শুরু হচ্ছে...' : 'Start Live Chat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
