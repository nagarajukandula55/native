export const dynamic = "force-dynamic";

import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await db();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await req.json();

    /* ================= VALIDATION ================= */
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
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    /* ================= FIND ORDER ================= */
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ================= PREVENT DUPLICATE UPDATE ================= */
    if (order.paymentStatus === "Paid") {
      return NextResponse.json({
        success: true,
        message: "Already paid",
      });
    }

    /* ================= UPDATE ORDER ================= */
    order.paymentStatus = "Paid";
    order.paymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    order.paymentMethod = "Razorpay";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
