import { anGet, anPatch } from "./client";

const AN_BUSINESS_ID = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || "";

/**
 * ANgroup has no `/api/company` route — Native's business record lives at
 * `/api/businesses/:id` (see ANgroup's src/app/api/businesses/[id]/route.ts).
 * Calling a nonexistent route used to 404 silently and leave the invoice/
 * company pages showing nothing (or ANgroup's own "AN Group" platform
 * sentinel business wherever a caller elsewhere resolved with no real
 * business id — see Business.ts's `isPlatform` field comment). Mapped here
 * to the field names ANgroup's Business model actually uses.
 */
/**
 * Reads any ANgroup Business record by id and maps it to the flat field
 * names the admin Company/Invoice UI uses. Generic so it can be pointed at
 * either Native's own businessId (getCompany() below) or another business
 * in the same ANgroup instance — e.g. AN Group's own platform business
 * record, whose GST/legal details Native's invoices are actually issued
 * under (see the admin "AN Group Settings" page).
 */
export async function getBusinessById(businessId: string) {
  if (!businessId) {
    return { success: false, data: null };
  }

  const data = await anGet(`/api/businesses/${businessId}`);
  if (!data?.success || !data?.business) {
    return { success: false, data: null };
  }

  const b = data.business;
  return {
    success: true,
    data: {
      companyName: b.name || b.brandName || "",
      legalName: b.legalName || "",
      brandTagline: b.brandName || "",

      addressLine1: b.address || "",
      addressLine2: "",
      city: b.city || "",
      pincode: b.pincode || "",
      state: b.state || "",
      country: b.country || "India",

      phone: b.phone || "",
      email: b.email || "",
      whatsapp: b.phone || "",

      gstin: b.compliance?.gstNumber || "",
      pan: b.compliance?.pan || "",
      stateCode: b.gstStateCode || "",

      logoUrl: b.logo || "",
      signatureUrl: b.documentSignatureUrl || "",
      stampUrl: "",
    },
  };
}

export async function updateBusinessById(businessId: string, payload: any) {
  if (!businessId) {
    return { success: false, message: "Missing business id" };
  }

  const body = {
    name: payload.companyName,
    legalName: payload.legalName,
    brandName: payload.brandTagline,
    address: payload.addressLine1,
    city: payload.city,
    pincode: payload.pincode,
    state: payload.state,
    gstStateCode: payload.stateCode,
    logo: payload.logoUrl,
    compliance: {
      gstNumber: payload.gstin,
      pan: payload.pan,
    },
  };

  return anPatch(`/api/businesses/${businessId}`, body);
}

export async function getCompany() {
  if (!AN_BUSINESS_ID) return { success: false, data: null };
  return getBusinessById(AN_BUSINESS_ID);
}

export async function updateCompany(payload: any) {
  if (!AN_BUSINESS_ID) {
    return { success: false, message: "NEXT_PUBLIC_AN_BUSINESS_ID is not set" };
  }
  return updateBusinessById(AN_BUSINESS_ID, payload);
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
