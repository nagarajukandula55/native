import { notifyOrderEvent } from "./notifyOrderEvent";

/* ================= DISPATCH EVENT WRAPPER ================= */
export async function handleOrderDispatched(order, prevStatus = null) {
  return await notifyOrderEvent(order, prevStatus);
}
