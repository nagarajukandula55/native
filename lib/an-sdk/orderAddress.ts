/**
 * Shared delivery-address shape for the Fresh / Live Market / Monthly
 * Groceries / Santha order-creation calls (lib/an-sdk/fresh.ts,
 * liveMarket.ts, groceries.ts, santha.ts). Mirrors the `address` snapshot
 * angroup's Fresh/LiveMarket/Grocery/SanthaOrder models now store (see
 * those models' own `address` field comment) -- lat/lng are optional,
 * populated by the browser Geolocation API ("Use my current location").
 */
export type OrderAddressInput = {
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  // Explicit "this is a business purchase" opt-in toggle -- when true,
  // gstNumber is required and the order's outward invoice is classified
  // B2B instead of B2C (see angroup's core/invoicing/dualInvoiceService.ts).
  gstNumber?: string;
  isBusinessPurchase?: boolean;
};
