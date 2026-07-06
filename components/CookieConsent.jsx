"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie_consent";

/**
 * Simple cookie-notice banner. Analytics (Google Analytics) already loads
 * unconditionally in app/layout.tsx — this doesn't gate that (a real
 * consent-mode integration is a bigger, backend-adjacent project), but at
 * minimum the site should disclose cookie use and link to the policy that
 * explains it, which nothing did before this.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable — just don't show the banner */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="banner">
      <p>
        We use cookies to keep you signed in, remember your cart, and
        understand how Native is used. See our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link> for details.
      </p>
      <button onClick={accept}>Got it</button>

      <style jsx>{`
        .banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 200;
          background: #3a2a1c;
          color: #fff;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        p {
          margin: 0;
          font-size: 13px;
          max-width: 640px;
        }
        p :global(a) {
          color: #c28b45;
          font-weight: 600;
          text-decoration: none;
        }
        button {
          padding: 8px 20px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
        }
        button:hover {
          background: #a36d32;
        }
      `}</style>
    </div>
  );
}
