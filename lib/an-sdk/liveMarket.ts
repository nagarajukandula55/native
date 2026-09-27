/**
 * AN SDK — Live Market (Fish/Chicken/Mutton/Eggs etc.)
 * ---------------------------------------------------------------
 * Wraps angroup's shops / live-market-items / live-market-orders
 * endpoints. Unlike Groceries/Santha (lib/an-sdk/groceries.ts), price is
 * NOT a blind quote here -- LiveMarketItem carries a real ratePerUnit the
 * customer sees before ordering, and angroup snapshots price per line
 * item server-side at order-creation time (never trust a client-computed
 * total). Reuses getShops from groceries.ts (Shop is a generic vendor-
 * location directory shared across verticals).
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

export type LiveMarketItem = {
  _id: string;
  shopId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category: string;
  unit: string;
  ratePerUnit: number;
  isActive: boolean;
};

/** GET /api/live-market-items?shopId=&businessId= — a shop's priced catalogue. */
export async function getLiveMarketItems(shopId: string, businessId?: string) {
  const data = await anGet(
    `/api/live-market-items${toQueryString({ shopId, businessId: businessId || undefined, isActive: true })}`
  );
  return (data?.data || []) as LiveMarketItem[];
}

export type LiveMarketOrderItemInput = {
  itemId: string;
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
};

/**
 * POST /api/live-market-orders
 * customerId is required by the backend contract. Price is resolved and
 * snapshotted server-side from each item's current ratePerUnit -- the
 * client never sends a price.
 */
// businessId is required by the route's body contract -- see the identical
// fix/comment on createGroceryOrder (lib/an-sdk/groceries.ts). Without it
// every Live Market order submission 400'd with "businessId ... required"
// against the real backend, live-tested and confirmed.
export async function createLiveMarketOrder(payload: {
  customerId: string;
  shopId: string;
  pincode: string;
  items: LiveMarketOrderItemInput[];
}) {
  const data = await anPost("/api/live-market-orders", {
    ...payload,
    businessId: process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "",
  });
  return data?.data;
}

/** GET /api/live-market-orders?customerId=, filtered to the current user's own orders. */
export async function getMyLiveMarketOrders(customerId: string) {
  const data = await anGet(`/api/live-market-orders${toQueryString({ customerId })}`);
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.filter((o: any) => {
    const ownerId = o?.customerId?._id || o?.customerId;
    return String(ownerId) === String(customerId);
  });
}

/** GET /api/live-market-orders/:id — customer can view their own order. */
export async function getLiveMarketOrder(id: string) {
  const data = await anGet(`/api/live-market-orders/${id}`);
  return data?.data;
}
