"use client";

/**
 * Recently-viewed products — pure client-side (localStorage), no backend
 * dependency. We store a small denormalized snapshot per product so the
 * "Recently viewed" rail can render instantly with zero extra fetches.
 */

const KEY = "recentlyViewed";
const MAX_ITEMS = 12;

export type RecentlyViewedItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
};

export function getRecentlyViewed(excludeId?: string): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const items: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
    return excludeId
      ? items.filter((i) => i.productId !== excludeId)
      : items;
  } catch {
    return [];
  }
}

export function trackProductView(product: any) {
  if (typeof window === "undefined" || !product) return;

  const productId = product.productId || product._id;
  if (!productId) return;

  const entry: RecentlyViewedItem = {
    productId,
    slug: product.slug || "",
    name: product.name || product.displayName || "Product",
    price: Number(
      product.price ||
        product.displayPrice ||
        product.sellingPrice ||
        product.minPrice ||
        0
    ),
    image: product.image || product.images?.[0] || "/placeholder.png",
    viewedAt: Date.now(),
  };

  try {
    const existing = getRecentlyViewed().filter(
      (i) => i.productId !== productId
    );
    const next = [entry, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}
