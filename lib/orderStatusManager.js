import Order from "@/models/Order";

import { sendTelegramMessage } from "@/lib/telegram";

export async function updateOrderStatus({
  orderId,
  status,
  meta = {},
}) {

  const order =
    await Order.findOne({ orderId });

  if (!order) {
    throw new Error("Order not found");
  }

  const prev = order.status;

  order.status = status;

  /* ================= TIMELINE ================= */

  if (status === "PAID") {
    order.statusTimeline.paidAt =
      new Date();
  }

  if (status === "PACKED") {
    order.statusTimeline.packedAt =
      new Date();
  }

  if (status === "DISPATCHED") {
    order.statusTimeline.dispatchedAt =
      new Date();
  }

  if (status === "DELIVERED") {
    order.statusTimeline.deliveredAt =
      new Date();
  }

  /* ================= AUDIT ================= */

  order.auditLogs.push({
    action: "STATUS_UPDATED",
    from: prev,
    to: status,
    by: meta.by || "SYSTEM",
    at: new Date(),
  });

  await order.save();

  /* ================= TELEGRAM ================= */

  await sendTelegramMessage(`
📦 ORDER STATUS UPDATED

Order: ${order.orderId}

From: ${prev}

To: ${status}
  `);

  return order;
}
