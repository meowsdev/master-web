'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';

export function useSuperAppModals() {
  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Place Order panel: the service it opens on (null = customer picks one inside the panel)
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [placeOrderServiceId, setPlaceOrderServiceId] = useState<string | null>(null);

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

  // AGENTS.md §9: only one right-hand panel is open at a time. Opening any of them
  // closes the others, otherwise two panels would pile up on the same spot.
  const providerPanelKind = useOrderPanelStore((state) => state.kind);
  const closeProviderPanel = useOrderPanelStore((state) => state.close);

  const closePanelsExceptProvider = useCallback(() => {
    setIsAuthModalOpen(false);
    setIsSettingsDrawerOpen(false);
    setIsOrdersDrawerOpen(false);
    setIsProfileEditorOpen(false);
    setIsServiceDetailsOpen(false);
    setIsTeamManagementOpen(false);
    setIsLevelingDrawerOpen(false);
    setIsPlaceOrderOpen(false);
  }, []);

  const closeSidePanels = useCallback(() => {
    closePanelsExceptProvider();
    closeProviderPanel();
  }, [closePanelsExceptProvider, closeProviderPanel]);

  // The provider's job panels open from the message box, outside this hook: when one opens, the others close.
  useEffect(
    () =>
      useOrderPanelStore.subscribe((state, previous) => {
        if (state.kind && !previous.kind) closePanelsExceptProvider();
      }),
    [closePanelsExceptProvider],
  );

  const exclusive = useCallback(
    (setPanelOpen: (isOpen: boolean) => void) => (isOpen: boolean) => {
      if (isOpen) closeSidePanels();
      setPanelOpen(isOpen);
    },
    [closeSidePanels],
  );

  const panelSetters = useMemo(
    () => ({
      setIsAuthModalOpen: exclusive(setIsAuthModalOpen),
      setIsSettingsDrawerOpen: exclusive(setIsSettingsDrawerOpen),
      setIsOrdersDrawerOpen: exclusive(setIsOrdersDrawerOpen),
      setIsProfileEditorOpen: exclusive(setIsProfileEditorOpen),
      setIsServiceDetailsOpen: exclusive(setIsServiceDetailsOpen),
      setIsTeamManagementOpen: exclusive(setIsTeamManagementOpen),
      setIsLevelingDrawerOpen: exclusive(setIsLevelingDrawerOpen),
      setIsPlaceOrderOpen: exclusive(setIsPlaceOrderOpen),
    }),
    [exclusive],
  );

  const openSettings = useCallback(() => panelSetters.setIsSettingsDrawerOpen(true), [panelSetters]);
  const openOrders = useCallback(() => panelSetters.setIsOrdersDrawerOpen(true), [panelSetters]);
  const openPlaceOrder = useCallback(
    (serviceId: string | null = null) => {
      setPlaceOrderServiceId(serviceId);
      panelSetters.setIsPlaceOrderOpen(true);
    },
    [panelSetters],
  );
  const openSkillsModal = useCallback(() => setIsSkillsModalOpen(true), []);

  const handleOpenAuth = useCallback((mode: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthInitialMode(mode);
    panelSetters.setIsAuthModalOpen(true);
  }, [panelSetters]);

  const isAnySidePanelOpen =
    isAuthModalOpen ||
    isSettingsDrawerOpen ||
    isOrdersDrawerOpen ||
    isProfileEditorOpen ||
    isServiceDetailsOpen ||
    isTeamManagementOpen ||
    isLevelingDrawerOpen ||
    isPlaceOrderOpen ||
    providerPanelKind !== null;

  return {
    closeSidePanels,
    isAnySidePanelOpen,
    isAuthModalOpen,
    setIsAuthModalOpen: panelSetters.setIsAuthModalOpen,
    authInitialMode,
    handleOpenAuth,
    isPlaceOrderOpen,
    setIsPlaceOrderOpen: panelSetters.setIsPlaceOrderOpen,
    placeOrderServiceId,
    openPlaceOrder,
    callType,
    setCallType,
    isCallingModalOpen,
    setIsCallingModalOpen,
    isStatusViewerOpen,
    setIsStatusViewerOpen,
    isSettingsDrawerOpen,
    setIsSettingsDrawerOpen: panelSetters.setIsSettingsDrawerOpen,
    openSettings,
    isOrdersDrawerOpen,
    setIsOrdersDrawerOpen: panelSetters.setIsOrdersDrawerOpen,
    openOrders,
    isProfileEditorOpen,
    setIsProfileEditorOpen: panelSetters.setIsProfileEditorOpen,
    isServiceDetailsOpen,
    setIsServiceDetailsOpen: panelSetters.setIsServiceDetailsOpen,
    isSkillsModalOpen,
    setIsSkillsModalOpen,
    openSkillsModal,
    isTeamManagementOpen,
    setIsTeamManagementOpen: panelSetters.setIsTeamManagementOpen,
    isLevelingDrawerOpen,
    setIsLevelingDrawerOpen: panelSetters.setIsLevelingDrawerOpen,
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
