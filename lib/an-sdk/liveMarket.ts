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
import type { OrderAddressInput } from "./orderAddress";
export type { OrderAddressInput } from "./orderAddress";

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
  // Raw, shop-entered values -- NOT what's charged/shown. Use
  // displayRatePerUnit below for anything customer-facing; the backend
  // still authoritatively recomputes the real price at order-creation time
  // regardless of what's sent, so this is a display-only distinction.
  basePrice: number;
  ratePerUnit: number;
  // All-inclusive price (shop markup + AN Group's platform fee folded in)
  // -- this is the one real price to show/add up on the storefront.
  displayRatePerUnit: number;
  priceChangePercent: number;
  // Cleaning/cutting service, applicable to some items (fish/prawns etc).
  // When offered, the customer can opt in at order time; the charge shows
  // as its own visible price-breakup line, never folded into the unit price.
  offersCleaning?: boolean;
  cleaningCharge?: number;
  // Enable/disable -- "if enabled we ship it". false means the shop/admin
  // has marked this unavailable today; it still shows in the catalogue
  // (Out of Stock, not addable to cart) rather than disappearing.
  isActive: boolean;
};

export type OperatingHoursStatus = {
  enabled: boolean;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
};

/**
 * GET /api/live-market-items?shopId=&businessId= — a shop's priced
 * catalogue. Requests isActive=all deliberately -- a disabled item must
 * still show up here (marked Out of Stock in the UI via its own isActive
 * flag, not addable to cart), not disappear entirely. Also returns
 * operatingHours so the UI can show a Closed banner and block ordering
 * outside the configured window, mirroring what the order-creation route
 * itself enforces server-side.
 */
export async function getLiveMarketItems(shopId: string, businessId?: string) {
  const data = await anGet(
    `/api/live-market-items${toQueryString({ shopId, businessId: businessId || undefined, isActive: "all" })}`
  );
  return {
    items: (data?.data || []) as LiveMarketItem[],
    operatingHours: (data?.operatingHours || { enabled: false, openTime: "06:00", closeTime: "22:00", isOpen: true }) as OperatingHoursStatus,
  };
}

export type LiveMarketOrderItemInput = {
  itemId: string;
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
  // Opt-in to the item's cleaning/cutting service, if it offers one --
  // the backend re-validates this against the item's own offersCleaning/
  // cleaningCharge and adds it as its own visible order line.
  wantsCleaning?: boolean;
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
  address: OrderAddressInput;
  items: LiveMarketOrderItemInput[];
  couponCode?: string;
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
