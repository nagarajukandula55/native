import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";
import { sanitizeOrderRequest } from "./sanitizeRequest";
import { OrderSchema } from "@/lib/validators/orderValidator";

export async function createOrderSafe(rawBody) {
  // 1. sanitize
  const clean = sanitizeOrderRequest(rawBody);

  // 2. validate
  const parsed = OrderSchema.safeParse(clean);

  if (!parsed.success) {
    throw new Error("Invalid order payload");
  }

  const data = parsed.data;

  // 3. final safety mapping (ONLY allowed fields)
  const orderDoc = await Order.create({
    orderId: await generateOrderId(),

    items: data.cart,
    amount: rawBody.amount || 0,

    address: data.address,

    status: "PENDING_PAYMENT",

    payment: {
      method: data.paymentMethod,
    },
  });

  return orderDoc;
}
