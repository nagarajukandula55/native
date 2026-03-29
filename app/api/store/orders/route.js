import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { shipStock, deliverStock } from "@/lib/inventory";

/* VERIFY STORE */
async function verifyStore(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

/* UPDATE ORDER */
export async function PUT(req) {
  await connectDB();

  const { user, error, status } = await verifyStore(req);
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status });
  }

  const body = await req.json();
  const order = await Order.findById(body.id);

  if (!order) {
    return NextResponse.json({ success: false, message: "Not found" });
  }

  const warehouseId = order.warehouseAssignments?.[0]?.warehouseId;

  /* 🚚 SHIPPING */
  if (order.status === "Packed" && body.status === "Shipped") {
    if (!body.awbNumber || !body.courierName) {
      return NextResponse.json({
        success: false,
        message: "AWB + Courier required",
      });
    }

    await shipStock(order.items, warehouseId);
  }

  /* ✅ DELIVERY */
  if (order.status === "Out For Delivery" && body.status === "Delivered") {
    await deliverStock(order.items, warehouseId);
  }

  order.status = body.status;
  if (body.awbNumber) order.awbNumber = body.awbNumber;
  if (body.courierName) order.courierName = body.courierName;

  await order.save();

  return NextResponse.json({ success: true });
}
