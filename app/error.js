"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Previously there was none, so any unhandled
 * render error anywhere on the site fell through to Next.js's generic
 * unstyled "Application error" screen in production — the worst possible
 * first impression on a live storefront.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Unhandled route error:", error);
  }, [error]);

  return (
    <div className="wrap">
      <div className="card">
        <h1>Something went wrong</h1>
        <p>
          We hit an unexpected error loading this page. It&rsquo;s been
          logged — please try again, or head back home.
        </p>

        <div className="actions">
          <button onClick={() => reset()} className="btn">
            Try again
          </button>
          <Link href="/" className="btnGhost">
            Go home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .wrap {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .card {
          max-width: 440px;
          text-align: center;
          background: #fff;
          border-radius: 14px;
          padding: 40px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }
        h1 {
          margin: 0 0 10px;
          font-size: 22px;
        }
        p {
          color: #666;
          margin: 0 0 24px;
        }
        .actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .btn {
          padding: 12px 24px;
          background: #c28b45;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn:hover {
          background: #a36d32;
        }
        .btnGhost {
          padding: 12px 24px;
          background: #fff;
          color: #333;
          border: 1px solid #ddd;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
