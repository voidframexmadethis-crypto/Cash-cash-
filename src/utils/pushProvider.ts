// CASHMERE KID$ Standards-Based Web Push & Notification Provider Integration

export interface NotificationPreferences {
  newBeats: boolean;
  beatPurchases: boolean;
  beatPacks: boolean;
  announcements: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  imageUrl?: string;
  destination?: string;
  deliveryStatus: 'Delivered' | 'Failed' | 'Processing';
  audience: string;
}

// Check if browser/device supports standard Web Push notifications
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Check if running on iOS / Safari
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

// Check if running as a standalone Home Screen web app (required for Web Push on iOS)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
  return Notification.permission;
}

// Securely register the Service Worker
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    console.log('[WebPushProvider] Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[WebPushProvider] Service Worker registration failed:', error);
    return null;
  }
}

// Request permission under deliberate user gesture (WebKit iOS rule)
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  
  // Register service worker if supported
  await registerPushServiceWorker();

  const permission = await Notification.requestPermission();
  console.log('[WebPushProvider] Notification permission status:', permission);
  return permission;
}

// Deliver standard Web Push notification payload (WebKit Visible Notification Requirement)
export async function showLocalNotification(title: string, body: string, url: string = '/') {
  if (!isPushSupported() || Notification.permission !== 'granted') return;

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg) {
      reg.showNotification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=192&h=192&q=80',
        badge: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=192&h=192&q=80',
        data: { url }
      });

      // Update app badge if supported by browser/device
      if ('setAppBadge' in navigator) {
        (navigator as any).setAppBadge(1).catch((err: any) => console.log('Badge error:', err));
      }
    }
  } catch (err) {
    // Fallback if Service Worker is not fully active yet
    new Notification(title, {
      body,
      icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=192&h=192&q=80'
    });
  }
}

// Clear notification badge
export function clearNotificationBadge() {
  if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
    (navigator as any).clearAppBadge().catch((err: any) => console.log('Clear badge error:', err));
  }
}
