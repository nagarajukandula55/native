import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
    } = await req.json();

    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json({ success: false });
    }

    order.payment.status = "SUCCESS";
    order.payment.razorpay_payment_id = razorpay_payment_id;
    order.payment.razorpay_order_id = razorpay_order_id;
    order.payment.paidAt = new Date();

    order.status = "PAID";
    order.statusTimeline.paidAt = new Date();

    order.auditLogs.push({
      action: "PAYMENT_SUCCESS",
      by: "SYSTEM",
    });

    await order.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
