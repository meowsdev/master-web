'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useOrderPanelStore } from '@/store/useOrderPanelStore';
import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';

export function useSuperAppModals() {
  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Place Order panel: the service it opens on (null = customer picks one inside the panel)
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [placeOrderServiceId, setPlaceOrderServiceId] = useState<string | null>(null);

  // Calling & Settings
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.location.search.includes('view=orders') : false;
  });

  // Profile & Details
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [isServiceDetailsOpen, setIsServiceDetailsOpen] = useState(false);

  // Counselor Specific Modals

  // AGENTS.md §9: only one right-hand panel is open at a time. Opening any of them
  // closes the others, otherwise two panels would pile up on the same spot.
  const providerPanelKind = useOrderPanelStore((state) => state.kind);
  const closeProviderPanel = useOrderPanelStore((state) => state.close);
  // The Services tab's panels (sub-service details, checkout, custom request) join the same rule.
  const catalogPanelKind = useCatalogPanelStore((state) => state.kind);
  const closeCatalogPanel = useCatalogPanelStore((state) => state.close);

  const closePanelsExceptProvider = useCallback(() => {
    setIsAuthModalOpen(false);
    setIsSettingsDrawerOpen(false);
    setIsOrdersDrawerOpen(false);
    setIsProfileEditorOpen(false);
    setIsServiceDetailsOpen(false);
    setIsPlaceOrderOpen(false);
  }, []);

  const closeSidePanels = useCallback(() => {
    closePanelsExceptProvider();
    closeProviderPanel();
    closeCatalogPanel();
  }, [closePanelsExceptProvider, closeProviderPanel, closeCatalogPanel]);

  // The provider's job panels open from the message box, outside this hook: when one opens, the others close.
  useEffect(
    () =>
      useOrderPanelStore.subscribe((state, previous) => {
        if (state.kind && !previous.kind) {
          closePanelsExceptProvider();
          useCatalogPanelStore.getState().close();
        }
      }),
    [closePanelsExceptProvider],
  );
  useEffect(
    () =>
      useCatalogPanelStore.subscribe((state, previous) => {
        if (state.kind && !previous.kind) {
          closePanelsExceptProvider();
          closeProviderPanel();
        }
      }),
    [closePanelsExceptProvider, closeProviderPanel],
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
    isPlaceOrderOpen ||
    providerPanelKind !== null ||
    catalogPanelKind !== null;

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
  };
}
