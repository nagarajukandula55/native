"use client";

import { useEffect, useState } from "react";

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setInstalled(!!standalone);
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIos) {
      setShowIosHelp(true);
    }
  }

  return (
    <div className="container">
      <h1>Get the Native App</h1>
      <p className="sub">Install Native for faster access, offline browsing of pages you've visited, and a home-screen icon — no app store needed.</p>

      <div className="grid">
        <div className="card">
          <div className="badge live">Available now</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native" className="appIcon" />
          <h2>Native Web App</h2>
          <p>Installs directly from your browser — works on Android, iOS, and desktop. Updates automatically, no store review needed.</p>
          {installed ? (
            <button className="btn installed" disabled>✓ Installed</button>
          ) : (
            <button className="btn primary" onClick={handleInstall}>
              📲 Install Now
            </button>
          )}
        </div>

        <div className="card">
          <div className="badge soon">Coming soon</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native for Android" className="appIcon dimmed" />
          <h2>Native for Android</h2>
          <p>A standalone app on the Google Play Store, with push notifications and deeper device integration.</p>
          <button className="btn disabled" disabled>Coming Soon</button>
        </div>

        <div className="card">
          <div className="badge soon">Coming soon</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native for iOS" className="appIcon dimmed" />
          <h2>Native for iOS</h2>
          <p>A standalone app on the Apple App Store, with push notifications and deeper device integration.</p>
          <button className="btn disabled" disabled>Coming Soon</button>
        </div>
      </div>

      {showIosHelp && (
        <div className="iosHelp" onClick={() => setShowIosHelp(false)}>
          <div className="iosCard" onClick={(e) => e.stopPropagation()}>
            <p>To install on iOS: tap the Share icon in Safari, then &quot;Add to Home Screen&quot;.</p>
            <button onClick={() => setShowIosHelp(false)}>Got it</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 900px; margin: 40px auto; padding: 0 20px 60px; text-align: center; }
        h1 { margin: 0 0 8px; }
        .sub { color: #666; max-width: 560px; margin: 0 auto 32px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .card {
          background: #fff; border-radius: 14px; padding: 28px 20px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; align-items: center; gap: 10px;
          position: relative;
        }
        .badge {
          position: absolute; top: 14px; right: 14px; font-size: 11px; font-weight: 700;
          padding: 3px 9px; border-radius: 20px;
        }
        .badge.live { background: #dcfce7; color: #166534; }
        .badge.soon { background: #f3f4f6; color: #6b7280; }
        .appIcon { width: 72px; height: 72px; border-radius: 18px; margin-top: 8px; }
        .appIcon.dimmed { opacity: 0.4; }
        h2 { margin: 4px 0 0; font-size: 18px; }
        p { color: #666; font-size: 13px; margin: 0; min-height: 54px; }
        .btn {
          margin-top: 8px; padding: 11px 22px; border-radius: 30px; border: none;
          font-weight: 700; font-size: 14px; cursor: pointer; width: 100%;
        }
        .btn.primary { background: #1f3d2b; color: #fff; }
        .btn.primary:hover { background: #16301f; }
        .btn.installed { background: #dcfce7; color: #166534; cursor: default; }
        .btn.disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
        .iosHelp {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 200;
        }
        .iosCard { background: #fff; color: #222; padding: 20px; border-radius: 12px; max-width: 300px; text-align: center; }
        .iosCard button { margin-top: 12px; background: #1f3d2b; color: #fff; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; }
      `}</style>
    </div>
  );
}
