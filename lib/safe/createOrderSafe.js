import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";
import { sanitizeOrderRequest } from "./sanitizeRequest";
import { OrderSchema } from "@/lib/validators/orderValidator";

export async function createOrderSafe(rawBody) {
  // 1. sanitize full request
  const clean = sanitizeOrderRequest(rawBody);

  // 2. validate structure
  const parsed = OrderSchema.safeParse(clean);

  if (!parsed.success) {
    throw new Error("Invalid order payload");
  }

  const data = parsed.data;

  // 🔥 IMPORTANT FIX: sanitize items strictly
  const safeItems = (data.cart || []).map((item) => ({
    productId: item.productId,
    productKey: item.productKey || null,
    qty: item.qty || 1,
    price: item.price || 0,
    gstPercent: item.gstPercent || 0,
    baseAmount: item.baseAmount || 0,
    total: item.total || 0,
    image: item.image || "",
    // ❌ DO NOT include name unless schema supports it
  }));

  // 3. final order creation (STRICT SAFE)
  const orderDoc = await Order.create({
    orderId: await generateOrderId(),

    items: safeItems,
    amount: Number(rawBody.amount || 0),

    address: {
      name: data.address?.name || "",
      phone: data.address?.phone || "",
      email: data.address?.email || "",
      address: data.address?.address || "",
      city: data.address?.city || "",
      state: data.address?.state || "",
      pincode: data.address?.pincode || "",
      gstNumber: data.address?.gstNumber || null,
    },

    status: "PENDING_PAYMENT",

    payment: {
      method: data.paymentMethod,
    },
  });

  return orderDoc;
}
