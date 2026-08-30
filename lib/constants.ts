// Shared, app-wide business constants that don't yet warrant a full
// admin-configurable settings system. If/when these need to be tuned
// without a redeploy, move them into a business-settings API call
// (see lib/an-sdk/company.ts for the closest existing pattern) instead
// of hardcoding here.

// Minimum cart subtotal (in ₹) required to place a regular e-commerce
// order. Separate from the Groceries/Santha order minimums, which are
// configured independently (see lib/an-sdk/groceries.ts).
export const MIN_ORDER_VALUE = 499;
