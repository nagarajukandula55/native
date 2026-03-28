import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import Order from "@/models/Order";
import User from "@/models/User";
import Inventory from "@/models/Inventory";

export async function GET(req) {
  // GET unassigned orders
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const orders = await Order.find({ assignedStore: null, isDeleted: false }).sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  // Assign order to store + warehouse
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { orderId, storeId, warehouseId } = await req.json();
    if (!orderId || !storeId || !warehouseId) 
      return NextResponse.json({ message: "Order, store and warehouse required" }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    order.assignedStore = storeId;
    order.warehouseAssignments = [{ warehouseId, assignedAt: new Date() }];
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Fetch inventory of a warehouse
export async function POST(req) {
  try {
    await connectDB();
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { warehouseId } = await req.json();
    if (!warehouseId) return NextResponse.json({ message: "Warehouse ID required" }, { status: 400 });

    const inventory = await Inventory.find({ warehouseId }).populate("skuId");
    return NextResponse.json({ inventory });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
