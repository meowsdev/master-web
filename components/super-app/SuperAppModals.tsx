'use client';

import React from 'react';
import { PlaceOrderPanel } from '@/components/modals/place-order/PlaceOrderPanel';
import { AuthModal } from '@/components/modals/AuthModal';
import { CallingModal } from '@/components/modals/CallingModal';
import { StatusViewerModal } from '@/components/modals/StatusViewerModal';
import { SettingsDrawer } from '@/components/modals/SettingsDrawer';
import { ProfileEditorModal } from '@/components/modals/ProfileEditorModal';
import { CreateFilterModal } from '@/components/modals/CreateFilterModal';
import { ServicePreviewPanel } from '@/components/modals/ServicePreviewPanel';
import { OrdersDrawer } from '@/components/modals/OrdersDrawer';
import { TeamManagementDrawer } from '@/components/modals/TeamManagementDrawer';
import { ProviderLevelingDrawer } from '@/components/modals/ProviderLevelingDrawer';
import { ProviderStartChatModal } from '@/components/modals/ProviderStartChatModal';
import { Service } from '@/types/service.types';
import { Order } from '@/types/order.types';
import { User, UserRole } from '@/types/auth.types';
import { STATUS_STORIES } from '@/types/super-app.types';

interface SuperAppModalsProps {
  isDarkMode: boolean;
  user: User | null;
  activeRole: string | null;
  isAuthenticated: boolean;
  activeService: Service | null;
  // Place Order panel
  isPlaceOrderOpen: boolean;
  onClosePlaceOrder: () => void;
  placeOrderServiceId: string | null;
  onOrderPlaced: (order: Order) => void;
  // Auth Modal
  isAuthModalOpen: boolean;
  onCloseAuth: () => void;
  authInitialMode: 'LOGIN' | 'REGISTER';
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  // Calling Modal
  isCallingModalOpen: boolean;
  onCloseCalling: () => void;
  callType: 'voice' | 'video';
  // Status Viewer
  isStatusViewerOpen: boolean;
  onCloseStatusViewer: () => void;
  // Settings Drawer
  isSettingsDrawerOpen: boolean;
  onCloseSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenEditProfile: () => void;
  onOpenOrders: () => void;
  onLogout: () => void;
  // Profile Editor
  isProfileEditorOpen: boolean;
  onCloseProfileEditor: () => void;
  onUserUpdated: (u: User) => void;
  // Filter Modal
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  dbServices: Service[];
  createCustomFilter: (name: string, ids: string[]) => void;
  // Service Details Drawer
  isServiceDetailsOpen: boolean;
  onCloseServiceDetails: () => void;
  onOpenBooking: () => void;
  // Orders Drawer
  isOrdersDrawerOpen: boolean;
  onCloseOrdersDrawer: () => void;
  onSelectServiceById: (id: string) => void;
  onOrderRevisionRequested?: (orderId: string, issue: string) => void;
  // Provider Specific Drawers & Modals
  isTeamManagementOpen?: boolean;
  onCloseTeamManagement?: () => void;
  isLevelingDrawerOpen?: boolean;
  onCloseLevelingDrawer?: () => void;
  isStartChatOpen?: boolean;
  onCloseStartChat?: () => void;
  onProviderStartChat?: (serviceId: string, customerPhone: string) => void;
}

export function SuperAppModals({
  isDarkMode,
  user,
  activeRole,
  isAuthenticated,
  activeService,
  isPlaceOrderOpen,
  onClosePlaceOrder,
  placeOrderServiceId,
  onOrderPlaced,
  isAuthModalOpen,
  onCloseAuth,
  authInitialMode,
  onOpenAuth,
  isCallingModalOpen,
  onCloseCalling,
  callType,
  isStatusViewerOpen,
  onCloseStatusViewer,
  isSettingsDrawerOpen,
  onCloseSettings,
  soundEnabled,
  onToggleSound,
  onSwitchRole,
  onOpenEditProfile,
  onOpenOrders,
  onLogout,
  isProfileEditorOpen,
  onCloseProfileEditor,
  onUserUpdated,
  isFilterModalOpen,
  onCloseFilterModal,
  dbServices,
  createCustomFilter,
  isServiceDetailsOpen,
  onCloseServiceDetails,
  onOpenBooking,
  isOrdersDrawerOpen,
  onCloseOrdersDrawer,
  onSelectServiceById,
  onOrderRevisionRequested,
  isTeamManagementOpen = false,
  onCloseTeamManagement = () => {},
  isLevelingDrawerOpen = false,
  onCloseLevelingDrawer = () => {},
  isStartChatOpen = false,
  onCloseStartChat = () => {},
  onProviderStartChat = () => {},
}: SuperAppModalsProps) {
  return (
    <>
      {isPlaceOrderOpen && (
        <PlaceOrderPanel
          initialServiceId={placeOrderServiceId}
          onClose={onClosePlaceOrder}
          onPlaced={onOrderPlaced}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={onCloseAuth}
        initialMode={authInitialMode}
        isDarkMode={isDarkMode}
      />

      {isCallingModalOpen && (
        <CallingModal
          isOpen={isCallingModalOpen}
          onClose={onCloseCalling}
          service={activeService}
          callType={callType}
          isDarkMode={isDarkMode}
        />
      )}

      <StatusViewerModal
        isOpen={isStatusViewerOpen}
        onClose={onCloseStatusViewer}
        stories={STATUS_STORIES}
      />

      <SettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={onCloseSettings}
        isDarkMode={isDarkMode}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        user={user}
        activeRole={activeRole}
        onSwitchRole={onSwitchRole}
        onOpenEditProfile={onOpenEditProfile}
        onOpenOrders={onOpenOrders}
        onOpenAuth={() => onOpenAuth('LOGIN')}
        onLogout={onLogout}
      />

      <ProfileEditorModal
        isOpen={isProfileEditorOpen}
        onClose={onCloseProfileEditor}
        user={user}
        onUserUpdated={onUserUpdated}
        isDarkMode={isDarkMode}
        onLogout={onLogout}
      />

      <CreateFilterModal
        isOpen={isFilterModalOpen}
        onClose={onCloseFilterModal}
        services={dbServices}
        onCreateFilter={createCustomFilter}
        isDarkMode={isDarkMode}
      />

      {/* The same "Service info" panel guests get; here its button starts a booking. */}
      <ServicePreviewPanel
        service={isServiceDetailsOpen ? activeService : null}
        onClose={onCloseServiceDetails}
        primaryActionLabel="Book Service"
        onPrimaryAction={() => {
          onCloseServiceDetails();
          onOpenBooking();
        }}
      />

      <OrdersDrawer
        isOpen={isOrdersDrawerOpen}
        onClose={onCloseOrdersDrawer}
        onSelectServiceById={onSelectServiceById}
        onOpenAuth={() => onOpenAuth('LOGIN')}
        onOrderRevisionRequested={onOrderRevisionRequested}
        isAuthenticated={isAuthenticated}
        isDarkMode={isDarkMode}
      />

      {/* Provider Team Management Drawer */}
      <TeamManagementDrawer
        isOpen={isTeamManagementOpen}
        onClose={onCloseTeamManagement}
        isDarkMode={isDarkMode}
      />

      {/* Provider Leveling & Earnings Center */}
      <ProviderLevelingDrawer
        isOpen={isLevelingDrawerOpen}
        onClose={onCloseLevelingDrawer}
        isDarkMode={isDarkMode}
      />

      {/* Provider Flow B Direct Chat Modal */}
      <ProviderStartChatModal
        services={dbServices}
        isOpen={isStartChatOpen}
        onClose={onCloseStartChat}
        onChatStarted={onProviderStartChat}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
