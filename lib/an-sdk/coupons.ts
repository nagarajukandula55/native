import { anGet, anPost, anPatch, anDelete } from "./client";

/**
 * ANgroup's real /api/coupons/validate route (path matches exactly) reads
 * {businessId, code, orderValue} — not {code, subtotal}. businessId is
 * already attached automatically by client.ts (via NEXT_PUBLIC_AN_BUSINESS_ID)
 * as a query param/header, but this route apparently expects it in the
 * body too, so it's sent explicitly here as well for safety. Sending both
 * `subtotal` and `orderValue` keeps this working against the mock backend
 * (which reads `subtotal`) at the same time.
 */
export async function validateCoupon(code: string, subtotal: number) {
  const businessId = process.env.NEXT_PUBLIC_AN_BUSINESS_ID || undefined;
  return anPost("/api/coupons/validate", {
    code,
    subtotal,
    orderValue: subtotal,
    businessId,
  });
}

export async function adminListCoupons() {
  return anGet("/api/coupons");
}

export async function adminCreateCoupon(payload: any) {
  return anPost("/api/coupons/create", payload);
}

export async function adminToggleCoupon(id: string, active: boolean) {
  return anPatch("/api/coupons/toggle", { id, active });
}

export async function adminDeleteCoupon(id: string) {
  return anDelete("/api/coupons/delete", { id });
}
