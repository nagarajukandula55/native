/**
 * AN SDK — Fresh (fruits, vegetables, leafy greens etc.)
 * ---------------------------------------------------------------
 * Wraps angroup's shops / fresh-items / fresh-orders
 * endpoints. Unlike Groceries/Santha (lib/an-sdk/groceries.ts), price is
 * NOT a blind quote here -- FreshItem carries a real ratePerUnit the
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

export type FreshItem = {
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

/** GET /api/fresh-items?shopId=&businessId= — a shop's priced catalogue. */
export async function getFreshItems(shopId: string, businessId?: string) {
  const data = await anGet(
    `/api/fresh-items${toQueryString({ shopId, businessId: businessId || undefined, isActive: true })}`
  );
  return (data?.data || []) as FreshItem[];
}

export type FreshOrderItemInput = {
  itemId: string;
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
};

/**
 * POST /api/fresh-orders
 * customerId is required by the backend contract. Price is resolved and
 * snapshotted server-side from each item's current ratePerUnit -- the
 * client never sends a price.
 */
export async function createFreshOrder(payload: {
  customerId: string;
  shopId: string;
  pincode: string;
  items: FreshOrderItemInput[];
}) {
  const data = await anPost("/api/fresh-orders", payload);
  return data?.data;
}

/** GET /api/fresh-orders?customerId=, filtered to the current user's own orders. */
export async function getMyFreshOrders(customerId: string) {
  const data = await anGet(`/api/fresh-orders${toQueryString({ customerId })}`);
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.filter((o: any) => {
    const ownerId = o?.customerId?._id || o?.customerId;
    return String(ownerId) === String(customerId);
  });
}

/** GET /api/fresh-orders/:id — customer can view their own order. */
export async function getFreshOrder(id: string) {
  const data = await anGet(`/api/fresh-orders/${id}`);
  return data?.data;
}
