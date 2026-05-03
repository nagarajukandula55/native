import Order from "@/models/Order";
import { safeOrderPayload } from "./safeOrderPayload";

export async function createOrderSafe(rawInput) {
  const safe = safeOrderPayload(rawInput);

  // FINAL PROTECTION (strip undefined/null junk)
  Object.keys(safe).forEach((key) => {
    if (safe[key] === undefined) delete safe[key];
  });

  return await Order.create(safe);
}
