export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { createOrderSafe } from "@/lib/safe/createOrderSafe";

const round = (n) => Math.round(n * 100) / 100;

export async function POST(req) {
  console.log("🚀 STEP 1: ORDER API HIT");

  try {
    await dbConnect();
    console.log("✅ STEP 2: DB CONNECTED");

    const body = await req.json();
    console.log("📦 STEP 3: REQUEST BODY:", JSON.stringify(body, null, 2));

    let { cart = [], address = {}, paymentMethod = "UPI" } = body;

    if (!Array.isArray(cart) || cart.length === 0) {
      console.log("❌ STEP 4: EMPTY CART");
      return NextResponse.json(
        { success: false, message: "Cart empty" },
        { status: 400 }
      );
    }

    console.log("🛒 STEP 5: CART LENGTH:", cart.length);

    let subtotal = 0;
    const items = [];

    for (const item of cart) {
      console.log("🔎 STEP 6: PROCESS ITEM:", item);

      try {
        const productId =
          item.productId || item._id || item.productKey;

        console.log("🔑 STEP 7: PRODUCT ID:", productId);

        let product = null;

        if (mongoose.Types.ObjectId.isValid(productId)) {
          console.log("🧠 STEP 8: FIND BY ID");
          product = await Product.findById(productId).lean();
        }

        if (!product) {
          console.log("🧠 STEP 9: FIND BY productKey");
          product = await Product.findOne({
            productKey: productId,
          }).lean();
        }

        if (!product) {
          console.log("❌ STEP 10: PRODUCT NOT FOUND");
          continue;
        }

        console.log("✅ STEP 11: PRODUCT FOUND:", product.name);

        const qty = Math.max(Number(item.qty || 1), 1);

        const price =
          Number(product?.primaryVariant?.sellingPrice) ||
          Number(product?.pricing?.sellingPrice) ||
          Number(product?.price) ||
          0;

        const gstPercent = Number(product?.tax || 0);

        const baseAmount = price * qty;
        const gst = (baseAmount * gstPercent) / 100;

        subtotal += baseAmount;

        const builtItem = {
          productId: product._id,
          productKey: product.productKey,
          name: product.name || "",
          image: product.primaryImage || "",

          price,
          qty,
          gstPercent,

          baseAmount,
          discountAmount: 0,
          taxableAmount: baseAmount,

          cgst: gstPercent ? gst / 2 : 0,
          sgst: gstPercent ? gst / 2 : 0,
          igst: 0,

          total: round(baseAmount + gst),
        };

        console.log("📦 STEP 12: BUILT ITEM:", builtItem);

        items.push(builtItem);

      } catch (err) {
        console.error("❌ ITEM ERROR:", err);
      }
    }

    console.log("📊 STEP 13: FINAL ITEMS:", items);

    if (!items.length) {
      console.log("❌ STEP 14: NO VALID ITEMS");
      return NextResponse.json(
        { success: false, message: "No valid products" },
        { status: 400 }
      );
    }

    const totalAmount = round(
      items.reduce((sum, i) => sum + i.total, 0)
    );

    console.log("💰 STEP 15: TOTAL:", totalAmount);

    const billing = {
      subtotal,
      discount: 0,
      taxableAmount: subtotal,

      cgst: items.reduce((a, b) => a + b.cgst, 0),
      sgst: items.reduce((a, b) => a + b.sgst, 0),
      igst: 0,

      totalGST: items.reduce((a, b) => a + b.cgst + b.sgst, 0),
      grandTotal: totalAmount,
    };

    console.log("🧾 STEP 16: BILLING:", billing);

    console.log("🏠 STEP 17: ADDRESS:", address);

    const order = await createOrderSafe({
      items,
      address,
      amount: totalAmount,
      billing,
      paymentMethod,
    });

    console.log("🎉 STEP 18: ORDER CREATED:", order.orderId);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
    });

  } catch (err) {
    console.error("🔥 FINAL ERROR:", err);
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
