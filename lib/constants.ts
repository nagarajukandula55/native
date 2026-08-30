// Shared, app-wide business constants that don't yet warrant a full
// admin-configurable settings system. If/when these need to be tuned
// without a redeploy, move them into a business-settings API call
// (see lib/an-sdk/company.ts for the closest existing pattern) instead
// of hardcoding here.

// Minimum cart subtotal (in ₹) required to place a regular e-commerce
// order. Separate from the Groceries/Santha order minimums, which are
// configured independently (see lib/an-sdk/groceries.ts).
export const MIN_ORDER_VALUE = 499;

// Cart subtotal (in ₹) at/above which the small-cart fee is waived.
// Independent from DELIVERY_CHARGE_THRESHOLD below -- these are two
// separate gates, not a shared one. Tunable/eventually admin-configurable
// (same caveat as MIN_ORDER_VALUE above) -- move into a business-settings
// API call when that exists.
export const SMALL_CART_FEE_THRESHOLD = 499;

// Cart subtotal (in ₹) at/above which the delivery charge is waived.
// Independent from SMALL_CART_FEE_THRESHOLD above. Tunable/eventually
// admin-configurable.
export const DELIVERY_CHARGE_THRESHOLD = 999;

// Flat fee (in ₹) applied to carts below SMALL_CART_FEE_THRESHOLD to offset
// the fixed cost of handling a small order. Tunable/eventually
// admin-configurable.
export const SMALL_CART_FEE = 25;

// Flat delivery charge (in ₹) applied to carts below
// DELIVERY_CHARGE_THRESHOLD. Free at/above that threshold. Tunable/eventually
// admin-configurable.
export const DELIVERY_CHARGE = 49;
