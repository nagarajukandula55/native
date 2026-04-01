import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { shipStock, deliverStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

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
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const orders = await Order.find({
    assignedStore: user.id,
  }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, orders });
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const user = verify(req);
    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id, status, awbNumber, courierName } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    const warehouseId = order.warehouseAssignments?.[0]?.warehouseId;

    /* ================= STATUS FLOW ================= */
    if (status && status !== order.status) {

      if (order.status === "Packed" && status === "Shipped") {

        if (!awbNumber || !courierName) {
          return NextResponse.json({
            success: false,
            message: "AWB & Courier required",
          });
        }

        await shipStock(order.items, warehouseId);
      }

      if (order.status === "Out For Delivery" && status === "Delivered") {
        await deliverStock(order.items, warehouseId);
      }

      order.status = status;
      order.statusHistory.push({ status, time: new Date() });
    }

    if (awbNumber) order.awbNumber = awbNumber;
    if (courierName) order.courierName = courierName;

    await order.save();

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: e.message });
  }
}
