import { notifyOrderEvent } from "./notifyOrderEvent";

/* ================= PAYMENT EVENT WRAPPER ================= */
export async function handleOrderPaid(order, prevStatus = null) {
  return await notifyOrderEvent(order, prevStatus);
}
