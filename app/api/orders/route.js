import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

/* ================= ORDER ID ================= */
function generateOrderId() {
  const now = new Date();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${now.getTime()}-${rand}`;
}

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.customerName || !body.phone || !body.address || !body.items?.length) {
      return NextResponse.json({ success: false, msg: "Missing fields" }, { status: 400 });
    }

    const warehouse = await Warehouse.findOne();
    if (!warehouse) {
      return NextResponse.json({ success: false, msg: "No warehouse" }, { status: 400 });
    }

    /* ✅ RESERVE STOCK FIRST */
    await reserveStock(body.items, warehouse._id);

    const order = await Order.create({
      orderId: generateOrderId(),
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      pincode: body.pincode,
      items: body.items,
      totalAmount: body.items.reduce((s, i) => s + i.price * i.quantity, 0),
      paymentMethod: body.paymentMethod,
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    return NextResponse.json({ success: true, orderId: order.orderId });

  } catch (e) {
    console.error("ORDER CREATE ERROR:", e);

    return NextResponse.json({
      success: false,
      msg: e.message || "Server error",
    }, { status: 500 });
  }
}
