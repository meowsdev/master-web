import { create } from 'zustand';

interface OrderHistoryState {
  /** The login that made the selection, so another account never inherits it. */
  userId: string | null;
  orderId: string | null;
  select: (userId: string, orderId: string | null) => void;
}

/** Which order is open in the customer's Orders view. Holds an id only, never order data. */
export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  userId: null,
  orderId: null,
  select: (userId, orderId) => set({ userId, orderId }),
}));

/** The open order id for this user; null when nothing is selected or it belongs to a previous login. */
export const selectOpenOrderId = (userId: string | undefined) => (state: OrderHistoryState) =>
  userId && state.userId === userId ? state.orderId : null;
