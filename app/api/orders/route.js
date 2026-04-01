import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Warehouse from "@/models/Warehouse";

/* ================= ORDER ID ================= */
function generateOrderId() {
  const now = new Date();
  return `NAT-${now.getTime()}`;
}

/* ================= CREATE ORDER ================= */
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { customerName, phone, address, pincode, items } = body;

    if (!customerName || !phone || !address || !pincode || !items?.length) {
      return NextResponse.json({ success: false, msg: "Missing fields" });
    }

    const warehouse = await Warehouse.findOne();

    if (!warehouse) {
      return NextResponse.json({ success: false, msg: "No warehouse" });
    }

    const totalAmount = items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      orderId: generateOrderId(),
      customerName,
      phone,
      address,
      pincode,
      items,
      totalAmount,
      status: "Order Placed",
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: "Pending",
      warehouseAssignments: [{ warehouseId: warehouse._id }],
      statusHistory: [{ status: "Order Placed", time: new Date() }],
    });

    console.log("ORDER CREATED:", order.orderId);

    return NextResponse.json({ success: true, order });

  } catch (e) {
    console.error("ORDER ERROR:", e);
    return NextResponse.json({ success: false, msg: e.message });
  }
}

/* ================= GET ================= */
export async function GET() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, orders });
}
