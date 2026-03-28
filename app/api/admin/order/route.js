// app/api/admin/order/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import Order from "@/models/Order";

async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.role || decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

// GET → unassigned orders
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const orders = await Order.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: 500 });
  }
}

// PUT → assign store and/or warehouse
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { orderId, storeId, warehouseId } = await req.json();
    if (!orderId) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (storeId) order.assignedStore = storeId;

    if (warehouseId) {
      order.warehouseAssignments = [{ warehouseId, assignedAt: new Date() }];
    }

    await order.save();
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("ASSIGN ORDER ERROR:", err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}
