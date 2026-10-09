"use client";

import { useEffect } from "react";

/**
 * Runs only when this page is loaded inside the Capacitor native shell
 * (Android app) -- a no-op on the regular website, since @capacitor/core
 * reports isNativePlatform() === false there and this bails out before
 * touching any native plugin.
 *
 * Two jobs:
 *  1. Hide the native splash screen once this page has actually hydrated.
 *     capacitor.config.ts sets launchAutoHide: false specifically so the
 *     splash stays up (instead of a default few-hundred-ms timer) until
 *     this component -- running only once real content is on screen --
 *     hides it. Avoids a flash of a half-loaded/blank WebView while
 *     shopnative.in is still being fetched over the network.
 *  2. Register for push notifications. Requires a Firebase project
 *     (google-services.json dropped into android/app/) to actually
 *     receive pushes; until that's wired up this safely registers the
 *     device but the server has no FCM credentials to send through yet.
 */
export default function NativeShellInit() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let Capacitor;
      try {
        ({ Capacitor } = await import("@capacitor/core"));
      } catch {
        return; // package not available in this build (e.g. the plain web site)
      }
      if (cancelled || !Capacitor.isNativePlatform()) return;

      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        /* splash plugin unavailable -- not fatal */
      }

      let PushNotifications;
      try {
        ({ PushNotifications } = await import("@capacitor/push-notifications"));
      } catch {
        return;
      }
      if (cancelled) return;

      const perm = await PushNotifications.checkPermissions();
      let granted = perm.receive === "granted";
      if (!granted && perm.receive !== "denied") {
        const req = await PushNotifications.requestPermissions();
        granted = req.receive === "granted";
      }
      if (!granted || cancelled) return;

      await PushNotifications.register();

      PushNotifications.addListener("registration", (token) => {
        // TODO once a Firebase project + backend FCM-send endpoint exist:
        // POST token.value to the backend so order-status pushes can be sent.
        console.log("Push registration token:", token.value);
      });
      PushNotifications.addListener("registrationError", (err) => {
        console.error("Push registration error:", err);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
