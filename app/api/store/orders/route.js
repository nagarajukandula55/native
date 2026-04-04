export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { shipStock, deliverStock } from "@/lib/inventory";

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

/* ================= FLOW ================= */
const validFlow = {
  "Order Placed": "Packed",
  Packed: "Shipped",
  Shipped: "Out For Delivery",
  "Out For Delivery": "Delivered",
};

/* ================= GET ================= */
export async function GET(req) {
  await connectDB();

  const user = verify(req);
  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const orders = await Order.find({
    assignedStore: user.id,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, orders });
}

/* ================= UPDATE ================= */
export async function PUT(req) {
  try {
    await connectDB();

    const user = verify(req);
    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { id, status, awbNumber, courierName, trackingUrl } =
      await req.json();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ success: false, message: "Not found" });
    }

    if (status && status !== order.status) {
      if (validFlow[order.status] !== status) {
        return NextResponse.json({
          success: false,
          message: "Invalid flow",
        });
      }

      /* 🔥 SHIPPED */
      if (order.status === "Packed" && status === "Shipped") {
        if (!awbNumber || !courierName) {
          return NextResponse.json({
            success: false,
            message: "AWB & courier required",
          });
        }

        await shipStock(order.allocations);
      }

      /* 🔥 DELIVERED */
      if (
        order.status === "Out For Delivery" &&
        status === "Delivered"
      ) {
        await deliverStock(order.allocations);
      }

      order.status = status;

      order.statusHistory.push({
        status,
        time: new Date(),
        updatedBy: user.id,
      });
    }

    if (awbNumber !== undefined) order.awbNumber = awbNumber;
    if (courierName !== undefined) order.courierName = courierName;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

    await order.save();

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (e) {
    return NextResponse.json({
      success: false,
      message: e.message,
    });
  }
}
