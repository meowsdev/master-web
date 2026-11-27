'use client';

import React from 'react';
import { PlaceOrderPanel } from '@/components/modals/place-order/PlaceOrderPanel';
import { AuthModal } from '@/components/modals/AuthModal';
import { CallingModal } from '@/components/modals/CallingModal';
import { ProfileEditorModal } from '@/components/modals/ProfileEditorModal';
import { ServicePreviewPanel } from '@/components/modals/ServicePreviewPanel';
import { OrdersDrawer } from '@/components/modals/OrdersDrawer';
import { Service } from '@/types/service.types';
import { Order } from '@/types/order.types';
import { User } from '@/types/auth.types';

interface SuperAppModalsProps {
  isDarkMode: boolean;
  user: User | null;
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
  // Sound on/off (a row of the profile panel) and log out
  soundEnabled: boolean;
  onToggleSound: () => void;
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
  soundEnabled,
  onToggleSound,
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

      <ProfileEditorModal
        isOpen={isProfileEditorOpen}
        onClose={onCloseProfileEditor}
        user={user}
        onUserUpdated={onUserUpdated}
        isDarkMode={isDarkMode}
        onLogout={onLogout}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
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
