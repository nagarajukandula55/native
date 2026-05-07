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
    console.log("📦 BODY:", JSON.stringify(body, null, 2));

    let {
      cart = [],
      address = {},
      paymentMethod = "UPI",
      email,
    } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart empty" },
        { status: 400 }
      );
    }

    console.log("🛒 RAW CART RECEIVED:", cart);

    /* ================= BUILD ITEMS ================= */
    let items = [];

    for (const item of cart) {
      const productId = item.productId || item._id || item.productKey;

      if (!productId) {
        console.log("❌ Missing productId in item:", item);
        continue;
      }

    let product = null;
    
    try {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId).lean();
      }
    
      if (!product && typeof productId === "string") {
        product = await Product.findOne({ productKey: productId }).lean();
      }
    } catch (err) {
      console.error("❌ PRODUCT FETCH ERROR:", productId, err.message);
      continue; // skip this item instead of crashing
    }

    console.log("🔍 CHECKING ITEM:", item);
    console.log("🆔 PRODUCT ID:", productId);
    
    if (!product) {
      console.error("❌ PRODUCT NOT FOUND:", productId);
      continue;
    }

      const qty = Math.max(Number(item.qty || 1), 1);

      const price =
        Number(product?.primaryVariant?.sellingPrice) ||
        Number(product?.pricing?.sellingPrice) ||
        Number(product?.price) ||
        0;
      if (!price) {
      console.warn("⚠️ INVALID PRICE FOR PRODUCT:", productId);
    }

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

    /* ================= CRITICAL CHECK ================= */
    if (!items.length) {
      console.error("❌ NO VALID ITEMS AFTER PROCESSING");
      return NextResponse.json(
        { success: false, message: "No valid products found" },
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

    /* ================= RAZORPAY ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY") {
      const Razorpay = (await import("razorpay")).default;

      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      razorpayOrder = await rzp.orders.create({
        amount: Math.round(amount * 100),
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
      console.error("🔥 FULL ORDER ERROR:", err);
      console.error("🔥 STACK:", err.stack);

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
