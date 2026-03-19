export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    await db();

    const order = await Order.findById(params.id).populate("items.productId");

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}
