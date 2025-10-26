// Utilities for Push API subscription and sending to backend

export async function askNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

export async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    try {
      const swUrl = `${process.env.PUBLIC_URL || ""}/sw.js`;
      reg = await navigator.serviceWorker.register(swUrl);
    } catch {
      return null;
    }
  }
  return reg;
}

export async function subscribePush(publicVapidKey) {
  const reg = await getServiceWorkerRegistration();
  if (!reg || !("pushManager" in reg)) return null;
  try {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    return sub;
  } catch (err) {
    return null;
  }
}

export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
  return await res.json().catch(() => ({}));
}
