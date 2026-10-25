'use client';

import React, { useState } from 'react';
import { X, UserCheck, HardHat, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Order } from '@/types/order.types';
import { ordersService } from '@/services/orders.service';

interface AssignTechnicianModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
  isDarkMode: boolean;
}

// Sample agency technicians for prompt selection
const AGENCY_TECHNICIANS = [
  { id: 'tech-1', name: 'Md. Rafiqul Islam', phone: '+8801711223344', rating: '4.9', activeJobs: 1 },
  { id: 'tech-2', name: 'Al-Amin Hossain', phone: '+8801812334455', rating: '4.8', activeJobs: 0 },
  { id: 'tech-3', name: 'Kamrul Hasan', phone: '+8801913445566', rating: '4.7', activeJobs: 2 },
];

export function AssignTechnicianModal({
  order,
  isOpen,
  onClose,
  onAssigned,
  isDarkMode,
}: AssignTechnicianModalProps) {
  const [selectedTechId, setSelectedTechId] = useState(order.technicianId || AGENCY_TECHNICIANS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgModal = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await ordersService.updateOrder(order.id, {
        technicianId: selectedTechId,
      });
      const tech = AGENCY_TECHNICIANS.find((t) => t.id === selectedTechId);
      toast.success(`${tech?.name || 'টেকনিশিয়ান'} সফলভাবে অর্ডারে অ্যাসাইন করা হয়েছে! 👷`);
      onAssigned();
      onClose();
    } catch {
      toast.error('টেকনিশিয়ান অ্যাসাইন করতে সমস্যা হয়েছে।');
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
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${textPrimary}`}>
                Assign Field Technician
              </h3>
              <p className={`text-[11px] ${textSecondary}`}>
                কাজের জন্য আপনার টিমের টেকনিশিয়ান নির্বাচন করুন
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

        {/* Technician List */}
        <div className="space-y-2">
          {AGENCY_TECHNICIANS.map((tech) => {
            const isSelected = selectedTechId === tech.id;
            return (
              <div
                key={tech.id}
                onClick={() => setSelectedTechId(tech.id)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#008069] bg-[#008069]/10 ring-1 ring-[#008069]'
                    : 'border-black/5 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#e9edef] dark:bg-[#2a3942] flex items-center justify-center text-sm font-bold">
                    👨‍🔧
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${textPrimary}`}>{tech.name}</h4>
                    <p className={`text-[11px] ${textSecondary}`}>
                      {tech.phone} • ⭐ {tech.rating}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-semibold text-[#8696a0]">
                    {tech.activeJobs} Active Jobs
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#008069] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-semibold transition-colors cursor-pointer"
          >
            বাতিল
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAssign}
            className="flex-1 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'অ্যাসাইন হচ্ছে...' : 'টেকনিশিয়ান অ্যাসাইন করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
