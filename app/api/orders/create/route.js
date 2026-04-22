import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const { cart, amount, user } = body;

    if (!cart || !amount) {
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: "Order creation failed" },
      { status: 500 }
    );
  }
}
