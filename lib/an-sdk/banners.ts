import { anGet } from "./client";

export type Banner = {
  id?: string;
  imageUrl: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
};

/**
 * Public, unauthenticated storefront banner list — mirrors the convention
 * used by GET /api/storefront/products (see lib/an-sdk/products.ts):
 * businessId-scoped, no auth required, safe to call from the homepage.
 *
 * Expected shape: { success: true, banners: [{ imageUrl, heading,
 * subheading, ctaText, ctaLink }, ...] } sorted by an admin-configured
 * order. This is a concurrently-developed ANgroup feature — if the route
 * path or shape turns out to differ once it ships, callers here already
 * treat any failure/empty response as "no dynamic banners" and fall back
 * to the static hero slides, so nothing on the storefront breaks either way.
 */
export async function getBanners(): Promise<{ success: boolean; banners: Banner[] }> {
  try {
    const data = await anGet(`/api/storefront/banners`);
    const banners = Array.isArray(data?.banners) ? data.banners : [];
    return { success: true, banners };
  } catch (err) {
    console.error("Banner fetch error:", err);
    return { success: false, banners: [] };
  }
}
