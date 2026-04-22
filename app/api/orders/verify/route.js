import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false });
    }

    // 1️⃣ find order
    const order = await Order.findOne({
      "payment.razorpay_order_id": razorpay_order_id,
    });

    if (!order) {
      return NextResponse.json({ success: false });
    }

    // 2️⃣ update order
    order.status = "PAID";
    order.payment.razorpay_payment_id = razorpay_payment_id;
    order.payment.razorpay_signature = razorpay_signature;
    order.payment.paidAt = new Date();

    await order.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}
