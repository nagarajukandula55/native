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
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
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
      <p className="sub">Install any Native PWA for faster access and a home-screen icon. Open the PWA you need, then use the install button or your browser menu.</p>

      <div className="grid">
        <div className="card">
          <div className="badge live">Available now</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native" className="appIcon" />
          <h2>Native Web App</h2>
          <p>For customers browsing products, placing orders, and tracking deliveries.</p>
          <a className="btn secondary" href="/">Open Storefront →</a>
          {installed ? (
            <button className="btn installed" disabled>✓ Installed</button>
          ) : (
            <button className="btn primary" onClick={handleInstall} disabled={!deferredPrompt && !isIos}>
              {deferredPrompt || isIos ? "Install Now" : "Use your browser menu to install"}
            </button>
          )}
        </div>

        <div className="card">
          <div className="badge live">Available now</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native Shops" className="appIcon" />
          <h2>Native Shops</h2>
          <p>For shops managing incoming orders and confirming handover.</p>
          <a className="btn secondary" href="/shop/login">Open Shops →</a>
        </div>

        <div className="card">
          <div className="badge live">Available now</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native Vendors" className="appIcon" />
          <h2>Native Vendors</h2>
          <p>For approved vendors managing products, orders, inventory, and payouts.</p>
          <a className="btn secondary" href="/login?next=%2Fvendor%2Fdashboard">Open Vendors →</a>
        </div>
      </div>

      <h2 className="teamHeading">For our team</h2>
      <p className="sub">
        These install the same way — straight from the browser, with no app store. Each link opens that PWA&apos;s own
        install page.
      </p>

      <div className="grid">
        <div className="card">
          <div className="badge live">Available now</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/AN_Group_Favicon_256px.png" alt="AN Group Vendor Portal" className="appIcon" />
          <h2>Vendor Portal</h2>
          <p>For vendors managing their own products, orders, inventory, and payouts on the AN Group platform.</p>
          <a className="btn primary" href="https://www.angroup.in/vendor/download">
            Open Install Page →
          </a>
        </div>

        <div className="card">
          <div className="badge live">Available now</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native Executive" className="appIcon" />
          <h2>Native Executive</h2>
          <p>For field executives managing deliveries and order updates on the go.</p>
          <a className="btn primary" href="https://admin.shopnative.in/executive/download">
            Open Install Page →
          </a>
        </div>

        <div className="card">
          <div className="badge live">Available now</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/native_logo_256.png" alt="Native Admin" className="appIcon" />
          <h2>Native Admin</h2>
          <p>For Native administrators managing shops, vendors, products, and operations.</p>
          <a className="btn primary" href="https://admin.shopnative.in/download">
            Open Install Page →
          </a>
        </div>
      </div>

      <div className="installGuide">
        <h2>How to install</h2>
        <p><strong>Android or desktop:</strong> open a link above, then choose Install from the browser prompt or the browser menu.</p>
        <p><strong>iPhone or iPad:</strong> open the link in Safari, tap Share, then choose Add to Home Screen.</p>
        <p>Each PWA installs separately. Sign in with the account for that role after installation.</p>
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
        .teamHeading { margin: 56px 0 8px; font-size: 22px; }
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
          display: inline-block; text-decoration: none; box-sizing: border-box;
        }
        .btn.primary { background: #1f3d2b; color: #fff; }
        .btn.primary:hover { background: #16301f; }
        .btn.secondary { background: #eef6f0; color: #1f3d2b; }
        .btn.secondary:hover { background: #dcecdf; }
        .btn.installed { background: #dcfce7; color: #166534; cursor: default; }
        .btn.disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
        .iosHelp {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 200;
        }
        .iosCard { background: #fff; color: #222; padding: 20px; border-radius: 12px; max-width: 300px; text-align: center; }
        .iosCard button { margin-top: 12px; background: #1f3d2b; color: #fff; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; }
        .installGuide { margin: 40px auto 0; max-width: 650px; padding: 22px; border-radius: 14px; background: #f4f8f5; text-align: left; }
        .installGuide h2 { text-align: center; margin-bottom: 12px; }
        .installGuide p { min-height: 0; margin: 8px 0; }
      `}</style>
    </div>
  );
}
