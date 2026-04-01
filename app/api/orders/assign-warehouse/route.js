export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await connectDB();

    const { orderId } = await req.json();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    if (order.warehouseAssignments?.length) {
      return NextResponse.json({ success: true, message: "Already assigned" });
    }

    return NextResponse.json({
      success: true,
      message: "Already assigned via order creation",
    });

  } catch (e) {
    return NextResponse.json({ success: false, message: e.message });
  }
}
