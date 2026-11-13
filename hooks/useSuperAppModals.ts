'use client';

import { useState, useCallback } from 'react';
import { DHAKA_AREAS, PaymentMode } from '@/types/super-app.types';

export function useSuperAppModals() {
  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Booking Modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingAddress, setBookingAddress] = useState(DHAKA_AREAS[0]);
  const [bookingTime, setBookingTime] = useState('Today, Within 2 Hours');
  const [bookingPaymentMode, setBookingPaymentMode] = useState<PaymentMode>('CASH');

  // Calling, Status & Settings
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [isStatusViewerOpen, setIsStatusViewerOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.location.search.includes('view=orders') : false;
  });

  // Profile, Details & Provider Specific Modals
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);
  const [isLevelingDrawerOpen, setIsLevelingDrawerOpen] = useState(false);
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);

  // Counselor Specific Modals
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isCreateCustomOrderModalOpen, setIsCreateCustomOrderModalOpen] = useState(false);
  const [isModifyPriceModalOpen, setIsModifyPriceModalOpen] = useState(false);

  const openSettings = useCallback(() => setIsSettingsDrawerOpen(true), []);
  const openOrders = useCallback(() => setIsOrdersDrawerOpen(true), []);
  const openSkillsModal = useCallback(() => setIsSkillsModalOpen(true), []);

  const handleOpenAuth = useCallback((mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  return {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authInitialMode,
    handleOpenAuth,
    isBookingModalOpen,
    setIsBookingModalOpen,
    bookingAddress,
    setBookingAddress,
    bookingTime,
    setBookingTime,
    bookingPaymentMode,
    setBookingPaymentMode,
    callType,
    setCallType,
    isCallingModalOpen,
    setIsCallingModalOpen,
    isStatusViewerOpen,
    setIsStatusViewerOpen,
    isSettingsDrawerOpen,
    setIsSettingsDrawerOpen,
    openSettings,
    isOrdersDrawerOpen,
    setIsOrdersDrawerOpen,
    openOrders,
    isProfileEditorOpen,
    setIsProfileEditorOpen,
    isServiceDetailsOpen,
    setIsServiceDetailsOpen,
    isSkillsModalOpen,
    setIsSkillsModalOpen,
    openSkillsModal,
    isTeamManagementOpen,
    setIsTeamManagementOpen,
    isLevelingDrawerOpen,
    setIsLevelingDrawerOpen,
    isStartChatOpen,
    setIsStartChatOpen,
    isAddCustomerModalOpen,
    setIsAddCustomerModalOpen,
    isCreateCustomOrderModalOpen,
    setIsCreateCustomOrderModalOpen,
    isModifyPriceModalOpen,
    setIsModifyPriceModalOpen,
  };
}
