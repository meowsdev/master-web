'use client';

import React from 'react';
import { X, Calendar, MapPin, Zap } from 'lucide-react';
import { Service } from '@/types/service.types';
import { DHAKA_AREAS, PaymentMode } from '@/types/super-app.types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  bookingAddress: string;
  onAddressChange: (address: string) => void;
  bookingTime: string;
  onTimeChange: (time: string) => void;
  bookingPaymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onConfirmBooking: () => void;
  isDarkMode: boolean;
}

export function BookingModal({
  isOpen,
  onClose,
  service,
  bookingAddress,
  onAddressChange,
  bookingTime,
  onTimeChange,
  bookingPaymentMode,
  onPaymentModeChange,
  onConfirmBooking,
  isDarkMode,
}: BookingModalProps) {
  if (!isOpen || !service) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-5 animate-in zoom-in-95 duration-200 ${
          isDarkMode ? 'bg-[#182229] border-[#2f3b43]' : 'bg-white border-[#e9edef]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#e7fce3] dark:bg-[#005c4b]/50 text-xl flex items-center justify-center">
              {service.category?.iconUrl || '🛠️'}
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>{service.name}</h3>
              <p className="text-xs text-[#008069] dark:text-[#25D366] font-bold">
                Fixed Base ৳{service.basePrice}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary} cursor-pointer`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {/* Dhaka Area Selection */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold flex items-center gap-1.5 ${textPrimary}`}>
              <MapPin className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Service Location (Dhaka Area)</span>
            </label>
            <select
              value={bookingAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                isDarkMode
                  ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]'
                  : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
              } focus:ring-2 focus:ring-[#25D366]`}
            >
              {DHAKA_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold flex items-center gap-1.5 ${textPrimary}`}>
              <Calendar className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Preferred Schedule</span>
            </label>
            <select
              value={bookingTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                isDarkMode
                  ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]'
                  : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
              } focus:ring-2 focus:ring-[#25D366]`}
            >
              <option value="Today, Within 2 Hours">⚡ Express Dispatch (Within 2 Hours)</option>
              <option value="Today, 04:00 PM - 06:00 PM">Today, 04:00 PM - 06:00 PM</option>
              <option value="Tomorrow Morning, 10:00 AM">Tomorrow Morning, 10:00 AM</option>
              <option value="Tomorrow Afternoon, 02:00 PM">Tomorrow Afternoon, 02:00 PM</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className={`text-xs font-bold flex items-center gap-1.5 ${textPrimary}`}>
              <Zap className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Payment Method</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CASH', 'BKASH', 'NAGAD'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onPaymentModeChange(mode)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    bookingPaymentMode === mode
                      ? 'border-[#25D366] bg-[#e7fce3] text-[#075E54] dark:bg-[#005c4b]/50 dark:text-[#25D366] ring-1 ring-[#25D366]'
                      : isDarkMode
                      ? 'border-[#2f3b43] bg-[#111b21] text-[#8696a0]'
                      : 'border-[#d1d7db] bg-white text-[#667781]'
                  }`}
                >
                  {mode === 'CASH' ? '💵 Cash' : mode === 'BKASH' ? '📱 bKash' : '💳 Nagad'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Summary & Dispatch Button */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className={textSecondary}>Estimated Base Fare</span>
            <span className={`font-black text-lg ${textPrimary}`}>৳{service.basePrice}</span>
          </div>

          <button
            onClick={onConfirmBooking}
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#075E54] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#25D366]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confirm Technician Booking</span>
          </button>
        </div>
      </div>
    </div>
  );
}
