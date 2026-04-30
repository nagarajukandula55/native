import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("🔥 ORDER PAYLOAD:", body);

    const { cart, amount, address } = body;

    if (!cart?.length) {
      return NextResponse.json({ success: false, message: "Cart empty" }, { status: 400 });
    }

    if (!amount) {
      return NextResponse.json({ success: false, message: "Amount missing" }, { status: 400 });
    }

    console.log("🔑 ENV CHECK:", {
      key: process.env.RAZORPAY_KEY_ID,
      secret: process.env.RAZORPAY_KEY_SECRET ? "OK" : "MISSING",
    });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

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

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderDoc.orderId,
    });

    orderDoc.payment = {
      razorpay_order_id: razorpayOrder.id,
      payment_status: "created",
    };

    await orderDoc.save();

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      dbOrderId: orderDoc._id,
    });

  } catch (err) {
    console.error("🔥 FULL ORDER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
