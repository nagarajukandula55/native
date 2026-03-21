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

    if (!token || !chatId) {
      console.log("Telegram ENV missing");
      return;
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (e) {
    console.log("Telegram Error:", e);
  }
}

/* ================= ORDER ID GENERATOR ================= */
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

    // Validation
    if (
      !body.customerName ||
      !body.phone ||
      !body.address ||
      !body.pincode ||
      !body.items ||
      body.items.length === 0
    ) {
      return NextResponse.json({ success: false, msg: "Missing fields" });
    }

    const totalAmount = body.items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    let orderId = generateOrderId();
    while (await Order.findOne({ orderId })) {
      orderId = generateOrderId(); // Ensure unique orderId
    }

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

    // Auto-assign first available warehouse
    const warehouse = await Warehouse.findOne();
    if (warehouse) {
      order.warehouseAssignments = [{ warehouseId: warehouse._id }];
      await order.save();
    }

    // Reduce inventory safely
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Telegram notification
    await sendTelegramMessage(
      `🛒 NEW ORDER RECEIVED\n\nOrder ID: ${order.orderId}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nAmount: ₹${order.totalAmount}\nPayment: ${order.paymentMethod}\nStatus: ${order.status}`
    );

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      _id: order._id,
    });
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

/* ================= UPDATE STATUS / PAYMENT ================= */
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, status, paymentStatus, awbNumber } = body;

    if (!id || (!status && !paymentStatus && !awbNumber)) {
      return NextResponse.json({
        success: false,
        msg: "Missing id or update fields",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, msg: "Order not found" });
    }

    // Update order status
    if (status) {
      order.status = status;
      order.statusHistory.push({ status, time: new Date() });
      await sendTelegramMessage(
        `📦 ORDER STATUS UPDATED\n\nOrder ID: ${order.orderId}\nCustomer: ${order.customerName}\nNew Status: ${order.status}`
      );
    }

    // Update payment status
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      await sendTelegramMessage(
        `💰 PAYMENT STATUS UPDATED\n\nOrder ID: ${order.orderId}\nCustomer: ${order.customerName}\nPayment Status: ${order.paymentStatus}`
      );
    }

    // Update AWB number if provided
    if (awbNumber) {
      order.awbNumber = awbNumber;
    }

    await order.save();

    return NextResponse.json({
      success: true,
      status: order.status,
      paymentStatus: order.paymentStatus,
      awbNumber: order.awbNumber || null,
    });
  } catch (e) {
    console.log("UPDATE ORDER ERROR:", e);
    return NextResponse.json({ success: false });
  }
}
