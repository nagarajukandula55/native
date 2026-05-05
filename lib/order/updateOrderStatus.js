import Order from "@/models/Order";

/* ================= VALID TRANSITIONS ================= */
const FLOW = {
  PENDING_PAYMENT: ["PAID", "FAILED", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED"],
  PACKED: ["DISPATCHED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: [],
};

export async function updateOrderStatus({
  orderId,
  newStatus,
  by = "SYSTEM",
  meta = {},
}) {
  const order = await Order.findOne({ orderId });

  if (!order) throw new Error("Order not found");

  const current = order.status;

  /* ================= VALIDATION ================= */
  if (!FLOW[current]?.includes(newStatus)) {
    throw new Error(`Invalid transition: ${current} → ${newStatus}`);
  }

  /* ================= UPDATE STATUS ================= */
  order.status = newStatus;

  /* ================= TIMELINE ================= */
  const now = new Date();

  switch (newStatus) {
    case "PAID":
      order.statusTimeline.paidAt = now;
      break;

    case "PROCESSING":
      order.statusTimeline.processedAt = now;
      break;

    case "PACKED":
      order.statusTimeline.packedAt = now;
      order.warehouse.status = "PACKED";
      break;

    case "DISPATCHED":
      order.statusTimeline.dispatchedAt = now;
      order.warehouse.status = "DISPATCHED";
      break;

    case "DELIVERED":
      order.statusTimeline.deliveredAt = now;
      order.warehouse.status = "DELIVERED";
      break;

    case "CANCELLED":
      order.statusTimeline.cancelledAt = now;
      break;
  }

  /* ================= AUDIT LOG ================= */
  order.auditLogs.push({
    action: "STATUS_CHANGE",
    from: current,
    to: newStatus,
    by,
    meta,
  });

  await order.save();

  return order;
}
