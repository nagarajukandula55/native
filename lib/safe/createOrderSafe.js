import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";
import { sanitizeOrderRequest } from "./sanitizeRequest";
import { OrderSchema } from "@/lib/validators/orderValidator";

const ORDER_WHITELIST = [
  "orderId",
  "items",
  "amount",
  "address",
  "status",
  "payment",
];

function stripUnknown(obj, allowed) {
  const clean = {};
  for (const key of allowed) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }
  return clean;
}

export async function createOrderSafe(rawBody) {
  // 1. sanitize input
  const clean = sanitizeOrderRequest(rawBody);

  // 2. validate
  const parsed = OrderSchema.safeParse(clean);

  if (!parsed.success) {
    throw new Error("Invalid order payload");
  }

  const data = parsed.data;

  // 3. STRICT ITEM SANITIZATION
  const safeItems = (data.cart || []).map((item) =>
    stripUnknown(item, [
      "productId",
      "productKey",
      "qty",
      "price",
      "gstPercent",
      "baseAmount",
      "total",
      "image",
    ])
  );

  // 4. FINAL ORDER OBJECT (ONLY WHITELISTED FIELDS)
  const orderPayload = stripUnknown(
    {
      orderId: await generateOrderId(),

      items: safeItems,
      amount: Number(data.amount || 0),

      address: stripUnknown(data.address || {}, [
        "name",
        "phone",
        "email",
        "address",
        "city",
        "state",
        "pincode",
        "gstNumber",
      ]),

      status: "PENDING_PAYMENT",

      payment: {
        method: data.paymentMethod,
      },
    },
    ORDER_WHITELIST
  );

  // 5. CREATE ORDER
  const orderDoc = await Order.create(orderPayload);

  return orderDoc;
}
