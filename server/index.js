// Minimal Node server for web push scheduling
// Run separately (e.g., node server/index.js)

const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Generate your VAPID keys once and set them as env vars
// npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "REPLACE_ME_PUBLIC";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "REPLACE_ME_PRIVATE";
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:example@example.com";

webpush.setVapidDetails(SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// In-memory store (replace with DB in production)
const subscriptions = new Map(); // key by userId or deviceId

app.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post("/subscribe", (req, res) => {
  const { id, subscription } = req.body;
  if (!id || !subscription) return res.status(400).json({ ok: false });
  subscriptions.set(id, subscription);
  res.json({ ok: true });
});

app.post("/schedule", (req, res) => {
  const { id, when, payload } = req.body; // when: ms epoch
  const sub = subscriptions.get(id);
  if (!sub)
    return res.status(404).json({ ok: false, error: "No subscription" });
  const delay = Math.max(0, (when || 0) - Date.now());
  setTimeout(() => {
    webpush
      .sendNotification(
        sub,
        JSON.stringify(payload || { title: "Raid", body: "Go!" })
      )
      .catch(() => {});
  }, delay);
  res.json({ ok: true, scheduledInMs: delay });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Push server on", PORT));
