/**
 * Pluggable SSO abstraction.
 *
 * Native's customers/vendors/admins all ultimately need to be the *same*
 * identities the rest of the AN group's properties use. Exactly how AN
 * group exposes that (hosted login page + redirect, OAuth2/OIDC, a shared
 * session cookie, something else) isn't finalized yet, so this module
 * keeps the mechanism behind a small, swappable surface instead of baking
 * one protocol into every page.
 *
 * Two modes, switched with a single env var:
 *
 *   NEXT_PUBLIC_AUTH_MODE=direct  (default) - today's flow: the frontend
 *     posts credentials straight to lib/an-sdk/auth.ts (login/signup) and
 *     stores the bearer token it gets back. No redirect involved.
 *
 *   NEXT_PUBLIC_AUTH_MODE=sso     - the frontend never collects a password
 *     itself. It redirects the browser to AN group's shared login
 *     (NEXT_PUBLIC_AN_SSO_URL), the user authenticates there exactly like
 *     they would on any other AN group property, and AN group redirects
 *     back to /auth/callback on this site with either:
 *       - `?token=...`            a bearer token straight in the query, or
 *       - `?code=...&state=...`   an auth code this frontend exchanges for
 *                                  a token via POST /api/auth/sso/exchange
 *                                  (a proposed endpoint — see
 *                                  backend-reference/API_CONTRACT.md).
 *
 * Whichever mode is active, once we have a token we call the existing
 * setToken()/getToken() pair from client.ts, so every other SDK module
 * (and the whole app) is completely unaware of which mode produced it.
 */

import { anPost, getToken, setToken } from "./client";

export type AuthMode = "direct" | "sso";

const CALLBACK_STATE_KEY = "an_sso_return_to";

export function getAuthMode(): AuthMode {
  const mode = (process.env.NEXT_PUBLIC_AUTH_MODE || "direct").toLowerCase();
  return mode === "sso" ? "sso" : "direct";
}

export function isSsoMode(): boolean {
  return getAuthMode() === "sso";
}

function getSsoConfig() {
  return {
    ssoUrl: process.env.NEXT_PUBLIC_AN_SSO_URL || "",
    clientId: process.env.NEXT_PUBLIC_AN_SSO_CLIENT_ID || "native",
  };
}

/** True once the pieces needed to actually redirect somewhere are present. */
export function isSsoConfigured(): boolean {
  return isSsoMode() && !!getSsoConfig().ssoUrl;
}

/**
 * Builds the URL to send the browser to for AN group's shared login page.
 * `returnTo` is where we want the user to land inside this app after a
 * successful login (defaults to wherever they are right now).
 */
export function buildSsoLoginUrl(returnTo?: string): string {
  const { ssoUrl, clientId } = getSsoConfig();
  if (!ssoUrl) return "";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const redirectUri = `${origin}/auth/callback`;
  const target =
    returnTo ||
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "/");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    state: target,
  });

  const separator = ssoUrl.includes("?") ? "&" : "?";
  return `${ssoUrl}${separator}${params.toString()}`;
}

/** Redirects the browser to AN group's shared login. No-op outside the browser. */
export function startSsoLogin(returnTo?: string) {
  if (typeof window === "undefined") return;
  const url = buildSsoLoginUrl(returnTo);
  if (!url) {
    console.error(
      "[sso] NEXT_PUBLIC_AN_SSO_URL is not set — cannot start SSO login."
    );
    return;
  }
  try {
    window.sessionStorage.setItem(CALLBACK_STATE_KEY, returnTo || "/");
  } catch {
    /* sessionStorage unavailable — state param in the URL is the fallback */
  }
  window.location.href = url;
}

export type SsoCallbackResult = {
  ok: boolean;
  returnTo: string;
  error?: string;
};

/**
 * Called from app/auth/callback/page.js once AN group redirects back here.
 * Handles both the "token straight in the query" shape and the
 * "code to exchange" shape described above.
 */
export async function completeSsoCallback(
  searchParams: URLSearchParams
): Promise<SsoCallbackResult> {
  const errorParam = searchParams.get("error");
  if (errorParam) {
    return { ok: false, returnTo: "/login", error: errorParam };
  }

  let returnTo = searchParams.get("state") || "/";
  try {
    const stored = window.sessionStorage.getItem(CALLBACK_STATE_KEY);
    if (stored) returnTo = stored;
  } catch {
    /* ignore */
  }

  const directToken = searchParams.get("token");
  if (directToken) {
    setToken(directToken);
    return { ok: true, returnTo };
  }

  const code = searchParams.get("code");
  if (code) {
    try {
      // Proposed endpoint — AN group's backend exchanges the auth code for
      // a bearer token the same way it would for any other property.
      const data = await anPost("/api/auth/sso/exchange", { code });
      if (data?.token) {
        setToken(data.token);
        return { ok: true, returnTo };
      }
      return { ok: false, returnTo: "/login", error: "No token returned" };
    } catch (err: any) {
      return {
        ok: false,
        returnTo: "/login",
        error: err?.message || "SSO exchange failed",
      };
    }
  }

  return { ok: false, returnTo: "/login", error: "Missing token or code" };
}

/** Convenience re-export so callers only need one import for "am I logged in". */
export function hasSession(): boolean {
  return !!getToken();
}
