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
 * ANgroup has NO customer-scoped "my orders" endpoint (no /api/orders/get,
 * /api/orders/mine, or anything auth-filtered) — the only listing route is
 * GET /api/orders/list, which returns EVERY order in the database with no
 * auth check or filtering at all (confirmed by reading
 * src/app/api/orders/list/route.ts: it's a bare Order.find({}), no
 * business/user scoping whatsoever). That's a real ANgroup-side gap —
 * both a missing customer-scoped route and, more importantly, an
 * unauthenticated endpoint leaking every business's full order data.
 *
 * Until ANgroup adds a properly scoped + authenticated route, we fetch the
 * full list and filter client-side to the logged-in user's own orders by
 * matching customerId/userId/customer.email against the current session.
 * This is a workaround, not a fix — flagging clearly for a follow-up pass
 * on the ANgroup side.
 */
export async function getMyOrders() {
  const [data, me] = await Promise.all([getOrders(), getMe()]);
  const all = data?.orders || [];
  if (!me) return { success: data?.success, orders: [] };

  const mine = all.filter((o: any) => {
    if (me.id && (o.userId === me.id || o.customerId === me.id)) return true;
    if (me.email && (o.customer?.email === me.email || o.email === me.email)) return true;
    return false;
  });

  return { success: data?.success, orders: mine };
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
