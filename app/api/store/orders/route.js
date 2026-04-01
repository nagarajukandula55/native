import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { shipStock, deliverStock } from "@/lib/inventory";

/* ================= VERIFY STORE ================= */
async function verifyStore(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) return { error: "Unauthorized", status: 401 };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "store") {
      return { error: "Forbidden", status: 403 };
    }

    return { user: decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

/* ================= GET ================= */
export async function GET(req) {
  await connectDB();

  const { user, error, status } = await verifyStore(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const orders = await Order.find({
    assignedStore: user.id,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, orders });
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  await connectDB();

  const { user, error, status } = await verifyStore(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const body = await req.json();
  const id = body.id;

  const order = await Order.findById(id);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Order not found" },
      { status: 404 }
    );
  }

  const newStatus = body.status;
  const warehouseId = order.warehouseAssignments?.[0]?.warehouseId;

  /* ================= SHIPPING ================= */
  if (order.status === "Packed" && newStatus === "Shipped") {
    if (!body.awbNumber || !body.courierName) {
      return NextResponse.json(
        { success: false, message: "AWB & Courier required" },
        { status: 400 }
      );
    }

    await shipStock(order.items, warehouseId);
  }

  /* ================= DELIVERY ================= */
  if (order.status === "Out For Delivery" && newStatus === "Delivered") {
    await deliverStock(order.items, warehouseId);
  }

  /* ================= UPDATE ================= */
  order.status = newStatus;
  order.awbNumber = body.awbNumber || order.awbNumber;
  order.courierName = body.courierName || order.courierName;
  order.trackingUrl = body.trackingUrl || order.trackingUrl;

  order.statusHistory.push({
    status: newStatus,
    time: new Date(),
    updatedBy: user.id,
  });

  await order.save();

  return NextResponse.json({ success: true });
}
