import { anGet, anPost } from "./client";
import { getMe } from "./auth";

export async function createOrder(payload: any) {
  return anPost("/api/orders/create", payload);
}

/**
 * ANgroup has no GET /api/orders/:id route — the real lookup route is
 * GET /api/orders/get-by-id?orderId=... (confirmed by reading
 * src/app/api/orders/get-by-id/route.ts). Routed through getOrderById so
 * every caller hits the real endpoint.
 */
export async function getOrder(orderId: string) {
  return getOrderById(orderId);
}

export async function getOrderById(orderId: string) {
  return anGet(`/api/orders/get-by-id?orderId=${encodeURIComponent(orderId)}`);
}

/**
 * GET /api/orders/list on the ANgroup backend now requires a session and
 * scopes to the caller's own orders for a plain customer (see that route's
 * own comment) -- it used to be a bare, unauthenticated Order.find({})
 * returning every business's full order data, which this function worked
 * around with a client-side re-filter against the logged-in user. That
 * workaround is no longer necessary now that the backend fix has shipped.
 */
export async function getMyOrders() {
  const me = await getMe();
  if (!me) return { success: false, orders: [] };
  return getOrders();
}

export async function getTimeline(orderId: string) {
  return anGet(`/api/orders/timeline/${orderId}`);
}

/**
 * NOTE (admin-side gap, out of this pass's scope): ANgroup has no
 * /api/orders/add-note, /api/orders/status, /api/orders/update-status,
 * or /api/admin/orders route today — only create, get-by-id, list,
 * mark-paid, and timeline/[id] exist under src/app/api/orders. These
 * admin-only helpers (addOrderNote, setOrderStatus, updateOrderStatus,
 * adminGetOrders below) will 404 against the real backend until ANgroup
 * adds matching routes. Left as-is since fixing admin tooling wasn't in
 * scope for this pass — flagging here for a follow-up.
 */
export async function addOrderNote(orderId: string, note: string) {
  return anPost("/api/orders/add-note", { orderId, note });
}

export async function getOrders() {
  return anGet("/api/orders/list");
}

/**
 * Admin order listing. GET /api/orders/list on ANgroup requires either a
 * real ANgroup session cookie (which this frontend never has — its bearer
 * token isn't that cookie) or a service-key header, which must stay
 * server-side. Goes through this app's own /api/admin/orders proxy route
 * instead of anGet(), so the request carries that server-only key.
 */
export async function adminListOrders(params: Record<string, string | number | undefined> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  const res = await fetch(`/api/admin/orders${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return res.json();
}

export async function adminGetOrders() {
  return anGet("/api/admin/orders");
}

export async function setOrderStatus(orderId: string, status: string) {
  return anPost("/api/orders/status", { orderId, status });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return anPost("/api/orders/update-status", { orderId, status });
}

export async function adminUpdateOrderStatus(orderId: string, status: string) {
  return anPost("/api/admin/orders/update-status", { orderId, status });
}

/**
 * ANgroup's real /api/orders/mark-paid route expects {orderId, mode}
 * where mode is "MANUAL" | "SYSTEM" — not {orderId, utr} like the old
 * backend contract assumed. Defaulting mode to "MANUAL" (an admin marking
 * an order paid by hand) since that's this function's typical caller;
 * pass "SYSTEM" explicitly for an automated/webhook-driven mark-paid.
 */
export async function markOrderPaid(orderId: string, mode: "MANUAL" | "SYSTEM" = "MANUAL") {
  return anPost("/api/orders/mark-paid", { orderId, mode });
}
