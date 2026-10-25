'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Search, Check, Wrench, ShieldCheck, Save, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { servicesService } from '@/services/services.service';
import { serviceAssigneeService } from '@/services/service-assignee.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Service } from '@/types/service.types';

interface ProviderSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export function ProviderSkillsModal({
  isOpen,
  onClose,
  isDarkMode,
}: ProviderSkillsModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 1. Fetch all available platform services
  const { data: allServices = [], isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: ['super-app-services'],
    queryFn: () => servicesService.getServices(),
    enabled: isOpen,
  });

  // 2. Fetch current provider assigned skills (scoped to authenticated user)
  const { data: mySkills, isLoading: isLoadingMySkills } = useQuery({
    queryKey: ['provider-my-skills', user?.id],
    queryFn: () => serviceAssigneeService.getMySkills(),
    enabled: isOpen && Boolean(user?.id),
  });

  // Sync loaded skills into local state once data is loaded (idempotent bail-out)
  useEffect(() => {
    if (isOpen && mySkills && Array.isArray(mySkills)) {
      const serverSkillIds = new Set(mySkills.map((s) => s.serviceId));
      setSelectedIds((prev) => {
        if (
          prev.size === serverSkillIds.size &&
          Array.from(serverSkillIds).every((id) => prev.has(id))
        ) {
          return prev;
        }
        return serverSkillIds;
      });
    }
  }, [isOpen, mySkills]);


  // Sync Mutation
  const syncMutation = useMutation({
    mutationFn: (ids: string[]) => serviceAssigneeService.syncMySkills(ids),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['provider-my-skills'] });
      queryClient.invalidateQueries({ queryKey: ['provider-assigned-orders'] });
      toast.success(
        `Skills saved successfully! You will now receive job dispatches for ${updated.length} selected services. 🛠️`
      );
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save skills';
      toast.error(msg);
    },
  });

  const toggleService = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(allServices.map((s) => s.id)));
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  const handleSave = () => {
    syncMutation.mutate(Array.from(selectedIds));
  };

  // Group services by category
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return allServices;
    const q = searchQuery.toLowerCase();
    return allServices.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
    );
  }, [allServices, searchQuery]);

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; icon: string; services: Service[] }>();
    filteredServices.forEach((s) => {
      const catName = s.category?.name || 'General Services';
      const catIcon = s.category?.iconUrl || '🛠️';
      if (!map.has(catName)) {
        map.set(catName, { name: catName, icon: catIcon, services: [] });
      }
      map.get(catName)!.services.push(s);
    });
    return Array.from(map.values());
  }, [filteredServices]);

  if (!isOpen) return null;

  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const bgModal = isDarkMode ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-[#e9edef]';
  const bgItem = isDarkMode ? 'bg-[#202c33]/70 hover:bg-[#202c33]' : 'bg-[#f0f2f5]/70 hover:bg-[#f0f2f5]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full max-w-xl max-h-[90vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${bgModal}`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#d9fdd3] dark:bg-[#005c4b]/50 text-[#008069] dark:text-[#25D366]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textPrimary}`}>My Service Skills & Dispatches</h3>
              <p className={`text-xs ${textSecondary}`}>
                Select services you provide. Customer orders will only route to you for checked services.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textSecondary}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-3 border-b border-black/5 dark:border-white/10 flex items-center gap-2 shrink-0">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5">
            <Search className={`w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter services by name..."
              className={`w-full bg-transparent text-xs focus:outline-none ${textPrimary}`}
            />
          </div>

          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap cursor-pointer"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-rose-500 font-bold whitespace-nowrap cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Service Checkbox List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {isLoadingServices || isLoadingMySkills ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#25D366] mx-auto" />
              <p className={`text-xs ${textSecondary}`}>Loading services & your active skills...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No matching services found.
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{cat.icon}</span>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                    {cat.name} ({cat.services.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.services.map((service) => {
                    const isChecked = selectedIds.has(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'bg-[#d9fdd3]/30 dark:bg-[#005c4b]/30 border-[#25D366]'
                            : `${bgItem} border-black/5 dark:border-white/10`
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked
                              ? 'bg-[#008069] text-white'
                              : 'border-2 border-zinc-400 dark:border-zinc-600 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold leading-tight truncate ${textPrimary}`}>
                            {service.name}
                          </p>
                          <p className="text-[11px] font-bold text-[#008069] dark:text-[#25D366] mt-0.5">
                            Base: ৳{service.basePrice}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#008069]/10 text-[#008069] dark:text-[#25D366]">
              {selectedIds.size} Services Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 ${textSecondary} cursor-pointer`}
            >
              Cancel
            </button>
            <button
              disabled={syncMutation.isPending}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba5a] text-white dark:text-[#111b21] font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {syncMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save & Activate Skills</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
