'use client';

import React from 'react';
import { LogIn } from 'lucide-react';
import { Service } from '@/types/service.types';
import { ChatMessage } from '@/types/super-app.types';
import { ServiceListItem } from './ServiceListItem';

interface ServiceListProps {
  services: Service[];
  allDbServicesCount: number;
  isLoading: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  activeServiceId: string | null;
  onSelectService: (service: Service) => void;
  isAuthenticated: boolean;
  user: any;
  activeRole: string | null;
  onOpenAuth: () => void;
  runningServiceIds?: string[];
  serviceMessages?: Record<string, ChatMessage[]>;
  activeFilterChip?: string;
  isDarkMode: boolean;
}

export function ServiceList({
  services,
  allDbServicesCount,
  isLoading,
  searchQuery,
  onClearSearch,
  activeServiceId,
  onSelectService,
  isAuthenticated,
  user,
  activeRole,
  onOpenAuth,
  runningServiceIds = [],
  serviceMessages = {},
  activeFilterChip,
  isDarkMode,
}: ServiceListProps) {
  const textPrimary = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
  const textSecondary = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Scrollable List Container */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-xs ${textSecondary}`}>Loading services from database...</p>
          </div>
        ) : allDbServicesCount === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className={`text-sm ${textPrimary}`}>No services found in database.</p>
            <p className={`text-xs ${textSecondary}`}>Add services in database to display them here.</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <p className={`text-sm font-medium ${textPrimary}`}>
              {activeFilterChip === 'Running'
                ? 'No running orders right now'
                : searchQuery
                ? `No services found matching "${searchQuery}"`
                : 'No services in this list yet'}
            </p>
            <p className={`text-xs ${textSecondary}`}>
              {activeFilterChip === 'Running'
                ? 'When you start a service order, it will appear here in running status.'
                : searchQuery
                ? 'Try searching with different keywords'
                : 'Save services or add them when creating custom lists to view them here'}
            </p>
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#005c4b] text-white hover:bg-[#25D366]'
                    : 'bg-[#e7fce3] text-[#075E54] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white'
                }`}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          services.map((service) => {
            const msgs = serviceMessages[service.id] || [];
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            const runningOrder = msgs
              .slice()
              .reverse()
              .find(
                (m) => m.type === 'order_card' && m.orderCard?.status === 'IN_PROGRESS'
              )?.orderCard;

            return (
              <ServiceListItem
                key={service.id}
                service={service}
                isSelected={service.id === activeServiceId}
                isRunning={runningServiceIds.includes(service.id)}
                runningOrderId={runningOrder?.orderId || null}
                lastMessage={lastMsg}
                onSelect={onSelectService}
                isDarkMode={isDarkMode}
              />
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div
        className={`p-3 border-t flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-[#182229] border-[#222e35]' : 'bg-[#f0f2f5] border-[#e9edef]'
        }`}
      >
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#008069] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold truncate ${textPrimary}`}>{user?.name}</p>
              <p className="text-[11px] text-[#25D366] font-bold">{activeRole || 'CUSTOMER'}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs ${textSecondary}`}>Guest Customer</span>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-[#25D366]/25"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
