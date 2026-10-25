'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Star,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { DHAKA_AREAS } from '@/types/super-app.types';

export interface ProviderItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  totalOrders: number;
  level: 'Level 1' | 'Level 2' | 'Top Rated Pro';
  isOnline: boolean;
  location: string;
  services: string[];
}

interface ProviderDirectoryProps {
  onSelectProviderChat: (provider: ProviderItem, selectedService: string) => void;
  activeConnectedProviderName?: string | null;
  hasRunningOrder: boolean;
  isDarkMode: boolean;
}

// Global verified partner providers
const MOCK_PARTNERS: ProviderItem[] = [
  {
    id: 'prov-1',
    name: 'Rahim Cooling & Electronics',
    avatar: '👨‍🔧',
    rating: 4.95,
    totalOrders: 184,
    level: 'Top Rated Pro',
    isOnline: true,
    location: 'Gulshan-2 Circle, Dhaka',
    services: ['AC Servicing & Master Wash', 'Refrigerator Gas Charge', 'AC Installation'],
  },
  {
    id: 'prov-2',
    name: 'Dhaka Pro Home Solutions',
    avatar: '🛠️',
    rating: 4.90,
    totalOrders: 92,
    level: 'Level 2',
    isOnline: true,
    location: 'Dhanmondi 27, Dhaka',
    services: ['Sofa Deep Steam Clean', 'Kitchen Deep Cleaning', 'Full Home Sanitization'],
  },
  {
    id: 'prov-3',
    name: 'Master Electric & Plumbing',
    avatar: '⚡',
    rating: 4.85,
    totalOrders: 145,
    level: 'Level 2',
    isOnline: false,
    location: 'Uttara Sector 7, Dhaka',
    services: ['Ceiling Fan & Light Wiring', 'Plumbing Leakage Fix', 'Water Motor Repair'],
  },
  {
    id: 'prov-4',
    name: 'Bismillah Gas & Oven Care',
    avatar: '🔥',
    rating: 4.75,
    totalOrders: 54,
    level: 'Level 1',
    isOnline: true,
    location: 'Mirpur-10 Roundabout, Dhaka',
    services: ['Microwave Oven Repair', 'Gas Stove Burner Clean', 'Geyser Installation'],
  },
];

export function ProviderDirectory({
  onSelectProviderChat,
  activeConnectedProviderName,
  hasRunningOrder,
  isDarkMode,
}: ProviderDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(null);
  const [chosenService, setChosenService] = useState<string>('');
  const [switchConfirmModal, setSwitchConfirmModal] = useState<{
    provider: ProviderItem;
    service: string;
  } | null>(null);

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgCard = isDarkMode ? 'bg-[#182229] border-[#222e35]' : 'bg-white border-[#e9edef]';
  const bgSearch = isDarkMode ? 'bg-[#202c33] text-[#d1d7db]' : 'bg-[#f0f2f5] text-[#111b21]';

  // FR-DISC-01 & 02: Auto-sort Highest Rated to Lowest Rated & Online Priority
  const filteredProviders = useMemo(() => {
    return MOCK_PARTNERS.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchArea = selectedArea === 'All' || p.location.includes(selectedArea);
      return matchSearch && matchArea;
    }).sort((a, b) => {
      // 1. Online priority
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      // 2. Highest rating to lowest
      return b.rating - a.rating;
    });
  }, [searchQuery, selectedArea]);

  // Handle Request to start chat with provider
  const handleInitiateChat = (provider: ProviderItem) => {
    // FR-SWITCH-04: Running Order Lock
    if (hasRunningOrder) {
      toast.error('আপনার একটি কাজ বর্তমানে চালু রয়েছে (In-Progress)। অর্ডার সমাপ্ত না হওয়া পর্যন্ত নতুন প্রোভাইডার নির্বাচন করা যাবে না।');
      return;
    }

    // FR-SWITCH-01: Mandatory Service Selection
    if (!chosenService) {
      toast.warning('Please select a service before starting a chat. (চ্যাট শুরুর পূর্বে একটি সার্ভিস সিলেক্ট করুন)');
      return;
    }

    // FR-SWITCH-02: Existing Active Chat Alert
    if (activeConnectedProviderName && activeConnectedProviderName !== provider.name) {
      setSwitchConfirmModal({ provider, service: chosenService });
      return;
    }

    onSelectProviderChat(provider, chosenService);
  };

  const confirmSwitch = () => {
    if (!switchConfirmModal) return;
    onSelectProviderChat(switchConfirmModal.provider, switchConfirmModal.service);
    setSwitchConfirmModal(null);
    toast.success(`${switchConfirmModal.provider.name}-এর সাথে কানেক্ট করা হয়েছে!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] dark:bg-[#111b21] select-none">
      {/* Search & Location Filter Bar */}
      <div className="p-3 bg-white dark:bg-[#202c33] border-b border-black/5 dark:border-white/10 space-y-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-[8px] ${bgSearch}`}>
            <Search className="w-4 h-4 text-[#54656f] dark:text-[#8696a0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified partners or services..."
              className="w-full bg-transparent text-xs focus:outline-none"
            />
          </div>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className={`py-1.5 px-2 rounded-[8px] text-xs border focus:outline-none ${bgSearch}`}
          >
            <option value="All">All Locations</option>
            {DHAKA_AREAS.map((a) => (
              <option key={a} value={a.split(',')[0]}>
                {a.split(',')[0]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8696a0]">
          <span>Showing {filteredProviders.length} verified agencies in Dhaka</span>
          <span>Sorted: Highest Rated & Online</span>
        </div>
      </div>

      {/* Provider List / Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className={`p-4 rounded-2xl border transition-all shadow-xs space-y-3 ${bgCard}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#d9fdd3] dark:bg-[#005c4b]/40 text-2xl flex items-center justify-center shrink-0 shadow-2xs relative">
                  {provider.avatar}
                  {provider.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25D366] ring-2 ring-white dark:ring-[#182229]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-[14.5px] font-bold truncate ${textPrimary}`}>
                      {provider.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-[#008069] dark:text-[#25D366] shrink-0" />
                  </div>
                  <p className={`text-[11.5px] flex items-center gap-1 ${textSecondary}`}>
                    <MapPin className="w-3 h-3 text-[#25D366]" />
                    <span className="truncate">{provider.location}</span>
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 font-black text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{provider.rating.toFixed(2)}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#008069]/10 text-[#008069] dark:text-[#25D366]">
                  {provider.level}
                </span>
              </div>
            </div>

            {/* Service Chips for Selection */}
            <div className="space-y-1">
              <p className={`text-[11px] font-semibold ${textSecondary}`}>
                Select Service to Consult / Book:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {provider.services.map((svc) => {
                  const isSelected = selectedProvider?.id === provider.id && chosenService === svc;
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setChosenService(svc);
                      }}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#008069] text-white border-[#008069] shadow-xs'
                          : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/10 hover:border-[#008069]/40'
                      }`}
                    >
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10">
              <span className={`text-[11px] ${textSecondary}`}>
                Completed: {provider.totalOrders}+ successful jobs
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedProvider?.id !== provider.id) {
                    setSelectedProvider(provider);
                    setChosenService(provider.services[0]);
                  }
                  handleInitiateChat(provider);
                }}
                className="py-1.5 px-3.5 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat with Provider</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FR-SWITCH-02: Provider Switch Confirmation Modal */}
      {switchConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border space-y-3.5 ${bgCard}`}>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Provider Switch Confirmation</span>
            </div>
            <p className={`text-xs leading-relaxed ${textPrimary}`}>
              You are currently connected with <span className="font-bold">{activeConnectedProviderName}</span>. Do you want to leave {activeConnectedProviderName} and start a chat with <span className="font-bold">{switchConfirmModal.provider.name}</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSwitchConfirmModal(null)}
                className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="flex-1 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                OK (Switch)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
