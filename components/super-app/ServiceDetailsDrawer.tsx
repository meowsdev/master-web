'use client';

import React from 'react';
import {
  X,
  Wrench,
  Phone,
  Video,
  Bookmark,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Zap,
  Award,
  DollarSign,
} from 'lucide-react';
import { Service } from '@/types/service.types';

interface ServiceDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenBooking: () => void;
  onStartCall: (type: 'voice' | 'video') => void;
  isDarkMode: boolean;
}

export function ServiceDetailsDrawer({
  isOpen,
  onClose,
  service,
  isSaved,
  onToggleSave,
  onOpenBooking,
  onStartCall,
  isDarkMode,
}: ServiceDetailsDrawerProps) {
  if (!isOpen || !service) return null;

  const bgHeader = isDarkMode ? 'bg-[#202c33] border-[#222e35]' : 'bg-white border-[#e9edef]';
  const bgBody = isDarkMode ? 'bg-[#0b141a]' : 'bg-[#f0f2f5]';
  const bgCard = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const iconBtn = isDarkMode
    ? 'text-[#8696a0] hover:text-[#e9edef] hover:bg-white/5'
    : 'text-[#54656f] hover:text-[#111b21] hover:bg-black/5';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close Service Details" />

      {/* Slide-in Drawer Container */}
      <aside
        className={`relative z-10 w-full sm:w-[420px] h-full shadow-2xl border-l flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 ease-out ${bgBody}`}
      >
        {/* Top Header */}
        <div className={`h-[60px] border-b px-4 flex items-center justify-between shrink-0 ${bgHeader}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`p-2 rounded-full cursor-pointer transition-colors ${iconBtn}`}
              title="Close details"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className={`text-[16px] font-semibold tracking-tight ${textPrimary}`}>
              Service Info
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366]">
            Verified
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-6">
          {/* 1. Large Profile Hero Card */}
          <div className={`p-6 flex flex-col items-center text-center border-b shadow-2xs ${bgCard}`}>
            {/* Big Avatar */}
            <div className="relative mb-3.5 group">
              <div className="w-32 h-32 rounded-full bg-[#f0f2f5] dark:bg-[#202c33] border-4 border-white dark:border-[#222e35] shadow-lg flex items-center justify-center text-5xl select-none">
                {service.category?.iconUrl || '🛠️'}
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#25D366] rounded-full border-2 border-white dark:border-[#111b21]" />
            </div>

            {/* Service Title */}
            <h2 className={`text-xl font-bold leading-snug max-w-sm ${textPrimary}`}>
              {service.name}
            </h2>

            {/* Price & Online Counselor */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm font-bold text-[#008069] dark:text-[#25D366] bg-[#d9fdd3] dark:bg-[#005c4b]/40 px-3 py-1 rounded-full border border-[#25D366]/30">
                ৳{service.basePrice} Fixed Rate
              </span>
              <span className="text-xs text-[#54656f] dark:text-[#8696a0] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] inline-block" />
                Counselor Active
              </span>
            </div>
          </div>

          {/* 2. Action Shortcuts Row (WhatsApp Style) */}
          <div className={`py-4 px-3 border-y grid grid-cols-4 gap-2 text-center shadow-2xs ${bgCard}`}>
            {/* Book Service */}
            <button
              onClick={() => {
                onClose();
                onOpenBooking();
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold ${textPrimary}`}>Book</span>
            </button>

            {/* Audio Call */}
            <button
              onClick={() => {
                onClose();
                onStartCall('voice');
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-black/5 dark:bg-white/10 text-[#008069] dark:text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-all">
                <Phone className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold ${textPrimary}`}>Voice</span>
            </button>

            {/* Video Call */}
            <button
              onClick={() => {
                onClose();
                onStartCall('video');
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-black/5 dark:bg-white/10 text-[#008069] dark:text-[#25D366] flex items-center justify-center group-hover:scale-105 transition-all">
                <Video className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-semibold ${textPrimary}`}>Video</span>
            </button>

            {/* Save / Bookmark */}
            <button
              onClick={onToggleSave}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center group-hover:scale-105 transition-all ${
                  isSaved
                    ? 'bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366]'
                    : 'bg-black/5 dark:bg-white/10 text-[#54656f] dark:text-[#8696a0]'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </div>
              <span className={`text-[11px] font-semibold ${textPrimary}`}>
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          {/* 3. Description & Scope */}
          <div className={`p-4 border-y space-y-2 shadow-2xs ${bgCard}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
              Overview & Scope
            </h4>
            <p className={`text-sm leading-relaxed ${textPrimary}`}>
              {service.description ||
                'Complete diagnostic, fault isolation, certified technician dispatch, genuine parts guarantee, and thorough post-repair safety verification.'}
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#008069] dark:text-[#25D366]" />
                <span className={textSecondary}>Duration:</span>
                <span className={`font-bold ${textPrimary}`}>{service.durationMin || 45} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#008069] dark:text-[#25D366]" />
                <span className={textSecondary}>Pricing:</span>
                <span className={`font-bold ${textPrimary}`}>Fixed Base Rate</span>
              </div>
            </div>
          </div>

          {/* 4. Coverage & Dispatch Info */}
          <div className={`p-4 border-y space-y-2.5 shadow-2xs ${bgCard}`}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#008069] dark:text-[#25D366]" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                Dhaka Coverage Zones
              </h4>
            </div>
            <p className={`text-xs leading-relaxed ${textSecondary}`}>
              Available for instant home dispatch in <strong>Mirpur, Gulshan, Banani, Dhanmondi, Uttara, Mohammadpur, Badda</strong> and all major Dhaka metropolitan areas.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#008069] dark:text-[#25D366] font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Standard technician arrival within 2 hours of booking</span>
            </div>
          </div>

          {/* 5. Trust & Quality Guarantee */}
          <div className={`p-4 border-y space-y-3 shadow-2xs ${bgCard}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
              Super App Service Guarantee
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
                <span className={textPrimary}>7-Day Free Warranty on all servicing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#25D366] shrink-0" />
                <span className={textPrimary}>Verified & Background-Checked Pros</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span className={textPrimary}>Pay Cash, bKash, or Nagad upon completion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Booking Button Bar */}
        <div className={`p-4 border-t shrink-0 ${bgHeader}`}>
          <button
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="w-full py-3.5 bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Wrench className="w-4 h-4" />
            <span>Book Service Now • ৳{service.basePrice}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
