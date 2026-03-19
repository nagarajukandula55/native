export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/Order";

function generateAWB() {
  return "AWB" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function POST(req) {
  try {
    await db();

    const { orderId } = await req.json();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    // ✅ If already exists → return same
    if (order.awbNumber) {
      return NextResponse.json({
        success: true,
        awb: order.awbNumber,
        courier: order.courierName,
      });
    }

    // ✅ Generate new
    const awb = generateAWB();

    order.awbNumber = awb;
    order.courierName = "Delhivery";
    order.trackingUrl = `https://track.delhivery.com/${awb}`;

    await order.save();

    return NextResponse.json({
      success: true,
      awb,
      courier: order.courierName,
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}
