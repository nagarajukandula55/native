"use client";

import { useEffect, useState } from "react";

/**
 * PWA install affordance. Android/Desktop Chrome fire `beforeinstallprompt`
 * -- captured and replayed on click. iOS Safari never fires that event (no
 * native install API), so it gets manual "Add to Home Screen" instructions
 * instead. Registers the service worker (public/sw.js) on mount, which is
 * itself a required piece of install criteria alongside manifest.json.
 */
export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setInstalled(!!standalone);

    try {
      setDismissed(localStorage.getItem("native_install_dismissed") === "1");
    } catch {
      /* ignore */
    }

    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (installed || dismissed) return null;

  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function handleClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIos) {
      setShowIosHelp(true);
      return;
    }
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem("native_install_dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  if (!deferredPrompt && !isIos) return null; // nothing actionable to offer

  return (
    <div className="installBar">
      <span>📲 Install the Native app for faster access</span>
      <div className="actions">
        <button onClick={handleClick}>Install</button>
        <button className="dismiss" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>

      {showIosHelp && (
        <div className="iosHelp" onClick={() => setShowIosHelp(false)}>
          <div className="iosCard" onClick={(e) => e.stopPropagation()}>
            <p>To install: tap the Share icon in Safari, then &quot;Add to Home Screen&quot;.</p>
            <button onClick={() => setShowIosHelp(false)}>Got it</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .installBar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #1f3d2b;
          color: #fff;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          z-index: 90;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        button {
          background: #c28b45;
          color: #fff;
          border: none;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }
        .dismiss {
          background: transparent;
          padding: 4px 6px;
        }
        .iosHelp {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
        }
        .iosCard {
          background: #fff;
          color: #222;
          padding: 20px;
          border-radius: 12px;
          max-width: 300px;
          text-align: center;
        }
        .iosCard button {
          margin-top: 12px;
          background: #1f3d2b;
        }
      `}</style>
    </div>
  );
}
