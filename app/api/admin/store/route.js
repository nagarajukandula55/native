import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Fetch unassigned orders
    const orders = await Order.find({ assignedStore: null }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("GET UNASSIGNED ORDERS ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { orderId, storeId } = await req.json();
    if (!orderId || !storeId)
      return NextResponse.json({ message: "Order ID and Store ID are required" }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const store = await User.findById(storeId);
    if (!store || store.role !== "store")
      return NextResponse.json({ message: "Invalid store" }, { status: 400 });

    // Assign store to order
    order.assignedStore = store._id;

    // Auto assign warehouse linked to store
    if (store.warehouseId) {
      order.warehouseAssignments = [
        { warehouseId: store.warehouseId, assignedAt: new Date() },
      ];
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("ASSIGN ORDER ERROR:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
