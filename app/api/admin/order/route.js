import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import Order from "@/models/Order";
import User from "@/models/User";
import Warehouse from "@/models/Warehouse";
import Inventory from "@/models/Inventory";

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
    const orders = await Order.find({ assignedStore: null, isDeleted: false }).sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: err.message === "Unauthorized" ? 401 : err.message === "Forbidden" ? 403 : 500 });
  }
}

// PUT assign order
export async function PUT(req) {
  try {
    await connectDB();
    await verifyAdmin(req);

    const { orderId, storeId, warehouseId } = await req.json();
    if (!orderId || !storeId || !warehouseId) 
      return NextResponse.json({ message: "Order, store, warehouse required" }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const store = await User.findById(storeId);
    if (!store || store.role !== "store") return NextResponse.json({ message: "Invalid store", status: 400 });

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) return NextResponse.json({ message: "Warehouse not found", status: 404 });

    order.assignedStore = storeId;
    order.warehouseAssignments = [{ warehouseId, assignedAt: new Date() }];
    await order.save();

    const inventory = await Inventory.find({ warehouseId }).populate("skuId");

    return NextResponse.json({ success: true, order, inventory });
  } catch (err) {
    console.error("ASSIGN ORDER ERROR:", err);
    return NextResponse.json({ message: err.message || "Server error" }, { status: 500 });
  }
}
