import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

/* ================= ORDER ID ================= */
function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}

/* ================= TELEGRAM ================= */
async function sendTelegram(text) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) return;

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
      }),
    });
  } catch (e) {
    console.log("Telegram error:", e);
  }
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
      return NextResponse.json({ success: false, msg: "No warehouse found" }, { status: 400 });
    }

    /* ✅ RESERVE STOCK */
    await reserveStock(body.items, warehouse._id);

    const order = await Order.create({
      orderId: generateOrderId(),
      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",
      address: body.address,
      pincode: body.pincode,
      items: body.items,
      totalAmount: body.items.reduce((s, i) => s + i.price * i.quantity, 0),
      status: "Order Placed",
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    /* ✅ TELEGRAM */
    await sendTelegram(
`🛒 NEW ORDER
Order: ${order.orderId}
Customer: ${order.customerName}
Amount: ₹${order.totalAmount}`
    );

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      _id: order._id,
    });

  } catch (e) {
    console.error("ORDER ERROR:", e);

    return NextResponse.json({
      success: false,
      msg: e.message,
    }, { status: 500 });
  }
}
