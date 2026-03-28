import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Warehouse from "@/models/Warehouse";

export async function PUT(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { orderId, storeId } = await req.json();
    if (!orderId || !storeId) return NextResponse.json({ message: "Order & Store ID required" }, { status: 400 });

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    const storeUser = await User.findById(storeId);
    if (!storeUser || storeUser.role !== "store")
      return NextResponse.json({ message: "Invalid store user" }, { status: 400 });

    let warehouse = null;
    if (storeUser.warehouseId) {
      warehouse = await Warehouse.findById(storeUser.warehouseId);
    }

    order.assignedTo = storeUser._id;
    order.warehouseId = warehouse ? warehouse._id : null;
    order.warehouseName = warehouse ? warehouse.name : null;
    order.warehouseCode = warehouse ? warehouse.code : null;

    order.timeline.push({
      status: `Assigned to store ${storeUser.name}`,
      time: new Date(),
    });

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("ASSIGN ORDER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
