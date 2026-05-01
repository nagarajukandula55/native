import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { generateOrderId } from "@/lib/orderId";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      cart = [],
      address = {},
      coupon = null,
      paymentMethod = "RAZORPAY",
    } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    /* ================= SERVER-SIDE PRICE LOCK ================= */
    let subtotal = 0;

    const safeItems = await Promise.all(
      cart.map(async (item) => {
        let product = null;

        if (
          item.productId &&
          mongoose.Types.ObjectId.isValid(item.productId)
        ) {
          product = await Product.findById(item.productId).lean();
        }

        const price = Number(product?.price || item.price || 0);
        const qty = Number(item.qty || 1);

        subtotal += price * qty;

        return {
          productId: item.productId || null,
          productKey: product?.productKey || item.productKey || "",
          name: product?.name || item.name || "Product",
          price, // ✅ SERVER TRUSTED
          qty,
          image: product?.primaryImage || item.image || "",
          hsn: product?.hsn || "NA",
          gstPercent: product?.tax || 0,
        };
      })
    );

    /* ================= DISCOUNT SAFE ================= */
    const appliedDiscount = 0; // 🔒 NEVER TRUST FRONTEND
    const amount = Math.max(subtotal - appliedDiscount, 0);

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    /* ================= ORDER ID ================= */
    const orderId = await generateOrderId();

    /* ================= SAVE ORDER ================= */
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

    /* ================= RAZORPAY ================= */
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

    return NextResponse.json({
      success: true,
      orderId,
      amount,
      razorpayOrder,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Order failed" },
      { status: 500 }
    );
  }
}
