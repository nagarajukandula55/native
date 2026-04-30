import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Razorpay from "razorpay";
import { generateOrderId } from "@/lib/orderId";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      cart = [],
      address = {},
      coupon = null,
      discount = 0,
      paymentMethod = "RAZORPAY",
    } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    /* ================= SAFE CART ================= */
    let subtotal = 0;

    const safeItems = cart.map((item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 1);

      subtotal += price * qty;

      return {
        productId: item.productId || item.id || null,
        productKey: item.productKey || "",
        name: item.name || "Product",
        price,
        qty,
        image: item.image || "",
        variant: item.variant || "",
      };
    });

    /* ================= FINAL AMOUNT ================= */
    const appliedDiscount = Number(discount || 0);
    const amount = Math.max(subtotal - appliedDiscount, 0);

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount" },
        { status: 400 }
      );
    }

    /* ================= SECURE ORDER ID ================= */
    const orderId = await generateOrderId();

    /* ================= SAVE ORDER FIRST ================= */
    const orderDoc = await Order.create({
      orderId,
      items: safeItems,
      amount,
      address,
      coupon,
      discount: appliedDiscount,
      paymentMethod,
      status: "PENDING_PAYMENT",
    });

    /* ================= RAZORPAY (OPTIONAL SAFE) ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY") {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: orderId,
      });

      orderDoc.payment = {
        razorpay_order_id: razorpayOrder.id,
      };

      await orderDoc.save();
    }

    /* ================= RESPONSE (SAFE FOR FRONTEND) ================= */
    return NextResponse.json({
      success: true,

      orderId: orderDoc.orderId,
      dbOrderId: orderDoc._id,

      amount: orderDoc.amount,

      razorpayOrder: razorpayOrder, // null if UPI/MANUAL
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
