import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body?.items || body.items.length === 0) {
      return NextResponse.json({ success: false, msg: "No items" });
    }

    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json({
        success: false,
        msg: "No warehouse found",
      });
    }

    // 🔥 RESERVE INVENTORY FIRST
    await reserveStock(body.items, warehouse._id);

    const totalAmount = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      orderId: "ORD-" + Date.now(),
      customerName: body.customerName,
      phone: body.phone,
      address: body.address,
      pincode: body.pincode,
      items: body.items,
      totalAmount,
      status: "Order Placed",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (e) {
    console.error("ORDER CREATE ERROR:", e);

    return NextResponse.json({
      success: false,
      msg: e.message || "Order failed",
    });
  }
}

/* ================= FETCH ================= */
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}
