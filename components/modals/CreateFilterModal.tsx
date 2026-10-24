'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, Check, ListFilter } from 'lucide-react';
import { Service } from '@/types/service.types';

interface CreateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onCreateFilter: (name: string, serviceIds: string[]) => void;
  isDarkMode: boolean;
}

export function CreateFilterModal({
  isOpen,
  onClose,
  services,
  onCreateFilter,
  isDarkMode,
}: CreateFilterModalProps) {
  const [filterName, setFilterName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = () => {
    setFilterName('');
    setSelectedIds([]);
    setSearchQuery('');
    onClose();
  };

  // Filter services shown in selection list based on search
  const displayedServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase().trim();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }, [services, searchQuery]);

  if (!isOpen) return null;

  const toggleSelectService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === services.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(services.map((s) => s.id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterName.trim()) return;
    onCreateFilter(filterName.trim(), selectedIds);
  };

  const bgModal = isDarkMode ? 'bg-[#222e35] text-[#e9edef]' : 'bg-white text-[#111b21]';
  const inputBg = isDarkMode ? 'bg-[#111b21] border-[#374248] text-white' : 'bg-[#f0f2f5] border-[#e9edef] text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';
  const rowHover = isDarkMode ? 'hover:bg-[#111b21]/60' : 'hover:bg-[#f5f6f6]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-[88vh] overflow-hidden ${bgModal}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#008069]/15 text-[#008069] dark:text-[#25D366] flex items-center justify-center">
              <ListFilter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Create Custom List</h3>
              <p className={`text-[12px] ${textSecondary}`}>Group services to quickly filter your chats</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-[#54656f] dark:text-[#8696a0] hover:text-[#111b21] dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-5 space-y-4 shrink-0">
            {/* List Name Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-80">
                List Name
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="e.g., Home Maintenance, AC, Urgent"
                maxLength={25}
                required
                autoFocus
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-[#008069] dark:focus:ring-[#25D366] ${inputBg}`}
              />
              <span className={`text-[11px] float-right mt-1 ${textSecondary}`}>
                {filterName.length}/25
              </span>
            </div>

            {/* Service Search & Header */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Select Services ({selectedIds.length}/{services.length})
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-[#008069] dark:text-[#25D366] hover:underline cursor-pointer"
                >
                  {selectedIds.length === services.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className={`flex items-center px-3 py-1.5 rounded-lg border text-xs ${inputBg}`}>
                <Search className="w-3.5 h-3.5 mr-2 opacity-60 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services to include..."
                  className="bg-transparent border-none outline-none w-full placeholder:opacity-60"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3 opacity-60" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Services Checklist */}
          <div className="flex-1 overflow-y-auto px-5 divide-y divide-inherit border-t border-b border-inherit">
            {displayedServices.length === 0 ? (
              <div className="py-8 text-center text-xs opacity-60">No services found</div>
            ) : (
              displayedServices.map((service) => {
                const isSelected = selectedIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleSelectService(service.id)}
                    className={`flex items-center justify-between py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${rowHover}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#f0f2f5] dark:bg-[#111b21] flex items-center justify-center text-sm shrink-0">
                        {service.category?.iconUrl || '🛠️'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{service.name}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          ৳{service.basePrice}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ml-3 ${
                        isSelected
                          ? 'bg-[#008069] border-[#008069] text-white dark:bg-[#25D366] dark:border-[#25D366] dark:text-[#111b21]'
                          : 'border-gray-400 dark:border-gray-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-full text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer ${textSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!filterName.trim()}
              className="px-5 py-2 rounded-full text-sm font-medium bg-[#008069] hover:bg-[#00705c] dark:bg-[#25D366] dark:hover:bg-[#20ba59] text-white dark:text-[#111b21] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
            >
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
