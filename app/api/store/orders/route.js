// app/api/store/orders/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/order";
import Store from "@/models/store";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await db();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ success: false, msg: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const store = await Store.findById(decoded.id);

    if (!store) return NextResponse.json({ success: false, msg: "Store not found" }, { status: 404 });

    // Fetch orders that match store's assigned warehouses
    const orders = await Order.find({ "warehouseAssignments.warehouseId": { $in: store.assignedWarehouses } }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, msg: "Server error" }, { status: 500 });
  }
}
