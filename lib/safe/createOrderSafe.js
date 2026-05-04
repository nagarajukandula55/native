import Order from "@/models/Order";
import { generateOrderId } from "@/lib/orderId";

function strip(obj, allowed) {
  const out = {};
  for (const k of allowed) {
    if (obj?.[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

export async function createOrderSafe(raw) {
  const items = (raw.items || []).map((i) =>
    strip(i, [
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

  const order = {
    orderId: raw.orderId || (await generateOrderId()),
    items,
    amount: Number(raw.amount || 0),

    address: strip(raw.address || {}, [
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
      method: raw.paymentMethod || "UNKNOWN",
    },
  };

  return await Order.create(order);
}
