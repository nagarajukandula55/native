import Order from "@/models/Order";

/* ================= WHITELIST ================= */
const allowedOrderFields = [
  "orderId",
  "items",
  "amount",
  "address",
  "payment",
  "status",
  "billing",
  "userId",
];

function sanitize(obj) {
  const clean = {};

  for (const key of allowedOrderFields) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }

  return clean;
}

/* ================= SAFE CREATION ================= */
export async function createOrderSafe(payload) {
  const safeData = sanitize(payload);

  // extra safety
  if (!safeData.orderId) throw new Error("orderId missing");
  if (!safeData.items?.length) throw new Error("items missing");
  if (!safeData.amount) throw new Error("amount missing");

  return await Order.create(safeData);
}
