import { anGet, anPost, anDelete } from "./client";

/**
 * ANgroup DOES have a real per-user wishlist backend (src/app/api/wishlist/
 * route.ts: GET/POST/DELETE, one document per userId+businessId) — an
 * earlier pass's note that "ANgroup has no wishlist backend at all" is
 * stale. However, context/WishlistContext.tsx (what the storefront
 * actually uses) is still purely localStorage-based and never calls these
 * functions — that's a fine, working, zero-backend-dependency experience
 * for guests, but it means a logged-in user's wishlist doesn't follow them
 * across devices/browsers. Wiring WishlistContext to sync through these
 * functions would be a real enhancement, not done in this pass (kept
 * scoped to fixing what's broken). These functions are corrected to match
 * ANgroup's real contract so they're usable when that wiring happens:
 * GET/POST/DELETE all require businessId explicitly in the body (or query
 * for GET/DELETE) — client.ts's automatic businessId query param/header
 * covers the GET case, but POST/DELETE read it from the JSON body, so it's
 * included explicitly below. There is no /api/wishlist/sync route.
 */
export async function getServerWishlist(): Promise<{ id: string; name: string; slug: string; price: number }[]> {
  const data = await anGet("/api/wishlist");
  return data?.products || [];
}

export async function addServerWishlistItem(productId: string) {
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "";
  return anPost("/api/wishlist", { businessId, productId });
}

export async function removeServerWishlistItem(productId: string) {
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "";
  return anDelete("/api/wishlist", { businessId, productId });
}
