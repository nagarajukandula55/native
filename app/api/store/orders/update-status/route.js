// app/api/store/orders/update-status/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/Order";
import Store from "@/models/store";
import jwt from "jsonwebtoken";

export async function PUT(req) {
  await db();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const store = await Store.findById(decoded.id);

    if (!store)
      return NextResponse.json({ success: false, msg: "Store not found" }, { status: 404 });

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status)
      return NextResponse.json({ success: false, msg: "Order ID and status required" }, { status: 400 });

    // Fetch order and check warehouse assignment
    const order = await Order.findById(orderId);
    if (!order)
      return NextResponse.json({ success: false, msg: "Order not found" }, { status: 404 });

    const assignedWarehouses = order.warehouseAssignments.map((wa) => wa.warehouseId.toString());
    const storeWarehouses = store.assignedWarehouses.map((id) => id.toString());

    const isAllowed = assignedWarehouses.some((wid) => storeWarehouses.includes(wid));
    if (!isAllowed)
      return NextResponse.json({ success: false, msg: "Not authorized for this order" }, { status: 403 });

    // Update order status and history
    order.currentStatus = status;
    order.statusHistory.push({ status, date: new Date() });
    await order.save();

    return NextResponse.json({ success: true, status: order.currentStatus });
  } catch (err) {
    console.error("STORE UPDATE STATUS ERROR:", err);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
