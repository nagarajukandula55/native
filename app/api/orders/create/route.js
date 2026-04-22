import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { cart, amount, address } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ success: false, message: "Cart empty" });
    }

    // 1️⃣ Create DB order (PENDING)
    const orderDoc = await Order.create({
      orderId: "ORD_" + Date.now(),
      items: cart,
      amount,
      address,
      status: "PENDING_PAYMENT",
    });

    // 2️⃣ Razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: orderDoc.orderId,
    });

    // 3️⃣ attach razorpay id
    orderDoc.payment.razorpay_order_id = razorpayOrder.id;
    await orderDoc.save();

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      dbOrderId: orderDoc._id,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false });
  }
}
