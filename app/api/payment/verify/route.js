import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    /* ================= BASIC VALIDATION ================= */
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid payment data" },
        { status: 400 }
      );
    }

    /* ================= SIGNATURE VERIFY ================= */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    /* ================= FETCH ORDER ================= */
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ================= DUPLICATE PROTECTION ================= */
    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Already paid",
      });
    }

    /* ================= MATCH ORDER ID ================= */
    if (
      order.payment?.razorpay_order_id &&
      order.payment.razorpay_order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        { success: false, message: "Order mismatch" },
        { status: 400 }
      );
    }

    /* ================= UPDATE ORDER ================= */
    order.status = "PAID";

    order.payment = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paidAt: new Date(),
    };

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified",
    });

  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
