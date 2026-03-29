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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) {
    console.log("Telegram Error:", e);
  }
}

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

    /* ================= VALIDATION ================= */
    if (
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !body.pincode ||
      !body.items ||
      body.items.length === 0
    ) {
      return NextResponse.json({
        success: false,
        msg: "Missing required fields",
      });
    }

    /* ================= CALCULATE TOTAL ================= */
    const totalAmount = body.items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    /* ================= GENERATE ORDER ID ================= */
    let orderId = generateOrderId();
    if (await Order.findOne({ orderId })) {
      orderId = generateOrderId();
    }

    /* ================= GET WAREHOUSE ================= */
    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json({
        success: false,
        msg: "No warehouse configured",
      });
    }

    /* ================= 🔥 RESERVE STOCK (SAFE) ================= */
    try {
      await reserveStock(body.items, warehouse._id);
    } catch (stockError) {
      console.log("❌ STOCK ERROR:", stockError.message);

      return NextResponse.json({
        success: false,
        msg: stockError.message,
      });
    }

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      orderId,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",
      address: body.address,
      pincode: body.pincode,
      items: body.items.map(item => ({
        ...item,
        productId: item.productId || item.product, // ✅ FIX
      })),
      totalAmount,
      status: "Order Placed",
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    /* ================= TELEGRAM ================= */
    await sendTelegramMessage(
`🛒 NEW ORDER RECEIVED
Order ID: ${order.orderId}
Customer: ${order.customerName}
Phone: ${order.phone}
Amount: ₹${order.totalAmount}
Payment: ${order.paymentMethod}
Status: ${order.status}`
    );

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      _id: order._id,
    });

  } catch (e) {
    console.log("❌ CREATE ORDER ERROR FULL:", e);

    return NextResponse.json({
      success: false,
      msg: e.message || "Server error",
    });
  }
}

/* ================= FETCH ORDERS ================= */
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (e) {
    console.log("FETCH ORDERS ERROR:", e);

    return NextResponse.json({
      success: false,
      msg: e.message,
    });
  }
}

/* ================= UPDATE ORDER ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const {
      id,
      status,
      paymentStatus,
      awbNumber,
      courierName,
      trackingUrl,
    } = await req.json();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({
        success: false,
        msg: "Order not found",
      });
    }

    if (status) {
      order.status = status;

      order.statusHistory.push({
        status,
        time: new Date(),
      });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (awbNumber !== undefined) order.awbNumber = awbNumber;
    if (courierName !== undefined) order.courierName = courierName;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

    await order.save();

    return NextResponse.json({ success: true });

  } catch (e) {
    console.log("UPDATE ORDER ERROR:", e);

    return NextResponse.json({
      success: false,
      msg: e.message,
    });
  }
}
