export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order"; // ✅ FIXED
import mongoose from "mongoose";

const round = (n) => Math.round(n * 100) / 100;

export async function POST(req) {
  console.log("🔥 ORDER API HIT");

  try {
    await dbConnect();
    console.log("✅ DB Connected");

    const body = await req.json();
    console.log("📦 BODY:", body);

    let { cart = [], address = {}, paymentMethod = "UPI" } = body;

    if (!Array.isArray(cart) || !cart.length) {
      console.log("❌ Empty cart");
      return NextResponse.json(
        { success: false, message: "Cart empty" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS ================= */
    let items = [];

    for (const item of cart) {
      console.log("🔍 Processing item:", item);

      const productId =
        item.productId || item._id || item.productKey;

      let product = null;

      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId).lean();
      }

      if (!product) {
        product = await Product.findOne({ productKey: productId }).lean();
      }

      if (!product) {
        console.log("❌ Product not found:", productId);
        continue;
      }

      const qty = Math.max(Number(item.qty || 1), 1);

      const price =
        Number(product?.primaryVariant?.sellingPrice) ||
        Number(product?.pricing?.sellingPrice) ||
        Number(product?.price) ||
        0;

      const gstPercent = Number(product?.tax || 0);

      const baseAmount = price * qty;
      const gst = (baseAmount * gstPercent) / 100;

      const final = round(baseAmount + gst);

      items.push({
        productId: product._id,
        productKey: product.productKey,
        name: product.name, // ✅ allowed now
        image: product.primaryImage || "",

        price,
        qty,
        gstPercent,

        baseAmount,
        taxableAmount: baseAmount,

        cgst: gst / 2,
        sgst: gst / 2,
        igst: 0,

        total: final,
      });
    }

    if (!items.length) {
      console.log("❌ No valid items");
      return NextResponse.json(
        { success: false, message: "No valid products" },
        { status: 400 }
      );
    }

    const totalAmount = round(
      items.reduce((sum, i) => sum + i.total, 0)
    );

    console.log("💰 TOTAL:", totalAmount);

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      orderId: "NA-" + Date.now(), // temporary simple ID
      items,
      amount: totalAmount,
      address,

      status: "PENDING_PAYMENT",

      payment: {
        method: paymentMethod,
        status: "PENDING",
      },

      auditLogs: [
        {
          action: "ORDER_CREATED",
          by: "SYSTEM",
        },
      ],
    });

    console.log("✅ ORDER CREATED:", order.orderId);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
    });

  } catch (err) {
    console.error("🔥 ORDER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
        stack: err.stack, // 👈 important for debugging
      },
      { status: 500 }
    );
  }
}
