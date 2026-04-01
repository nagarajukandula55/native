import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";
import { reserveStock } from "@/lib/inventory";

/* ================= ORDER ID ================= */
function generateOrderId() {
  return "ORD-" + Date.now();
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

    /* ✅ RESERVE STOCK FIRST */
    await reserveStock(body.items, warehouse._id);

    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email || "",
      address: body.address,
      pincode: body.pincode,
      items: body.items,
      totalAmount: body.items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      ),
      status: "Order Placed",
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      _id: order._id,
    });

  } catch (e) {
    console.error("ORDER CREATE ERROR:", e);

    return NextResponse.json(
      { success: false, msg: e.message },
      { status: 500 }
    );
  }
}

/* ================= GET ================= */
export async function GET() {
  await connectDB();

  const orders = await Order.find().sort({ createdAt: -1 });

  return NextResponse.json({ success: true, orders });
}
