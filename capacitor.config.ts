import type { CapacitorConfig } from "@capacitor/cli";

// This app is a server-rendered Next.js site (API routes, dynamic pages) --
// it can't be statically exported into the native bundle the way a
// pure-SPA Capacitor app would be. Instead the native shell loads the live
// production site directly over HTTPS (server.url below), the same
// approach the earlier TWA plan used, but as a real native app shell this
// time -- giving us push notifications and other native plugins that a
// TWA can't provide, while the actual page content and all future
// deploys keep working exactly as they do on the web, no native rebuild
// needed for ordinary site changes.
const config: CapacitorConfig = {
  appId: "in.shopnative.app",
  appName: "Native",
  webDir: "public",
  server: {
    url: "https://shopnative.in",
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    // Keep the splash up until the remote page has actually painted
    // (hidden explicitly from NativePushInit once the site loads) instead
    // of the default ~a few hundred ms, which would otherwise reveal a
    // blank/loading WebView while shopnative.in is still being fetched
    // over the network.
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#faf8f3",
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
