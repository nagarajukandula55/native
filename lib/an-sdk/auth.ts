import { anGet, anPost, setToken, getToken } from "./client";

/**
 * Login body shape follows ANgroup's real contract, confirmed by reading
 * app/api/auth/login/route.ts on the ANgroup side: it expects
 * {email|username, password} — NOT {identifier, password}. We accept a
 * single "identifier" from callers (since that's simplest for a login form
 * that takes either an email or a username) and send it as both fields;
 * ANgroup's route accepts whichever one is actually an email vs a username.
 */
export async function login(identifier: string, password: string) {
  const data = await anPost("/api/auth/login", {
    email: identifier,
    username: identifier,
    password,
  });
  if (data?.token) setToken(data.token);
  return data;
}

/**
 * ANgroup's route is POST /api/auth/register (not /api/auth/signup), and it
 * does NOT return a token/auto-login on success — it returns
 * {success, message, userId}. Callers of signup() need to follow up with an
 * explicit login() call; this function no longer assumes data.token exists.
 */
export async function signup(payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  businessId?: string;
}) {
  // ANgroup's /api/auth/register accepts an optional businessId in the
  // body so a storefront can register a customer directly against a
  // specific business, instead of relying on its "first B2C-enabled
  // business" fallback. Default it to Native's own business id here so
  // every caller is explicit unless it deliberately overrides it.
  const body = {
    businessId: process.env.NEXT_PUBLIC_AN_BUSINESS_ID,
    ...payload,
  };
  const data = await anPost("/api/auth/register", body);
  if (data?.token) setToken(data.token); // kept defensively for the mock backend, which does return one
  return data;
}

export function logout() {
  setToken(null);
  // Also hit ANgroup's real logout route so its httpOnly an_token cookie
  // gets cleared server-side — clearing localStorage alone isn't enough
  // against a cookie-based backend.
  anPost("/api/auth/logout").catch(() => {});
}

export function isLoggedIn() {
  return !!getToken();
}

/** Current session user. Returns null instead of throwing when logged out. */
export async function getMe() {
  if (!getToken()) return null;
  try {
    const data = await anGet("/api/auth/me");
    return data?.user || null;
  } catch {
    return null;
  }
}

export async function requestPasswordReset(email: string) {
  return anPost("/api/auth/reset-password/request", { email });
}

export async function confirmPasswordReset(payload: {
  token: string;
  password: string;
}) {
  return anPost("/api/auth/reset-password", payload);
}

/**
 * ANgroup-specific: a logged-in user can belong to multiple businesses.
 * These map directly to ANgroup's real /api/auth/switch-business and
 * /api/auth/exit-business routes (confirmed present in its route tree).
 * Not used by the mock backend — safe no-ops there if never called.
 */
export async function switchBusiness(businessId: string) {
  return anPost("/api/auth/switch-business", { businessId });
}

export async function exitBusiness() {
  return anPost("/api/auth/exit-business");
}
