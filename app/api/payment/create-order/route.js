export const dynamic = "force-dynamic";

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    /* ✅ INIT INSIDE FUNCTION (IMPORTANT) */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const { amount } = await req.json();

    if (!amount) {
      return NextResponse.json({
        success: false,
        message: "Amount required",
      }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("RAZORPAY ERROR:", err);

    return NextResponse.json({
      success: false,
      message: err.message,
    }, { status: 500 });
  }
}
