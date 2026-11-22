import { create } from 'zustand';
import { CartLine } from '@/types/catalog.types';

const STORAGE_KEY = 'superapp_cart_v1';

/** Carts by main service id: AC Servicing's cart never mixes with Refrigerator Repair's. */
type Carts = Record<string, CartLine[]>;

function load(): Carts {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Carts) : {};
  } catch {
    return {};
  }
}

function save(carts: Carts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carts));
  } catch {
    // Private window or full storage: the cart still works for this visit.
  }
}

interface CartState {
  carts: Carts;
  /** Adds an option, or raises its quantity if it is already in the cart. */
  add: (mainServiceId: string, line: CartLine) => void;
  setQuantity: (mainServiceId: string, variantId: string, quantity: number) => void;
  remove: (mainServiceId: string, variantId: string) => void;
  clear: (mainServiceId: string) => void;
}

/**
 * The customer's carts, kept in this browser so a guest can fill one and log in to order it. Prices here are only
 * what the card showed; the backend prices the order itself.
 */
export const useCartStore = create<CartState>((set, get) => {
  const update = (next: Carts) => {
    save(next);
    set({ carts: next });
  };
  return {
    carts: load(),
    add: (mainServiceId, line) => {
      const current = get().carts[mainServiceId] ?? [];
      const existing = current.find((item) => item.variantId === line.variantId);
      const lines = existing
        ? current.map((item) => (item.variantId === line.variantId ? { ...item, quantity: item.quantity + line.quantity } : item))
        : [...current, line];
      update({ ...get().carts, [mainServiceId]: lines });
    },
    setQuantity: (mainServiceId, variantId, quantity) => {
      const lines = (get().carts[mainServiceId] ?? []).map((item) => (item.variantId === variantId ? { ...item, quantity: Math.max(1, quantity) } : item));
      update({ ...get().carts, [mainServiceId]: lines });
    },
    remove: (mainServiceId, variantId) => {
      const lines = (get().carts[mainServiceId] ?? []).filter((item) => item.variantId !== variantId);
      update({ ...get().carts, [mainServiceId]: lines });
    },
    clear: (mainServiceId) => {
      const next = { ...get().carts };
      delete next[mainServiceId];
      update(next);
    },
  };
});

/** A line's amount as the card showed it: fixed-price options always count once. */
export const cartLineAmount = (line: CartLine) => line.unitPrice * (line.priceUnit === 'FIXED' ? 1 : line.quantity);
