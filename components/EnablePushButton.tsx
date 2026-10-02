"use client";

import { useEffect, useState } from "react";
import { getPushPermissionState, isSubscribedToPush, subscribeToPush } from "@/lib/push";

/**
 * "Enable order updates" prompt -- shown on order-detail pages so the
 * customer can opt into real push notifications (rider on the way, etc.)
 * right when it's obviously relevant, rather than an unexplained permission
 * popup on first page load. Hides itself once subscribed, unsupported, or
 * permanently denied (nothing useful to do in that last case but note it).
 */
export default function EnablePushButton() {
  const [state, setState] = useState<"checking" | "offer" | "subscribed" | "denied" | "unsupported">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const permission = await getPushPermissionState();
      if (permission === "unsupported") return !cancelled && setState("unsupported");
      if (permission === "denied") return !cancelled && setState("denied");
      const subscribed = await isSubscribedToPush();
      if (!cancelled) setState(subscribed ? "subscribed" : "offer");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleEnable() {
    setBusy(true);
    setError("");
    const result = await subscribeToPush();
    if (result.success) {
      setState("subscribed");
    } else {
      setError(result.message || "Could not enable notifications.");
    }
    setBusy(false);
  }

  if (state === "checking" || state === "unsupported" || state === "subscribed") return null;

  return (
    <div className="pushPrompt">
      {state === "denied" ? (
        <p className="deniedNote">
          🔕 Notifications are blocked for this site — enable them in your browser settings to get a heads-up when
          your rider is on the way.
        </p>
      ) : (
        <>
          <p>🔔 Get notified the moment your rider picks up your order.</p>
          <button type="button" onClick={handleEnable} disabled={busy}>
            {busy ? "Enabling…" : "Enable order updates"}
          </button>
          {error && <p className="error">{error}</p>}
        </>
      )}
      <style jsx>{`
        .pushPrompt {
          background: #fff7ec;
          border: 1px solid #f0e2c6;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #444;
        }
        p {
          margin: 0 0 8px;
        }
        .deniedNote {
          margin: 0;
          color: #888;
        }
        button {
          background: #c28b45;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error {
          color: #e11d48;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
