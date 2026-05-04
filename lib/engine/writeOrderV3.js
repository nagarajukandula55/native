import Order from "@/models/Order";

const ALLOWED_FIELDS = [
  "orderId",
  "items",
  "amount",
  "address",
  "status",
  "payment",
];

export async function writeOrderV3(data) {
  const clean = {};

  for (const key of ALLOWED_FIELDS) {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  }

  return await Order.create(clean);
}
