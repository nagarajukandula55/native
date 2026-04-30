import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Razorpay from "razorpay";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      cart = [],
      amount = 0,
      address = {},
      coupon = "",
      discount = 0,
    } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
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

    /* ================= SANITIZE CART ================= */
    const safeItems = cart.map((item) => ({
      productId: item.productId || null,
      productKey: item.productKey || "",
      name: item.name || "Product",
      price: Number(item.price || 0),
      qty: Number(item.qty || 1),
      image: item.image || "",
      variant: item.variant || "",
    }));

    /* ================= CREATE DB ORDER ================= */
    const orderDoc = await Order.create({
      orderId: "ORD_" + Date.now(),
      items: safeItems,
      amount: Number(amount),
      address,
      coupon,
      discount,
      status: "PENDING_PAYMENT",
    });

    /* ================= RAZORPAY INIT ================= */
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    /* ================= CREATE RAZORPAY ORDER ================= */
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
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
        message: err.message || "Order creation failed",
      },
      { status: 500 }
    );
  }
}
