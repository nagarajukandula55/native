/**
 * AN SDK — Monthly Groceries & Santha (weekly market) orders
 * ---------------------------------------------------------------
 * Wraps ANgroup's grocery-orders / shops / market-sessions endpoints,
 * confirmed by reading the route files directly in the angroup repo:
 *   - src/app/api/shops/route.ts            GET ?businessId=&pincode=&isActive=
 *   - src/app/api/market-sessions/route.ts  GET ?businessId=&pincode=&isActive=
 *     (pincode filters against the MarketSession.areaPincodes array field)
 *   - src/app/api/grocery-orders/route.ts   GET (scoped to caller) / POST
 *   - src/app/api/grocery-orders/[id]/route.ts  GET single order
 *
 * NOTE on "my orders" scoping: GET /api/grocery-orders force-scopes callers
 * who don't hold the grocery_orders:view permission to
 * `filter.executiveId = session.user.id` — it does NOT fall back to
 * customerId for a plain customer session. We still pass customerId (it's
 * honored for callers who *do* have broad view access), and additionally
 * filter the result client-side to the current user's own orders as a
 * belt-and-suspenders guard. If a customer session gets back an empty list
 * that should have orders, that backend scoping is the reason — it needs a
 * customerId fallback added server-side (out of scope for this frontend
 * task, flagged here for whoever owns angroup next).
 */
import { anGet, anPost } from "./client";

function toQueryString(params: Record<string, any> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export type GroceryOrderItemInput = {
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
};

/** GET /api/shops?pincode=&isActive= — shops serving a pincode for Monthly Groceries. */
export async function getShops(pincode?: string) {
  const data = await anGet(
    `/api/shops${toQueryString({ pincode: pincode || undefined, isActive: true })}`
  );
  return data?.data || [];
}

/** GET /api/market-sessions?pincode=&isActive= — weekly Santha sessions serving a pincode. */
export async function getMarketSessions(pincode?: string) {
  const data = await anGet(
    `/api/market-sessions${toQueryString({ pincode: pincode || undefined, isActive: true })}`
  );
  return data?.data || [];
}

/**
 * POST /api/grocery-orders
 * type: "MONTHLY_GROCERY" (requires shopId) | "SANTHA" (requires marketSessionId).
 * customerId is required by the backend contract — callers must pass the
 * logged-in user's id (from useUser()/getMe()).
 */
export async function createGroceryOrder(payload: {
  type: "MONTHLY_GROCERY" | "SANTHA";
  customerId: string;
  pincode: string;
  shopId?: string;
  marketSessionId?: string;
  items: GroceryOrderItemInput[];
}) {
  const data = await anPost("/api/grocery-orders", payload);
  return data?.data;
}

/**
 * GET /api/grocery-orders?customerId=&status=, filtered to the given
 * type client-side (the backend contract has no `type` query param) and
 * to the current user's own orders (see the scoping note above).
 */
export async function getMyGroceryOrders(
  customerId: string,
  type: "MONTHLY_GROCERY" | "SANTHA"
) {
  const data = await anGet(`/api/grocery-orders${toQueryString({ customerId })}`);
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.filter((o: any) => {
    const ownerId = o?.customerId?._id || o?.customerId;
    return o?.type === type && String(ownerId) === String(customerId);
  });
}

/** GET /api/grocery-orders/:id — customer can view their own order. */
export async function getGroceryOrder(id: string) {
  const data = await anGet(`/api/grocery-orders/${id}`);
  return data?.data;
}
