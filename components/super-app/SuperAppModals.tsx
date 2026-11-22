'use client';

import React from 'react';
import { PlaceOrderPanel } from '@/components/modals/place-order/PlaceOrderPanel';
import { AuthModal } from '@/components/modals/AuthModal';
import { CallingModal } from '@/components/modals/CallingModal';
import { SettingsDrawer } from '@/components/modals/SettingsDrawer';
import { ProfileEditorModal } from '@/components/modals/ProfileEditorModal';
import { ServicePreviewPanel } from '@/components/modals/ServicePreviewPanel';
import { OrdersDrawer } from '@/components/modals/OrdersDrawer';
import { Service } from '@/types/service.types';
import { Order } from '@/types/order.types';
import { User, UserRole } from '@/types/auth.types';

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
  // Service Details Drawer
  isServiceDetailsOpen: boolean;
  onCloseServiceDetails: () => void;
  onOpenBooking: () => void;
  // Orders Drawer
  isOrdersDrawerOpen: boolean;
  onCloseOrdersDrawer: () => void;
  onSelectServiceById: (id: string) => void;
  onOrderRevisionRequested?: (orderId: string, issue: string) => void;
}

/* The app-wide drawers and modals, shared by every role. */
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
  isServiceDetailsOpen,
  onCloseServiceDetails,
  onOpenBooking,
  isOrdersDrawerOpen,
  onCloseOrdersDrawer,
  onSelectServiceById,
  onOrderRevisionRequested,
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
    </>
  );
}
