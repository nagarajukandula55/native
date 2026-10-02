import { anPost, anDelete } from "./an-sdk/client";

/**
 * Web Push subscribe/unsubscribe for logged-in customers -- lets angroup
 * push a real OS/browser notification (order picked up, rider on the way)
 * without the customer having the tab open. Pairs with public/sw.js's
 * "push" handler (which actually displays the notification) and
 * angroup's lib/push/sendPushNotification.ts (which sends it).
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function getPushPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

/** Requests notification permission (if needed) and subscribes. */
export async function subscribeToPush(): Promise<{ success: boolean; message?: string }> {
  if (!isPushSupported()) return { success: false, message: "Push notifications aren't supported on this browser." };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { success: false, message: "Push notifications aren't configured yet." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { success: false, message: "Notification permission was not granted." };
  }

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }

  const json = sub.toJSON();
  await anPost("/api/push/subscribe", { endpoint: json.endpoint, keys: json.keys });
  return { success: true };
}

/** Sends a real push to every device this customer is subscribed from. */
export async function sendTestPush(): Promise<{ success: boolean; message?: string }> {
  const result: any = await anPost("/api/push/send-test");
  return { success: !!result?.success, message: result?.message };
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await anDelete("/api/push/subscribe", { endpoint });
}
