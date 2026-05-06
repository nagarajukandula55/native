export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { createOrderSafe } from "@/lib/safe/createOrderSafe";

/* ================= HELPERS ================= */
const round = (n) => Math.round(n * 100) / 100;

/* ================= MAIN ================= */
export async function POST(req) {
  console.log("🚀 ORDER V3 HIT");

  try {
    await dbConnect();

    const body = await req.json();

    let { cart = [], address = {}, paymentMethod = "UPI" } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart empty" },
        { status: 400 }
      );
    }

    if (!address?.name || !address?.phone || !address?.pincode) {
      return NextResponse.json(
        { success: false, message: "Invalid address" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS ================= */
    let subtotal = 0;
    const items = [];

    for (const item of cart) {
      try {
        const productId =
          item.productId || item._id || item.productKey;

        if (!productId) continue;

        let product = null;

        // ✅ Try ObjectId
        if (mongoose.Types.ObjectId.isValid(productId)) {
          product = await Product.findById(productId).lean();
        }

        // ✅ Fallback productKey
        if (!product) {
          product = await Product.findOne({
            productKey: productId,
          }).lean();
        }

        if (!product?._id) {
          console.warn("❌ Product not found:", productId);
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

        subtotal += baseAmount;

        items.push({
          productId: product._id,
          productKey: product.productKey,
          name: product.name || "", // ✅ SAFE NOW
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
        });

      } catch (err) {
        console.error("❌ Item build error:", err);
      }
    }

    if (!items.length) {
      return NextResponse.json(
        { success: false, message: "No valid products" },
        { status: 400 }
      );
    }

    /* ================= BILLING ================= */
    const totalAmount = round(
      items.reduce((sum, i) => sum + i.total, 0)
    );

    const billing = {
      subtotal,
      discount: 0,
      taxableAmount: subtotal,

      cgst: items.reduce((a, b) => a + b.cgst, 0),
      sgst: items.reduce((a, b) => a + b.sgst, 0),
      igst: 0,

      totalGST: items.reduce((a, b) => a + b.cgst + b.sgst + b.igst, 0),
      grandTotal: totalAmount,
    };

    /* ================= SAFE ORDER CREATE ================= */
    const order = await createOrderSafe({
      items,
      address,
      amount: totalAmount,
      billing,
      paymentMethod,
    });

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
    });

  } catch (err) {
    console.error("🔥 ORDER ERROR:", err);
    console.error("🔥 STACK:", err.stack);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Order failed",
      },
      { status: 500 }
    );
  }
}
