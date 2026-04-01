import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

/* ================= VERIFY ================= */
function verify(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/* ================= GET ================= */
export async function GET(req) {
  await connectDB();

  const user = verify(req);

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" });
  }

  const orders = await Order.find().sort({ createdAt: -1 });

  return NextResponse.json({ success: true, orders });
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  await connectDB();

  const body = await req.json();
  const { id, status, awbNumber, courierName } = body;

  const order = await Order.findById(id);

  if (!order) {
    return NextResponse.json({ success: false, message: "Not found" });
  }

  if (status) {
    order.status = status;
    order.statusHistory.push({ status, time: new Date() });
  }

  if (awbNumber) order.awbNumber = awbNumber;
  if (courierName) order.courierName = courierName;

  await order.save();

  return NextResponse.json({ success: true });
}
