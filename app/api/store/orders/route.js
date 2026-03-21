import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

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

export async function PUT(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id, status, paymentStatus, awb } = await req.json();
    if (!id || (!status && !paymentStatus && awb === undefined)) {
      return NextResponse.json({ success: false, msg: "Missing fields" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, msg: "Order not found" }, { status: 404 });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (awb !== undefined) order.awb = awb;

    await order.save();
    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("STORE UPDATE ORDER ERROR:", e);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
