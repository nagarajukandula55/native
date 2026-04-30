import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const { cart, amount, address, coupon, discount } = body;

    /* ================= VALIDATION ================= */
    if (!cart || cart.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: "Invalid amount",
      });
    }

    /* ================= CREATE DB ORDER ================= */
    const orderDoc = await Order.create({
      orderId: "ORD_" + Date.now(),
      items: cart,
      amount,
      address,
      coupon,
      discount,
      status: "PENDING_PAYMENT",
    });

    /* ================= RAZORPAY ================= */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderDoc.orderId,
    });

    /* ================= SAVE PAYMENT REF ================= */
    orderDoc.payment = {
      razorpay_order_id: razorpayOrder.id,
    };

    await orderDoc.save();

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      dbOrderId: orderDoc._id,
    });

  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Server error",
      },
      { status: 500 }
    );
  }
}
