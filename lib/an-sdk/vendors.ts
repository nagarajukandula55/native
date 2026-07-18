/**
 * Multi-vendor marketplace SDK module.
 *
 * NONE of these routes exist in the original backend-reference bundle —
 * the original app was single-seller ("Native" sold everything itself).
 * Every function here is a proposal for what AN group's shared backend
 * needs to expose so Native can operate as one tenant/business inside a
 * multi-vendor marketplace, with its own vendors selling under it.
 * See backend-reference/MULTI_VENDOR_PROPOSAL.md for the full shape
 * (models, response bodies, state machine) each of these is expected to
 * return. Every call still goes through the same anGet/anPost/etc client
 * as the rest of the SDK, so once AN group implements these they work
 * with zero changes on this side.
 */

import { anGet, anPost, anPut, anDelete } from "./client";

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

/* ============================================================
   VENDOR ONBOARDING (a user applying to sell on Native)
============================================================ */

export type VendorApplication = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  gstNumber?: string;
  category?: string;
  message?: string;
};

/**
 * Submit a "Sell on Native" application.
 * ANgroup's real /api/vendors/apply route (path matches exactly) expects
 * companyName/contactPerson rather than businessName/contactName, plus
 * panNumber/businessType/address/bankDetails — mapping the fields we do
 * collect onto its shape here so the path match isn't undone by a field
 * mismatch. Anything ANgroup requires that our form doesn't collect yet
 * (panNumber, businessType, bankDetails) is sent as empty/undefined; add
 * those form fields when the vendor-onboarding UI needs to go further.
 */
export async function applyAsVendor(payload: VendorApplication) {
  return anPost("/api/vendors/apply", {
    companyName: payload.businessName,
    contactPerson: payload.contactName,
    email: payload.email,
    phone: payload.phone,
    gstNumber: payload.gstNumber,
    category: payload.category,
    message: payload.message,
  });
}

/** Status of the current user's own vendor application/account, if any. */
export async function getMyVendorStatus() {
  return anGet("/api/vendors/me/status");
}

/* ============================================================
   VENDOR SELF-SERVICE (once approved)
   ---------------------------------------------------------------
   Paths below point at ANgroup's REAL routes (confirmed by reading
   its route files): singular "/api/vendor/*", not "/api/vendors/me/*"
   as originally proposed. ANgroup implements dashboard/orders/profile;
   there's no confirmed equivalent for per-product CRUD or a payouts
   list distinct from "statement" — those are flagged below and will
   404 against ANgroup until it adds them. Mock backend still uses the
   original /api/vendors/me/* paths, so these functions will only work
   fully against ANgroup once mock-backend/server.js is updated to
   match, or a config toggle is added — for today's ANgroup go-live,
   these point at ANgroup's real paths.
============================================================ */

export async function getVendorProfile() {
  return anGet("/api/vendor/profile");
}

export async function updateVendorProfile(payload: Record<string, any>) {
  return anPut("/api/vendor/profile", payload);
}

export async function getVendorDashboardStats() {
  return anGet("/api/vendor/dashboard");
}

/**
 * ANgroup's real vendor-scoped product CRUD lives at /api/vendor-products
 * (hyphenated, not nested under /api/vendor/) -- GET+POST on the
 * collection, GET+PUT+DELETE on /api/vendor-products/:id (see
 * src/app/api/vendor-products/route.ts and .../[id]/route.ts). This SDK
 * was calling the nested /api/vendor/products/* path, which doesn't
 * exist and 404'd every call.
 */
export async function getVendorProducts(query: Record<string, any> = {}) {
  return anGet(`/api/vendor-products${toQueryString(query)}`);
}

export async function createVendorProduct(payload: any) {
  return anPost("/api/vendor-products", payload);
}

export async function updateVendorProduct(id: string, payload: any) {
  return anPut(`/api/vendor-products/${id}`, payload);
}

export async function deleteVendorProduct(id: string) {
  return anDelete(`/api/vendor-products/${id}`);
}

export async function getVendorOrders(query: Record<string, any> = {}) {
  return anGet(`/api/vendor/orders${toQueryString(query)}`);
}

export async function updateVendorOrderStatus(orderId: string, status: string) {
  return anPost(`/api/vendor/orders/${orderId}/status`, { status });
}

/**
 * ANgroup's confirmed route is /api/vendor/statement, not a distinct
 * "/payouts" list — mapped here so existing callers don't need to change.
 */
export async function getVendorPayouts(query: Record<string, any> = {}) {
  return anGet(`/api/vendor/statement${toQueryString(query)}`);
}

/* ============================================================
   PUBLIC VENDOR STOREFRONTS
============================================================ */

export async function getPublicVendor(idOrSlug: string) {
  return anGet(`/api/vendors/${encodeURIComponent(idOrSlug)}`);
}

export async function getPublicVendorProducts(
  idOrSlug: string,
  query: Record<string, any> = {}
) {
  return anGet(
    `/api/vendors/${encodeURIComponent(idOrSlug)}/products${toQueryString(query)}`
  );
}

export async function listPublicVendors(query: Record<string, any> = {}) {
  return anGet(`/api/vendors${toQueryString(query)}`);
}

/* ============================================================
   ADMIN — vendor management
============================================================ */

export async function adminListVendors(query: Record<string, any> = {}) {
  return anGet(`/api/admin/vendors${toQueryString(query)}`);
}

export async function adminGetVendor(id: string) {
  return anGet(`/api/admin/vendors/${id}`);
}

export async function adminApproveVendor(id: string) {
  return anPost(`/api/admin/vendors/${id}/approve`, {});
}

export async function adminRejectVendor(id: string, reason?: string) {
  return anPost(`/api/admin/vendors/${id}/reject`, { reason });
}

export async function adminSuspendVendor(id: string, reason?: string) {
  return anPost(`/api/admin/vendors/${id}/suspend`, { reason });
}

export async function adminReinstateVendor(id: string) {
  return anPost(`/api/admin/vendors/${id}/reinstate`, {});
}

/* ============================================================
   BUSINESS / TENANT REGISTRATION
   ("Native" registering itself as a business inside the shared
   AN group platform — a one-time, admin-only setup step, distinct
   from vendors registering *under* Native.)
============================================================ */

export type BusinessRegistrationStatus = {
  registered: boolean;
  businessId?: string;
  businessName?: string;
  status?: "pending" | "active" | "suspended";
  [key: string]: any;
};

export async function getBusinessRegistrationStatus(): Promise<BusinessRegistrationStatus> {
  return anGet("/api/business/status");
}

export async function registerBusiness(payload: {
  businessName: string;
  legalName?: string;
  gstNumber?: string;
  contactEmail: string;
  contactPhone?: string;
}) {
  return anPost("/api/business/register", payload);
}

export async function updateBusinessSettings(payload: Record<string, any>) {
  return anPut("/api/business/settings", payload);
}
