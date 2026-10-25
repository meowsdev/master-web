'use client';

import React from 'react';
import { BookingModal } from '@/components/modals/BookingModal';
import { AuthModal } from '@/components/modals/AuthModal';
import { CallingModal } from '@/components/modals/CallingModal';
import { StatusViewerModal } from '@/components/modals/StatusViewerModal';
import { SettingsDrawer } from '@/components/modals/SettingsDrawer';
import { ProfileEditorModal } from '@/components/modals/ProfileEditorModal';
import { CreateFilterModal } from '@/components/modals/CreateFilterModal';
import { ServiceDetailsDrawer } from '@/components/super-app/ServiceDetailsDrawer';
import { OrdersDrawer } from '@/components/modals/OrdersDrawer';
import { ProviderSkillsModal } from '@/components/modals/ProviderSkillsModal';
import { Service } from '@/types/service.types';
import { User, UserRole } from '@/types/auth.types';
import { PaymentMode, STATUS_STORIES } from '@/types/super-app.types';

interface SuperAppModalsProps {
  isDarkMode: boolean;
  user: User | null;
  activeRole: string | null;
  isAuthenticated: boolean;
  // Booking Modal
  isBookingModalOpen: boolean;
  onCloseBooking: () => void;
  activeService: Service | null;
  activeServiceRunningOrder: any;
  bookingAddress: string;
  onAddressChange: (addr: string) => void;
  bookingTime: string;
  onTimeChange: (time: string) => void;
  bookingPaymentMode: PaymentMode;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onConfirmBooking: () => void;
  // Auth Modal
  isAuthModalOpen: boolean;
  onCloseAuth: () => void;
  authInitialMode: 'LOGIN' | 'REGISTER';
  onOpenAuth: (mode?: 'LOGIN' | 'REGISTER') => void;
  // Calling Modal
  isCallingModalOpen: boolean;
  onCloseCalling: () => void;
  callType: 'voice' | 'video';
  onStartCall: (type: 'voice' | 'video') => void;
  // Status Viewer
  isStatusViewerOpen: boolean;
  onCloseStatusViewer: () => void;
  // Settings Drawer
  isSettingsDrawerOpen: boolean;
  onCloseSettings: () => void;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenEditProfile: () => void;
  onOpenOrders: () => void;
  onOpenSkillsModal: () => void;
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
  isServiceSaved: boolean;
  onToggleSave: () => void;
  onOpenBooking: () => void;
  // Orders Drawer
  isOrdersDrawerOpen: boolean;
  onCloseOrdersDrawer: () => void;
  onSelectServiceById: (id: string) => void;
  onOrderRevisionRequested?: (orderId: string, issue: string) => void;
  // Skills Modal
  isSkillsModalOpen: boolean;
  onCloseSkillsModal: () => void;
}

export function SuperAppModals({
  isDarkMode,
  user,
  activeRole,
  isAuthenticated,
  isBookingModalOpen,
  onCloseBooking,
  activeService,
  activeServiceRunningOrder,
  bookingAddress,
  onAddressChange,
  bookingTime,
  onTimeChange,
  bookingPaymentMode,
  onPaymentModeChange,
  onConfirmBooking,
  isAuthModalOpen,
  onCloseAuth,
  authInitialMode,
  onOpenAuth,
  isCallingModalOpen,
  onCloseCalling,
  callType,
  onStartCall,
  isStatusViewerOpen,
  onCloseStatusViewer,
  isSettingsDrawerOpen,
  onCloseSettings,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onSwitchRole,
  onOpenEditProfile,
  onOpenOrders,
  onOpenSkillsModal,
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
  isServiceSaved,
  onToggleSave,
  onOpenBooking,
  isOrdersDrawerOpen,
  onCloseOrdersDrawer,
  onSelectServiceById,
  onOrderRevisionRequested,
  isSkillsModalOpen,
  onCloseSkillsModal,
}: SuperAppModalsProps) {
  return (
    <>
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={onCloseBooking}
        service={activeService}
        runningOrder={activeServiceRunningOrder}
        bookingAddress={bookingAddress}
        onAddressChange={onAddressChange}
        bookingTime={bookingTime}
        onTimeChange={onTimeChange}
        bookingPaymentMode={bookingPaymentMode}
        onPaymentModeChange={onPaymentModeChange}
        onConfirmBooking={onConfirmBooking}
        isDarkMode={isDarkMode}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={onCloseAuth}
        initialMode={authInitialMode}
        isDarkMode={isDarkMode}
      />

      <CallingModal
        isOpen={isCallingModalOpen}
        onClose={onCloseCalling}
        service={activeService}
        callType={callType}
        isDarkMode={isDarkMode}
      />

      <StatusViewerModal
        isOpen={isStatusViewerOpen}
        onClose={onCloseStatusViewer}
        stories={STATUS_STORIES}
      />

      <SettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={onCloseSettings}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        user={user}
        activeRole={activeRole}
        onSwitchRole={onSwitchRole}
        onOpenAuth={() => onOpenAuth('LOGIN')}
        onOpenEditProfile={onOpenEditProfile}
        onOpenOrders={onOpenOrders}
        onOpenSkillsModal={onOpenSkillsModal}
        onLogout={onLogout}
      />

      <ProfileEditorModal
        key={`${user?.id || 'guest'}-${isProfileEditorOpen}`}
        isOpen={isProfileEditorOpen}
        onClose={onCloseProfileEditor}
        user={user}
        onUserUpdated={onUserUpdated}
        isDarkMode={isDarkMode}
      />

      <CreateFilterModal
        isOpen={isFilterModalOpen}
        onClose={onCloseFilterModal}
        services={dbServices}
        onCreateFilter={createCustomFilter}
        isDarkMode={isDarkMode}
      />

      <ServiceDetailsDrawer
        isOpen={isServiceDetailsOpen}
        onClose={onCloseServiceDetails}
        service={activeService}
        isSaved={isServiceSaved}
        onToggleSave={onToggleSave}
        onOpenBooking={onOpenBooking}
        onStartCall={onStartCall}
        isDarkMode={isDarkMode}
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

      {isSkillsModalOpen && (
        <ProviderSkillsModal
          isOpen={isSkillsModalOpen}
          onClose={onCloseSkillsModal}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
}
