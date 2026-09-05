/**
 * AN SDK — Santha (weekly market, blind-quote flow)
 * ---------------------------------------------------------------
 * SanthaOrder/SanthaItem were split out of the shared GroceryOrder/
 * GroceryItem models into their own fully independent angroup models and
 * API routes (see angroup commits f73d2d8b/ac2d22b5) -- native-admin's
 * executive/admin UI was already re-pointed at these (native-admin commit
 * b515a88). This file re-points the customer-facing native app the same
 * way, replacing the old lib/an-sdk/groceries.ts calls with type: "SANTHA"
 * that were still silently reading/writing the old shared GroceryOrder
 * collection -- the exact same stale-data bug already found and fixed on
 * the admin/executive side.
 *
 * Endpoints confirmed by reading angroup directly:
 *   - src/app/api/santha-items/route.ts     GET ?businessId=&category=
 *   - src/app/api/market-sessions/route.ts  GET ?pincode=&isActive=
 *   - src/app/api/santha-orders/route.ts    GET (scoped to caller) / POST
 *   - src/app/api/santha-orders/[id]/route.ts  GET single order
 *
 * NOTE on "my orders" scoping: GET /api/santha-orders, for a plain
 * customer session, scopes to `{ executiveId: session.user.id } OR
 * { customerId: session.user.id } `, so a customer's own orders ARE
 * returned server-side (unlike the groceries.ts scoping caveat this
 * replaces). We still filter client-side too, belt-and-suspenders.
 */
import { anGet, anPost } from "./client";
export { getShops } from "./groceries";

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

export type SanthaItem = {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category: string;
  unit: string;
  isActive: boolean;
};

/** GET /api/santha-items?businessId=&category= — flat shared Santha catalogue (no shop scoping). */
export async function getSanthaItems(businessId?: string, category?: string) {
  const data = await anGet(
    `/api/santha-items${toQueryString({ businessId: businessId || undefined, category: category || undefined, isActive: true })}`
  );
  return (data?.data || []) as SanthaItem[];
}

/** GET /api/market-sessions?pincode=&isActive= — weekly Santha sessions serving a pincode. */
export async function getMarketSessions(pincode?: string) {
  const data = await anGet(
    `/api/market-sessions${toQueryString({ pincode: pincode || undefined, isActive: true })}`
  );
  return data?.data || [];
}

export type SanthaOrderItemInput = {
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
};

/**
 * POST /api/santha-orders
 * marketSessionId is required; plannedFor is derived server-side from it.
 * No price is sent -- this is the blind-quote flow, the field executive
 * uploads a quoteAmount after shopping. businessId is required by the
 * route's body contract (unlike GET, which also accepts it as a query
 * param) -- filled in here from NEXT_PUBLIC_AN_BUSINESS_ID so callers
 * don't each need to thread it through separately.
 */
export async function createSanthaOrder(payload: {
  customerId: string;
  pincode: string;
  shopId?: string;
  marketSessionId: string;
  items: SanthaOrderItemInput[];
}) {
  const data = await anPost("/api/santha-orders", {
    ...payload,
    businessId: process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "",
  });
  return data?.data;
}

/** GET /api/santha-orders?customerId=, filtered to the current user's own orders. */
export async function getMySanthaOrders(customerId: string) {
  const data = await anGet(`/api/santha-orders${toQueryString({ customerId })}`);
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.filter((o: any) => {
    const ownerId = o?.customerId?._id || o?.customerId;
    return String(ownerId) === String(customerId);
  });
}

/** GET /api/santha-orders/:id — customer can view their own order. */
export async function getSanthaOrder(id: string) {
  const data = await anGet(`/api/santha-orders/${id}`);
  return data?.data;
}
