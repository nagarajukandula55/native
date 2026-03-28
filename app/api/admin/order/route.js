import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";

// ✅ Helper to verify admin
async function verifyAdmin(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}

// GET unassigned orders
export async function GET(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const orders = await Order.find({ assignedStore: null, isDeleted: false })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}

// PUT → Assign store + warehouse in one request and return inventory
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { orderId, storeId, warehouseId } = await req.json();
    if (!orderId || !storeId || !warehouseId) 
      return NextResponse.json({ success: false, message: "Order, store and warehouse required" }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });

    // Assign store + warehouse
    order.assignedStore = storeId;
    order.warehouseAssignments = [{ warehouseId, assignedAt: new Date() }];
    await order.save();

    // Fetch inventory for assigned warehouse
    const inventory = await Inventory.find({ warehouseId }).populate("skuId");

    return NextResponse.json({ success: true, order, inventory });
  } catch (err) {
    console.error(err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}
