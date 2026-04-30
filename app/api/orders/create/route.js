import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const { cart, amount, address } = body;

    /* ================= VALIDATION ================= */
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    /* ================= CREATE ORDER (DB) ================= */
    const orderDoc = await Order.create({
      orderId: "ORD_" + Date.now(),
      items: cart,
      amount,
      address,
      status: "PENDING_PAYMENT",

      payment: {
        razorpay_order_id: "",
        payment_status: "pending",
      },
    });

    /* ================= RAZORPAY INIT ================= */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    /* ================= CREATE RAZORPAY ORDER ================= */
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderDoc.orderId,
    });

    /* ================= SAFE UPDATE ================= */
    orderDoc.payment = {
      razorpay_order_id: razorpayOrder.id,
      payment_status: "created",
    };

    await orderDoc.save();

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: razorpayOrder,
      dbOrderId: orderDoc._id,
    });

  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Order creation failed",
      },
      { status: 500 }
    );
  }
}
