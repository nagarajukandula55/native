import Order from "@/models/Order";
import { buildOrderPayload } from "./buildOrderPayload";

export async function createOrderSafe(raw) {
  const payload = await buildOrderPayload(raw);

  // 🛡️ FINAL GUARD (double protection)
  const forbiddenKeys = ["name", "email", "phone"];

  for (const key of forbiddenKeys) {
    if (payload[key]) {
      throw new Error(`Blocked unsafe root field: ${key}`);
    }
  }

  return await Order.create(payload);
}
