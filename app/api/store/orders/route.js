import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { shipStock, deliverStock } from "@/lib/inventory";

/* ================= VERIFY ================= */
function verify(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/* ================= GET ================= */
export async function GET(req) {
  await connectDB();

  const user = verify(req);

  if (!user || user.role !== "store") {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const orders = await Order.find({
    assignedStore: user.id,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .populate("warehouseAssignments.warehouseId", "name");

  return NextResponse.json({ success: true, orders });
}

/* ================= PUT ================= */
export async function PUT(req) {
  await connectDB();

  const user = verify(req);

  if (!user || user.role !== "store") {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { id, status, awbNumber, courierName, trackingUrl } = body;

  const order = await Order.findById(id);

  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found" });
  }

  const warehouseId = order.warehouseAssignments?.[0]?.warehouseId;

  /* ================= FLOW ================= */
  const flow = {
    "Order Placed": "Packed",
    Packed: "Shipped",
    Shipped: "Out For Delivery",
    "Out For Delivery": "Delivered",
  };

  if (status && status !== order.status) {

    if (flow[order.status] !== status) {
      return NextResponse.json({
        success: false,
        message: "Invalid status flow",
      });
    }

    /* 🚚 SHIPPING */
    if (order.status === "Packed" && status === "Shipped") {
      if (!awbNumber || !courierName) {
        return NextResponse.json({
          success: false,
          message: "AWB & Courier required",
        });
      }

      await shipStock(order.items, warehouseId);
    }

    /* ✅ DELIVERY */
    if (order.status === "Out For Delivery" && status === "Delivered") {
      await deliverStock(order.items, warehouseId);
    }

    order.status = status;
    order.statusHistory.push({ status, time: new Date() });
  }

  if (awbNumber) order.awbNumber = awbNumber;
  if (courierName) order.courierName = courierName;
  if (trackingUrl) order.trackingUrl = trackingUrl;

  await order.save();

  return NextResponse.json({ success: true });
}
