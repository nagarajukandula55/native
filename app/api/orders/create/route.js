export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

import { generateOrderId } from "@/lib/orderId"; // ✅ NEW
import { createOrderSafe } from "@/lib/safe/createOrderSafe"; // ✅ NEW

const round = (n) => Math.round(n * 100) / 100;

export async function POST(req) {
  console.log("🔥 ORDER API HIT");

  try {
    await dbConnect();
    console.log("✅ DB Connected");

    const body = await req.json();
    console.log("📦 BODY:", body);

    let { cart = [], address = {}, paymentMethod = "UPI" } = body;

    /* ================= VALIDATE CART ================= */
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

      /* ---------- FIND PRODUCT ---------- */
      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId).lean();
      }

      if (!product) {
        product = await Product.findOne({
          productKey: productId,
        }).lean();
      }

      if (!product) {
        console.log("❌ Product not found:", productId);
        continue;
      }

      /* ---------- CALCULATIONS ---------- */
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

      /* ---------- PUSH ITEM ---------- */
      items.push({
        productId: product._id,
        productKey: product.productKey,
        name: product.name,
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

    /* ================= VALIDATE ITEMS ================= */
    if (!items.length) {
      console.log("❌ No valid items");
      return NextResponse.json(
        { success: false, message: "No valid products" },
        { status: 400 }
      );
    }

    /* ================= TOTAL ================= */
    const totalAmount = round(
      items.reduce((sum, i) => sum + i.total, 0)
    );

    console.log("💰 TOTAL:", totalAmount);

    /* ================= ORDER ID ================= */
    const orderId = await generateOrderId();
    console.log("🆔 ORDER ID:", orderId);

    /* ================= CREATE ORDER (SAFE) ================= */
    const order = await createOrderSafe({
      orderId,
      items,
      address,
      amount: totalAmount,
      paymentMethod,
    });

    console.log("✅ ORDER CREATED:", order.orderId);

    /* ================= RESPONSE ================= */
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
        stack: err.stack, // debug
      },
      { status: 500 }
    );
  }
}
