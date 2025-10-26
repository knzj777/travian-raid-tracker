/* eslint-disable no-restricted-globals */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Show push notifications
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "Alert",
      body: event.data && event.data.text ? event.data.text() : "Notification",
    };
  }

  const title = data.title || "Raid Tracker";
  const body = data.body || "Timer finished";
  const icon = data.icon || "/logo192.png";
  const badge = data.badge || "/logo192.png";
  const tag = data.tag || "raid-tracker";
  const vibrate = data.vibrate || [200, 100, 200];

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      vibrate,
      requireInteraction: true,
      data: data.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification &&
      event.notification.data &&
      event.notification.data.url) ||
    "/travian-raid-tracker/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      })
  );
});
