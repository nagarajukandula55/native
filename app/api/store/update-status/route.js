import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { verifyStore } from "@/lib/store/auth";

export async function POST(req) {
  await connectDB();

  const store = verifyStore(req);
  if (!store) return Response.json({ success: false });

  const { orderId, status } = await req.json();

  const order = await Order.findById(orderId);

  if (!order) {
    return Response.json({ success: false });
  }

  // 🔥 Status Flow Control
  const validFlow = {
    "Order Placed": "Packed",
    Packed: "Shipped",
    Shipped: "Out For Delivery",
    "Out For Delivery": "Delivered",
  };

  if (validFlow[order.currentStatus] !== status) {
    return Response.json({
      success: false,
      message: "Invalid status flow",
    });
  }

  // ✅ Update flags
  if (status === "Packed") order.isPacked = true;
  if (status === "Shipped") order.isShipped = true;

  // ✅ Update status
  order.status = status;
  order.currentStatus = status;
  order.lastUpdatedAt = new Date();

  // ✅ Timeline push
  order.statusHistory.push({
    status,
    time: new Date(),
    updatedBy: store.id,
    updatedByModel: "Store",
  });

  await order.save();

  return Response.json({ success: true });
}
