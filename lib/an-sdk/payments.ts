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

export type PaymentCategorySettings = {
  method: "UPI" | "RAZORPAY";
  upiId?: string;
  upiPayeeName?: string;
};

/**
 * GET /api/payment-settings?businessId= -- PUBLIC, no auth (see angroup's
 * middleware.ts PUBLIC_PREFIXES). Tells the storefront which payment
 * method + UPI ID to show per category at checkout/order-detail. Distinct
 * from getPaymentSettings() above, which hits the ADMIN route (session/
 * service-key gated, wrong shape for a customer-facing call).
 */
export async function getPublicPaymentSettings(): Promise<{
  product: PaymentCategorySettings;
  fresh: PaymentCategorySettings;
  liveMarket: PaymentCategorySettings;
  grocery: PaymentCategorySettings;
  santha: PaymentCategorySettings;
}> {
  const data = await anGet("/api/payment-settings");
  return data?.data;
}

/**
 * POST /api/payment/verify-vertical -- the Fresh/Live Market/Grocery/
 * Santha counterpart to verifyPayment() above (which is the generic
 * Product Order's verify route). type identifies which order model to
 * verify against.
 */
export async function verifyVerticalPayment(payload: {
  type: "FRESH" | "LIVE_MARKET" | "GROCERY" | "SANTHA";
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return anPost("/api/payment/verify-vertical", payload);
}
