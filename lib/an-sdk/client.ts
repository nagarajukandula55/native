/**
 * AN SDK — core HTTP client
 * ---------------------------------------------------------------
 * Every data call in this frontend goes through this file (directly,
 * or via one of the domain modules in lib/an-sdk/*). The backend for
 * all of these endpoints is owned by the AN group repo — this file
 * only needs NEXT_PUBLIC_AN_API to point at wherever that service is
 * deployed (see .env.example at the project root).
 *
 * Endpoint paths mirror the contract documented in the AN group's
 * backend-reference/API_CONTRACT.md bundle, so pointing this at a
 * compliant backend is a pure config change.
 */

const AN_API = process.env.NEXT_PUBLIC_AN_API || "";

// ANgroup is a multi-business backend: every scoped route (products,
// vendors, coupons, ...) needs to know which business the request is
// acting as. The mock backend ignores this entirely. See
// ANGROUP_INTEGRATION_STATUS.md for how Native's businessId gets created.
const AN_BUSINESS_ID = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "";

const TOKEN_KEY = "an_token";

/* =========================================================
   TOKEN STORAGE (client-side session)
   The AN backend returns a bearer token on login/signup. We
   store it in localStorage and attach it to every request.
========================================================= */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore (private browsing, etc.) */
  }
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/* =========================================================
   CORE FETCH
   Accepts either a relative path ("/api/products") or an
   absolute URL. Always sends JSON, always attaches the bearer
   token when present, always parses JSON, always throws a
   typed ApiError on non-2xx so callers can just try/catch.
========================================================= */

export async function anFetch(endpoint: string, options: RequestInit = {}) {
  let url = endpoint.startsWith("http") ? endpoint : `${AN_API}${endpoint}`;

  // ANgroup routes read businessId from a query param (falling back to a
  // header set by its own middleware from a cookie session — which won't
  // exist for a separately-hosted frontend). Attaching it as a query param
  // on every relative call covers that case for any backend that reads it
  // this way; backends that don't care (the mock) just ignore the extra
  // param.
  if (AN_BUSINESS_ID && !endpoint.startsWith("http")) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}businessId=${encodeURIComponent(AN_BUSINESS_ID)}`;
  }

  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (AN_BUSINESS_ID && !headers["x-business-id"]) {
    headers["x-business-id"] = AN_BUSINESS_ID;
  }

  let res: Response;

  try {
    res = await fetch(url, {
      ...options,
      headers,
      // ANgroup's auth model is an httpOnly cookie (an_token) set by its
      // own login route, verified by its middleware — not just a bearer
      // header. "include" lets that cookie flow on cross-origin requests
      // when ANgroup's CORS config allows this frontend's origin with
      // credentials. Harmless no-op against backends (like the mock) that
      // don't use cookies at all.
      credentials: "include",
      cache: options.cache ?? "no-store",
    });
  } catch (err: any) {
    throw new ApiError(
      err?.message || "Network error — could not reach the API",
      0
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const anGet = (endpoint: string, options?: RequestInit) =>
  anFetch(endpoint, { ...options, method: "GET" });

export const anPost = (endpoint: string, body?: any, options?: RequestInit) =>
  anFetch(endpoint, {
    ...options,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const anPut = (endpoint: string, body?: any, options?: RequestInit) =>
  anFetch(endpoint, {
    ...options,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const anPatch = (endpoint: string, body?: any, options?: RequestInit) =>
  anFetch(endpoint, {
    ...options,
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const anDelete = (endpoint: string, body?: any, options?: RequestInit) =>
  anFetch(endpoint, {
    ...options,
    method: "DELETE",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
