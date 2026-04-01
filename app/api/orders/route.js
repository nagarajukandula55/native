export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

/* ================= ORDER ID ================= */
function generateOrderId() {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NAT-${yy}${mm}${dd}-${rand}`;
}

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.customerName || !body.phone || !body.address || !body.items?.length) {
      return NextResponse.json(
        { success: false, msg: "Missing fields" },
        { status: 400 }
      );
    }

    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json(
        { success: false, msg: "No warehouse found" },
        { status: 400 }
      );
    }

    /* 🔥 RESERVE STOCK */
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
      status: "Order Placed",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      _id: order._id,
    });

  } catch (e) {
    console.error("ORDER ERROR:", e);

    return NextResponse.json(
      { success: false, msg: e.message },
      { status: 500 }
    );
  }
}
