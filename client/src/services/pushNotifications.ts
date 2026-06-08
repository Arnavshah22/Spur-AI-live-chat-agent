const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace('/chat', '') ||
  'http://localhost:3001/api';

export function isPushNotificationSupported(): boolean {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function subscribeToPush(
  conversationId: string
): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      console.log('Push notifications not supported');
      return false;
    }

    // Check permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) return false;

    // Get VAPID public key
    const keyResponse = await fetch(`${API_BASE}/push/vapid-public-key`);
    if (!keyResponse.ok) {
      console.log('Push notifications not configured on server');
      return false;
    }
    const { publicKey } = await keyResponse.json();

    // Subscribe to push
    const subscription =
      (await registration.pushManager.getSubscription()) ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    // Send subscription to server
    const subscribeResponse = await fetch(`${API_BASE}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        subscription: subscription.toJSON(),
      }),
    });

    if (!subscribeResponse.ok) {
      throw new Error('Failed to subscribe to push notifications');
    }

    console.log('Subscribed to push notifications');
    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}
