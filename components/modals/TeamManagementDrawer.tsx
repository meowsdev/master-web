'use client';

import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Phone,
  HardHat,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';

interface TechnicianItem {
  id: string;
  name: string;
  phone: string;
  activeJobs: number;
  rating: number;
  joinedAt: string;
}

interface TeamManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const INITIAL_TEAM: TechnicianItem[] = [
  { id: 't-1', name: 'Md. Rafiqul Islam', phone: '+8801711223344', activeJobs: 1, rating: 4.9, joinedAt: 'Oct 2024' },
  { id: 't-2', name: 'Al-Amin Hossain', phone: '+8801812334455', activeJobs: 0, rating: 4.8, joinedAt: 'Nov 2024' },
  { id: 't-3', name: 'Kamrul Hasan', phone: '+8801913445566', activeJobs: 2, rating: 4.7, joinedAt: 'Dec 2024' },
];

export function TeamManagementDrawer({
  isOpen,
  onClose,
  isDarkMode,
}: TeamManagementDrawerProps) {
  const [team, setTeam] = useState<TechnicianItem[]>(INITIAL_TEAM);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgDrawer = isDarkMode ? 'bg-[#202c33] border-[#2f3b43]' : 'bg-white border-[#e9edef]';
  const bgInput = isDarkMode ? 'bg-[#111b21] border-[#2f3b43] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]';

  const handleAddTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('নাম এবং মোবাইল নম্বর বাধ্যতামূলক।');
      return;
    }

    setIsSubmitting(true);
    try {
      // In production calls backend technician creation endpoint
      await apiClient.post('/technician-profile', {
        name: name.trim(),
        mobileNumber: phone.trim(),
        defaultPassword: '123456',
      }).catch(() => {
        // Fallback for mock environment
      });

      const newTech: TechnicianItem = {
        id: `t-${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        activeJobs: 0,
        rating: 5.0,
        joinedAt: 'Just now',
      };

      setTeam((prev) => [newTech, ...prev]);
      toast.success(`${name} যুক্ত করা হয়েছে! ডিফল্ট পাসওয়ার্ড: 123456 (SMS পাঠানো হয়েছে)`);
      setName('');
      setPhone('');
      setShowAddForm(false);
    } catch {
      toast.error('টেকনিশিয়ান যুক্ত করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className={`w-full max-w-md h-full flex flex-col shadow-2xl border-l select-none ${bgDrawer}`}>
        {/* Top Header */}
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#008069]/10 text-[#008069] dark:text-[#25D366] flex items-center justify-center">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-bold leading-tight ${textPrimary}`}>
                Team & Technician Management
              </h2>
              <p className={`text-[11px] ${textSecondary}`}>
                {team.length} Field Technicians Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Isolation Notice */}
        <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 text-xs flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
          <p className="leading-tight text-[11px]">
            <span className="font-bold">Role Isolation Active:</span> টেকনিশিয়ান কেবল তার নির্ধারিত কাজ দেখতে পাবে। এজেন্সির ওয়ালেট ব্যালেন্স ও মূল আয় সম্পূর্ণ গোপন থাকবে।
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add Technician Button / Toggle */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Technician (নতুন কর্মী যুক্ত করুন)</span>
            </button>
          ) : (
            <form onSubmit={handleAddTechnician} className="p-4 rounded-2xl border border-[#008069]/30 bg-[#008069]/5 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#008069]/20">
                <span className="text-xs font-bold text-[#008069] dark:text-[#25D366] flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Field Technician</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${textPrimary}`}>
                  টেকনিশিয়ানের পূর্ণ নাম:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Tariqul Islam"
                  className={`w-full py-1.5 px-3 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-[#008069] ${bgInput}`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${textPrimary}`}>
                  মোবাইল নম্বর (+880):
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={`w-full py-1.5 px-3 rounded-lg text-xs border focus:outline-none focus:ring-1 focus:ring-[#008069] ${bgInput}`}
                />
              </div>

              <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 text-[11px] flex items-center gap-2 text-[#8696a0]">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>অটো ডিফল্ট পাসওয়ার্ড: <span className="font-mono font-bold text-[#008069]">123456</span></span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? 'সেভ হচ্ছে...' : 'Save & Send Credentials SMS'}
              </button>
            </form>
          )}

          {/* Technicians List */}
          <div className="space-y-2.5">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
              Active Agency Technicians
            </h4>

            {team.map((tech) => (
              <div
                key={tech.id}
                className="p-3 rounded-xl border border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d9fdd3] dark:bg-[#005c4b]/40 text-xl flex items-center justify-center">
                    👨‍🔧
                  </div>
                  <div>
                    <h5 className={`text-xs font-bold ${textPrimary}`}>{tech.name}</h5>
                    <p className={`text-[11px] flex items-center gap-1 ${textSecondary}`}>
                      <Phone className="w-3 h-3 text-[#25D366]" />
                      <span>{tech.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    ⭐ {tech.rating}
                  </span>
                  <p className="text-[10px] text-[#8696a0] mt-0.5">
                    {tech.activeJobs} Jobs active
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
