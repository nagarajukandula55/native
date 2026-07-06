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

/** Submit a "Sell on Native" application. */
export async function applyAsVendor(payload: VendorApplication) {
  return anPost("/api/vendors/apply", payload);
}

/** Status of the current user's own vendor application/account, if any. */
export async function getMyVendorStatus() {
  return anGet("/api/vendors/me/status");
}

/* ============================================================
   VENDOR SELF-SERVICE (once approved)
============================================================ */

export async function getVendorProfile() {
  return anGet("/api/vendors/me");
}

export async function updateVendorProfile(payload: Record<string, any>) {
  return anPut("/api/vendors/me", payload);
}

export async function getVendorDashboardStats() {
  return anGet("/api/vendors/me/stats");
}

export async function getVendorProducts(query: Record<string, any> = {}) {
  return anGet(`/api/vendors/me/products${toQueryString(query)}`);
}

export async function createVendorProduct(payload: any) {
  return anPost("/api/vendors/me/products", payload);
}

export async function updateVendorProduct(id: string, payload: any) {
  return anPut(`/api/vendors/me/products/${id}`, payload);
}

export async function deleteVendorProduct(id: string) {
  return anDelete(`/api/vendors/me/products/${id}`);
}

export async function getVendorOrders(query: Record<string, any> = {}) {
  return anGet(`/api/vendors/me/orders${toQueryString(query)}`);
}

export async function updateVendorOrderStatus(orderId: string, status: string) {
  return anPost(`/api/vendors/me/orders/${orderId}/status`, { status });
}

export async function getVendorPayouts(query: Record<string, any> = {}) {
  return anGet(`/api/vendors/me/payouts${toQueryString(query)}`);
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
