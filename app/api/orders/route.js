import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Inventory from "@/models/Inventory";
import Warehouse from "@/models/Warehouse";

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

    if (!body.customerName || !body.phone || !body.address || !body.pincode || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, msg: "Missing fields" });
    }

    const totalAmount = body.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    let orderId = generateOrderId();
    if (await Order.findOne({ orderId })) orderId = generateOrderId();

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
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    // Assign warehouse automatically
    const warehouse = await Warehouse.findOne();
    if (warehouse) {
      order.warehouseAssignments = [{ warehouseId: warehouse._id }];
      await order.save();
    }

    // Reduce inventory
    for (const item of order.items) {
      await Inventory.findOneAndUpdate({ productId: item.productId }, { $inc: { quantity: -item.quantity } });
    }

    // Telegram notification
    await sendTelegramMessage(
`🛒 NEW ORDER RECEIVED
Order ID: ${order.orderId}
Customer: ${order.customerName}
Phone: ${order.phone}
Amount: ₹${order.totalAmount}
Payment: ${order.paymentMethod}
Status: ${order.status}`
    );

    return NextResponse.json({ success: true, orderId: order.orderId, _id: order._id });
  } catch (e) {
    console.log("CREATE ORDER ERROR:", e);
    return NextResponse.json({ success: false, msg: "Server error" });
  }
}

/* ================= FETCH ORDERS ================= */
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (e) {
    console.log("FETCH ORDERS ERROR:", e);
    return NextResponse.json({ success: false });
  }
}

/* ================= UPDATE ORDER / PAYMENT ================= */
export async function PUT(req) {
  try {
    await connectDB();
    const { id, status, paymentStatus, awbNumber, courierName, trackingUrl } = await req.json();

    if (!id || (!status && !paymentStatus && !awbNumber && !courierName && !trackingUrl)) {
      return NextResponse.json({ success: false, msg: "Missing update fields" });
    }

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, msg: "Order not found" });

    if (status) {
      order.status = status;
      order.statusHistory.push({ status, time: new Date() });
      await sendTelegramMessage(
`📦 ORDER STATUS UPDATED
Order ID: ${order.orderId}
Customer: ${order.customerName}
New Status: ${order.status}`
      );
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      await sendTelegramMessage(
`💰 PAYMENT STATUS UPDATED
Order ID: ${order.orderId}
Customer: ${order.customerName}
Payment Status: ${order.paymentStatus}`
      );
    }

    if (awbNumber) order.awbNumber = awbNumber;
    if (courierName) order.courierName = courierName;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    await order.save();

    return NextResponse.json({
      success: true,
      status: order.status,
      paymentStatus: order.paymentStatus,
      awbNumber: order.awbNumber,
      courierName: order.courierName,
      trackingUrl: order.trackingUrl,
    });
  } catch (e) {
    console.log("UPDATE ORDER ERROR:", e);
    return NextResponse.json({ success: false });
  }
}
