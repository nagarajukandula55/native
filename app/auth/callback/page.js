"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeSsoCallback } from "@/lib/an-sdk/sso";
import { useUser } from "@/context/UserContext";

/**
 * Landing spot for AN group's shared login redirect (SSO mode only).
 * In "direct" auth mode this page is simply never visited.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackStatus state="working" />}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useUser();
  const [state, setState] = useState("working");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await completeSsoCallback(searchParams);
      if (cancelled) return;

      if (result.ok) {
        await refreshUser();
        setState("success");
        setTimeout(() => {
          router.push(result.returnTo || "/");
        }, 600);
      } else {
        setState("error");
        setError(result.error || "Sign-in failed");
        setTimeout(() => router.push("/login"), 2000);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CallbackStatus state={state} error={error} />;
}

function CallbackStatus({ state, error }) {
  return (
    <div className="wrap">
      <div className="card">
        {state === "working" && (
          <>
            <div className="spinner" />
            <p>Signing you in...</p>
          </>
        )}
        {state === "success" && <p>Signed in — redirecting...</p>}
        {state === "error" && (
          <>
            <p className="err">Sign-in failed{error ? `: ${error}` : ""}</p>
            <p className="muted">Redirecting to login...</p>
          </>
        )}
      </div>

      <style jsx>{`
        .wrap {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          text-align: center;
          min-width: 260px;
        }
        .spinner {
          width: 32px;
          height: 32px;
          margin: 0 auto 16px;
          border: 3px solid #eee;
          border-top: 3px solid #c28b45;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .err {
          color: #e11d48;
          font-weight: 600;
        }
        .muted {
          color: #888;
          font-size: 13px;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
