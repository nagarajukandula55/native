import { anGet, anPost } from "./client";

/**
 * NOTE: ANgroup does not have a /api/payment/mark-paid route at all — its
 * equivalent is /api/orders/mark-paid with a {orderId, mode} body (see
 * lib/an-sdk/orders.ts's markOrderPaid, which is the one that actually
 * matches ANgroup's contract). This function is kept only for backends
 * that do implement /api/payment/mark-paid (the mock backend does); prefer
 * markOrderPaid() for anything talking to ANgroup.
 */
export async function markPaid(orderId: string, utr?: string) {
  return anPost("/api/payment/mark-paid", { orderId, utr });
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId?: string;
}) {
  return anPost("/api/payment/verify", payload);
}

export async function getPaymentSettings() {
  return anGet("/api/admin/payment-settings");
}

export async function updatePaymentSettings(payload: any) {
  return anPost("/api/admin/payment-settings", payload);
}
