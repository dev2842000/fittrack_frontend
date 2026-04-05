'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function usePushNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true);
      setPermission(Notification.permission);
      // Check if already subscribed
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    if (!supported) return false;
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      // Get VAPID public key
      const { data } = await api.get('/push/vapid-public-key');
      if (!data.publicKey) return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });

      await api.post('/push/subscribe', sub.toJSON());
      setSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscribe error:', err);
      return false;
    }
  };

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/push/subscribe', { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    }
  };

  return { supported, permission, subscribed, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const len = rawData.length;
  const output = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
