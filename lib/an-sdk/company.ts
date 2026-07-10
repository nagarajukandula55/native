import { anGet, anPost } from "./client";

export async function getCompany() {
  return anGet("/api/company");
}

export async function updateCompany(payload: any) {
  return anPost("/api/company", payload);
}

/**
 * Public, unauthenticated business branding lookup — GET
 * /api/businesses/public?businessId=... on ANgroup (confirmed present:
 * src/app/api/businesses/public/route.ts). Returns only
 * { name, logo, industry } for an active business; no auth required, so
 * it's safe to call from the storefront's root layout to show a dynamic
 * logo instead of the hardcoded static asset. Returns null on any
 * failure (missing businessId, network error, 404, business has no logo
 * set yet) so callers can fall back to the static logo/favicon without
 * failing the whole page render.
 */
export async function getBusinessBranding(): Promise<{
  name: string;
  logo: string | null;
  favicon: string | null;
  industry: string | null;
} | null> {
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID;
  if (!businessId) return null;

  try {
    const data = await anGet(
      `/api/businesses/public?businessId=${encodeURIComponent(businessId)}`
    );
    if (!data?.success || !data?.business) return null;
    return data.business;
  } catch {
    return null;
  }
}
