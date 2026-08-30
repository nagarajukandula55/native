import { anPost } from "./client";

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

/**
 * Admin coupon management. ANgroup's real coupon routes
 * (GET/POST /api/coupons, PUT/DELETE /api/coupons/:id) require either a
 * real ANgroup session or a server-side service-key header — this app has
 * neither available in the browser, so these go through this app's own
 * /api/admin/coupons proxy (same pattern as adminListOrders in orders.ts).
 *
 * Also note ANgroup's actual Coupon schema uses discountType ("PERCENTAGE"
 * | "FIXED") / discountValue / minOrderValue / maxDiscountAmount /
 * usageLimit / usageCount / status ("ACTIVE" | "PAUSED" | ...) / validFrom
 * / validUntil — not the type/value/active/expiry/usedCount shape this
 * page previously assumed (a fictional contract that never matched any
 * real backend).
 */
export async function adminListCoupons() {
  const res = await fetch("/api/admin/coupons", { cache: "no-store" });
  return res.json();
}

export async function adminCreateCoupon(payload: any) {
  const res = await fetch("/api/admin/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function adminUpdateCoupon(id: string, payload: any) {
  const res = await fetch(`/api/admin/coupons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function adminDeleteCoupon(id: string) {
  const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
  return res.json();
}
