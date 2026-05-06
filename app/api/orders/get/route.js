import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ success: false });
    }

    const order = await Order.findOne({ orderId }).lean();

    if (!order) {
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
