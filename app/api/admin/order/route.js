// app/api/admin/order/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";

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

    const orders = await Order.find({ assignedStore: null, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: 500 });
  }
}

// PUT → assign store + warehouse
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { orderId, storeId, warehouseId } = await req.json();

    if (!orderId || !storeId || !warehouseId) {
      return NextResponse.json({ message: "Order, store, and warehouse are required" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    order.assignedStore = storeId;
    order.warehouseAssignments = [{ warehouseId, assignedAt: new Date() }];
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("ASSIGN ORDER ERROR:", err);
    const status = err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message || "Server error" }, { status });
  }
}

// POST → fetch inventory for a warehouse
export async function POST(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { warehouseId } = await req.json();
    if (!warehouseId) return NextResponse.json({ message: "Warehouse ID required" }, { status: 400 });

    const inventory = await Inventory.find({ warehouseId }).populate("skuId").lean();
    return NextResponse.json({ inventory });
  } catch (err) {
    console.error("FETCH INVENTORY ERROR:", err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: 500 });
  }
}
