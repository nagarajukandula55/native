export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

import { generateOrderId } from "@/lib/generateOrderId";
import { createOrderSafe } from "@/lib/safe/createOrderSafe";

const round = (n) => Math.round(n * 100) / 100;

export async function POST(req) {
  console.log("🔥 ORDER API HIT");

  try {
    await dbConnect();

    const body = await req.json();
    console.log("📦 BODY:", body);

    let {
      cart = [],
      address = {},
      paymentMethod = "UPI",
      email,
    } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || !cart.length) {
      return NextResponse.json(
        { success: false, message: "Cart empty" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS ================= */
    let items = [];

    for (const item of cart) {
      const productId = item.productId || item._id || item.productKey;

      let product = null;

      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId).lean();
      }

      if (!product) {
        product = await Product.findOne({ productKey: productId }).lean();
      }

      if (!product) continue;

      const qty = Math.max(Number(item.qty || 1), 1);

      const price =
        Number(product?.primaryVariant?.sellingPrice) ||
        Number(product?.pricing?.sellingPrice) ||
        Number(product?.price) ||
        0;

      const gstPercent = Number(product?.tax || 0);

      const baseAmount = price * qty;
      const gst = (baseAmount * gstPercent) / 100;

      items.push({
        productId: product._id,
        productKey: product.productKey,
        name: product.name,
        price,
        qty,
        gstPercent,
        baseAmount,
        total: round(baseAmount + gst),
      });
    }

    if (!items.length) {
      return NextResponse.json(
        { success: false, message: "No valid products" },
        { status: 400 }
      );
    }

    const amount = round(items.reduce((s, i) => s + i.total, 0));

    const orderId = await generateOrderId();

    /* ================= CREATE ORDER ================= */
    const order = await createOrderSafe({
      orderId,
      items,
      address,
      amount,
      paymentMethod,
    });

    /* ================= RAZORPAY ENABLE ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY") {
      const Razorpay = (await import("razorpay")).default;

      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      razorpayOrder = await rzp.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: orderId,
      });

      console.log("💳 RAZORPAY ORDER:", razorpayOrder.id);
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount,
      razorpayOrder,
    });

  } catch (err) {
    console.error("🔥 ORDER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
