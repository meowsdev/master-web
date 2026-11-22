'use client';

import { useCatalogPanelStore } from '@/store/useCatalogPanelStore';
import { Order } from '@/types/order.types';
import { CartCheckoutPanel } from './CartCheckoutPanel';
import { CustomOrderPanel } from './CustomOrderPanel';
import { SubServiceDetailsPanel } from './SubServiceDetailsPanel';

/* The one open Services-tab panel, if any: a sub-service's details, the cart checkout or the Custom request. */
export function CatalogPanels({ onOrderPlaced }: { onOrderPlaced: (order: Order) => void }) {
  const { kind, mainServiceId, subServiceId, close } = useCatalogPanelStore();
  if (!kind || !mainServiceId) return null;

  const placed = (order: Order) => {
    close();
    onOrderPlaced(order);
  };

  if (kind === 'subService' && subServiceId) return <SubServiceDetailsPanel mainServiceId={mainServiceId} subServiceId={subServiceId} onClose={close} />;
  if (kind === 'checkout') return <CartCheckoutPanel mainServiceId={mainServiceId} onClose={close} onPlaced={placed} />;
  if (kind === 'custom') return <CustomOrderPanel mainServiceId={mainServiceId} onClose={close} onPlaced={placed} />;
  return null;
}
