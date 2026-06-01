import { useEffect, useRef } from 'react';
import { apiFetch } from '../config/api';
import { useAuth } from './useAuth';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || subscribedRef.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let cancelled = false;

    (async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) return;

        const { publicKey } = await apiFetch<{ publicKey: string }>('/notifications/vapid-public-key');
        if (!publicKey || cancelled) return;

        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

        await apiFetch('/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          }),
        });

        subscribedRef.current = true;
      } catch (err) {
        console.warn('Push notifications não disponíveis:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}
