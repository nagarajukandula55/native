import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const { orderId, status } = await req.json();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: "Not found" });
    }

    // update warehouse status
    order.warehouse.status = status;

    if (status === "PACKED") {
      order.warehouse.packedAt = new Date();
    }

    if (status === "DISPATCHED") {
      order.warehouse.dispatchedAt = new Date();
    }

    await order.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}
