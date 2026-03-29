import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { shipStock, deliverStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

/* ================= VERIFY ================= */
function verifyStore(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === "store" ? decoded : null;
  } catch {
    return null;
  }
}

/* ================= GET ================= */
export async function GET(req) {
  await connectDB();

  const user = verifyStore(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const orders = await Order.find({
    assignedStore: user.id,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, orders });
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const user = verifyStore(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const order = await Order.findById(body.id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    const newStatus = body.status;

    /* ================= SHIP ================= */
    if (order.status === "Packed" && newStatus === "Shipped") {
      if (!body.awbNumber || !body.courierName) {
        return NextResponse.json({
          success: false,
          message: "AWB & Courier required",
        });
      }

      await shipStock(order.items, order.warehouseAssignments[0].warehouseId);

      order.awbNumber = body.awbNumber;
      order.courierName = body.courierName;
    }

    /* ================= DELIVER ================= */
    if (order.status === "Out For Delivery" && newStatus === "Delivered") {
      await deliverStock(order.items, order.warehouseAssignments[0].warehouseId);
    }

    order.status = newStatus;

    order.statusHistory.push({
      status: newStatus,
      time: new Date(),
    });

    await order.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
