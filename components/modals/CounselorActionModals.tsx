'use client';

import React, { useState } from 'react';
import { X, UserPlus, CreditCard, PlusCircle, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Service } from '@/types/service.types';
import {
  CreateManualCustomerLeadDto,
  CounselorCreateOrderDto,
  CounselorChatItem,
} from '@/types/counselor.types';

/* 1. Modal: Flow B Add Customer / Manual Lead */
interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onSubmit: (dto: CreateManualCustomerLeadDto) => void;
  isDarkMode: boolean;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  services,
  onSubmit,
  isDarkMode,
}: AddCustomerModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [address, setAddress] = useState('Dhanmondi, Dhaka');
  const [initialNote, setInitialNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !serviceId) return;
    onSubmit({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      serviceId,
      address,
      initialNote,
    });
    onClose();
  };

  const bgCard = isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const inputBg = isDarkMode ? 'bg-[#111b21] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border space-y-4 ${bgCard}`}>
        <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 font-bold text-base">
            <UserPlus className="w-5 h-5 text-[#008069] dark:text-[#25D366]" />
            <span>Add Customer / Manual Lead (Flow B)</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 cursor-pointer">
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold block mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Tanvir Hasan"
              className={`w-full p-2.5 rounded-xl border focus:outline-hidden ${inputBg}`}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Mobile Number (+880) *</label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className={`w-full p-2.5 rounded-xl border focus:outline-hidden ${inputBg}`}
            />
            <p className={`text-[10px] mt-1 ${textSecondary}`}>
              Registered users receive instant app push; unverified receive Motivational SMS.
            </p>
          </div>

          <div>
            <label className="font-bold block mb-1">Service Required *</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className={`w-full p-2.5 rounded-xl border focus:outline-hidden ${inputBg}`}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (৳{s.basePrice})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1">Address / Area</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Mirpur 10, Dhaka"
              className={`w-full p-2.5 rounded-xl border focus:outline-hidden ${inputBg}`}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-black/10 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-xs shadow-md cursor-pointer transition-all"
            >
              Start Direct Chat 💬
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* 2. Modal: FR-ORD-01 Custom Order Creation & Payment Terms */
interface CreateCustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatItem: CounselorChatItem;
  onSubmit: (dto: CounselorCreateOrderDto) => void;
  isDarkMode: boolean;
}

export function CreateCustomOrderModal({
  isOpen,
  onClose,
  chatItem,
  onSubmit,
  isDarkMode,
}: CreateCustomOrderModalProps) {
  const [description, setDescription] = useState(`Agreed package for ${chatItem.serviceName}`);
  const [totalPrice, setTotalPrice] = useState<number>(chatItem.totalPrice || 1200);
  const [advancePercent, setAdvancePercent] = useState<number>(20);
  const [paymentMode, setPaymentMode] = useState<string>('BKASH');

  if (!isOpen) return null;

  const advanceAmount = Math.round((totalPrice * advancePercent) / 100);
  const dueAmount = Math.max(0, totalPrice - advanceAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPrice <= 0) return;
    onSubmit({
      serviceId: chatItem.serviceId,
      description,
      totalPrice,
      advancePercentage: advancePercent,
      advanceAmount,
      paymentMode,
      assignedProviderId: chatItem.assignedProvider?.id,
    });
    onClose();
  };

  const bgCard = isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const inputBg = isDarkMode ? 'bg-[#111b21] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border space-y-4 ${bgCard}`}>
        <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 font-bold text-base">
            <CreditCard className="w-5 h-5 text-[#008069] dark:text-[#25D366]" />
            <span>Create Custom Order & Advance %</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 cursor-pointer">
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold block mb-1">Customer & Service</label>
            <div className={`p-2.5 rounded-xl border font-medium ${inputBg}`}>
              {chatItem.customerName} • {chatItem.serviceName}
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Work Description / Scope *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2.5 rounded-xl border focus:outline-hidden ${inputBg}`}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Total Agreed Price (৳) *</label>
            <input
              type="number"
              min="100"
              required
              value={totalPrice}
              onChange={(e) => setTotalPrice(Number(e.target.value))}
              className={`w-full p-2.5 rounded-xl border focus:outline-hidden font-mono font-bold ${inputBg}`}
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Advance Payment Terms (%)</label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 10, 20, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setAdvancePercent(pct)}
                  className={`py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                    advancePercent === pct
                      ? 'bg-[#008069] text-white border-[#008069]'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {pct === 0 ? 'Full Due' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Math Summary */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Advance to Confirm:</span>
              <span className="font-bold text-[#008069] dark:text-[#25D366]">৳{advanceAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Due:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">৳{dueAmount}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-black/10 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-xs shadow-md cursor-pointer transition-all"
            >
              Dispatch Order Card 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* 3. Modal: FR-ORD-02 Add-On Price Modification */
interface ModifyPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatItem: CounselorChatItem;
  onSubmit: (orderId: string, additionalPrice: number) => void;
  isDarkMode: boolean;
}

export function ModifyPriceModal({
  isOpen,
  onClose,
  chatItem,
  onSubmit,
  isDarkMode,
}: ModifyPriceModalProps) {
  const [additionalPrice, setAdditionalPrice] = useState<number>(300);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (additionalPrice <= 0) return;
    onSubmit(chatItem.id, additionalPrice);
    onClose();
  };

  const bgCard = isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const inputBg = isDarkMode ? 'bg-[#111b21] border-[#2f3b43]' : 'bg-[#f0f2f5] border-[#e9edef]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border space-y-4 ${bgCard}`}>
        <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 font-bold text-base">
            <PlusCircle className="w-5 h-5 text-amber-500" />
            <span>Add-On Price Modification</span>
          </div>
          <button type="button" onClick={onClose} className="p-1 cursor-pointer">
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold block mb-1">Current Base Price</label>
            <div className={`p-2.5 rounded-xl border font-mono font-bold ${inputBg}`}>
              ৳{chatItem.totalPrice}
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Additional Parts / Add-On (৳) *</label>
            <input
              type="number"
              min="50"
              required
              value={additionalPrice}
              onChange={(e) => setAdditionalPrice(Number(e.target.value))}
              className={`w-full p-2.5 rounded-xl border focus:outline-hidden font-mono font-bold ${inputBg}`}
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] leading-relaxed">
            ⚠️ <strong>Re-Approval Gate:</strong> This will send an Old Price vs New Price card (৳{chatItem.totalPrice + additionalPrice}) to the customer. Work will pause until the customer taps <em>Accept New Price</em>.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border border-black/10 dark:border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md cursor-pointer transition-all"
            >
              Send For Re-Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
