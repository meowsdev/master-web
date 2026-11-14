/**
 * Tells other open tabs about auth events (logout / token refresh).
 * BroadcastChannel where available, `localStorage` events as the fallback
 * (older Safari); both deliver only to *other* tabs, never to the sender.
 */
export type AuthChannelMessage = 'LOGOUT' | 'REFRESHED';

const CHANNEL_NAME = 'master-auth';
const STORAGE_EVENT_KEY = 'master_auth_event';

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  channel ??= new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function broadcastAuthEvent(message: AuthChannelMessage) {
  if (typeof window === 'undefined') return;

  const bc = getChannel();
  if (bc) {
    bc.postMessage(message);
    return;
  }
  try {
    // A changing value is required for the `storage` event to fire again.
    localStorage.setItem(STORAGE_EVENT_KEY, `${message}:${Date.now()}`);
  } catch {
    // storage unavailable: other tabs will recover on their next 401
  }
}

export function subscribeToAuthEvents(
  onMessage: (message: AuthChannelMessage) => void,
): () => void {
  const bc = getChannel();
  if (bc) {
    const handler = (event: MessageEvent<AuthChannelMessage>) =>
      onMessage(event.data);
    bc.addEventListener('message', handler);
    return () => bc.removeEventListener('message', handler);
  }

  const handler = (event: StorageEvent) => {
    if (event.key !== STORAGE_EVENT_KEY || !event.newValue) return;
    onMessage(event.newValue.split(':')[0] as AuthChannelMessage);
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
