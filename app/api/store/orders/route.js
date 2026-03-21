import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

/* ================= GET ORDERS FOR STORE ================= */
export async function GET(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const orders = await Order.find({ "warehouseAssignments.warehouseId": decoded.warehouseId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (e) {
    console.error("STORE GET ORDERS ERROR:", e);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}

/* ================= UPDATE ORDER FOR STORE ================= */
export async function PUT(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id, status, paymentStatus, awb, courierName, trackingUrl } = await req.json();

    if (!id || (!status && !paymentStatus && awb === undefined && courierName === undefined && trackingUrl === undefined)) {
      return NextResponse.json({ success: false, msg: "Missing fields" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, msg: "Order not found" }, { status: 404 });

    // Ensure the store can only update its own warehouse orders
    const assigned = order.warehouseAssignments.some(w => w.warehouseId.toString() === decoded.warehouseId);
    if (!assigned) return NextResponse.json({ success: false, msg: "Unauthorized for this order" }, { status: 403 });

    if (status) {
      order.status = status;
      order.statusHistory.push({ status, time: new Date() });
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (awb !== undefined) order.awb = awb;
    if (courierName !== undefined) order.courierName = courierName;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("STORE UPDATE ORDER ERROR:", e);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
