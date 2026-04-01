import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

/* ================= TELEGRAM ================= */
async function sendTelegramMessage(text) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) return;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });
  } catch (e) {
    console.log("Telegram Error:", e.message);
  }
}

/* ================= ORDER ID ================= */
function generateOrderId() {
  const now = new Date();

  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `NAT-${yy}${mm}${dd}-${random}`;
}

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    /* ================= VALIDATION ================= */
    if (
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !body.pincode ||
      !body.items ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { success: false, msg: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ================= WAREHOUSE ================= */
    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json(
        { success: false, msg: "No warehouse configured" },
        { status: 400 }
      );
    }

    /* ================= UNIQUE ORDER ID ================= */
    let orderId;
    let exists = true;

    while (exists) {
      orderId = generateOrderId();
      const found = await Order.findOne({ orderId });
      if (!found) exists = false;
    }

    /* ================= TOTAL ================= */
    const totalAmount = body.items.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    /* ================= 🔥 RESERVE STOCK ================= */
    await reserveStock(body.items, warehouse._id);

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      orderId,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",
      address: body.address,
      pincode: body.pincode,
      items: body.items,
      totalAmount,
      status: "Order Placed",
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [
        {
          status: "Order Placed",
          time: new Date(),
        },
      ],
    });

    /* ================= TELEGRAM ================= */
    await sendTelegramMessage(
`🛒 NEW ORDER
Order ID: ${order.orderId}
Customer: ${order.customerName}
Phone: ${order.phone}
Amount: ₹${order.totalAmount}
Payment: ${order.paymentMethod}`
    );

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      _id: order._id,
    });

  } catch (e) {
    console.error("ORDER CREATE ERROR:", e);

    return NextResponse.json(
      {
        success: false,
        msg: e.message || "Server error",
      },
      { status: 500 }
    );
  }
}

/* ================= FETCH ORDERS ================= */
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (e) {
    console.error("FETCH ORDERS ERROR:", e);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
