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
 * Public homepage banners are owned by Native Admin, the same application
 * where staff create, order and activate them. The browser uses this
 * storefront's same-origin proxy, while server rendering calls Native Admin
 * directly (relative fetch URLs are not valid during Next server rendering).
 *
 * This deliberately does not read ANgroup's similarly named endpoint: that
 * would make the Banner page in Native Admin look configured while the
 * customer homepage continued to show a different data source.
 */
export async function getBanners(): Promise<{ success: boolean; banners: Banner[] }> {
  try {
    const base = process.env.NATIVE_ADMIN_API_URL || "https://admin.shopnative.in";
    const url = typeof window === "undefined"
      ? `${base.replace(/\/$/, "")}/api/storefront/banners`
      : "/api/storefront/banners";
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Unable to load homepage banners");
    const data = await response.json();
    const banners = Array.isArray(data?.banners) ? data.banners : [];
    return { success: data?.success !== false, banners };
  } catch (err) {
    console.error("Banner fetch error:", err);
    return { success: false, banners: [] };
  }
}
