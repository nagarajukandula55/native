export const dynamic = "force-dynamic";

console.log("🔥 V3 ORDER ROUTE HIT");

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Razorpay from "razorpay";
import mongoose from "mongoose";

import { createOrderSafe } from "@/lib/safe/createOrderSafe";

/* ================= CONFIG ================= */
const PAYMENT_CONFIG = {
  RAZORPAY: false,
  UPI: true,
  COD: true,
};

const round = (n) => Math.round(n * 100) / 100;

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    let { cart = [], address = {}, coupon, paymentMethod = "UPI" } = body;

    if (!Array.isArray(cart) || !cart.length) {
      return NextResponse.json(
        { success: false, message: "Cart empty" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS ================= */
    let subtotal = 0;
    const items = [];

    for (const item of cart) {
      const productId =
        item.productId || item._id || item.productKey;

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
        0;

      const gstPercent = Number(product?.tax || 0);

      const baseAmount = price * qty;
      const gst = (baseAmount * gstPercent) / 100;

      subtotal += baseAmount;

      items.push({
        productId: product._id,
        productKey: product.productKey,
        name: product.name, // ✅ now safe
        image: product.primaryImage || "",

        price,
        qty,
        gstPercent,

        baseAmount,
        taxableAmount: baseAmount,

        cgst: gst / 2,
        sgst: gst / 2,
        igst: 0,

        total: round(baseAmount + gst),

        snapshot: {
          brand: product.brand,
          category: product.category,
          hsn: product.hsn,
        },
      });
    }

    if (!items.length) {
      return NextResponse.json(
        { success: false, message: "No valid products" },
        { status: 400 }
      );
    }

    const totalAmount = round(
      items.reduce((a, b) => a + b.total, 0)
    );

    /* ================= CREATE ORDER ================= */
    const order = await createOrderSafe({
      items,
      address,
      amount: totalAmount,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
    });

  } catch (err) {
    console.error("🔥 ORDER ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
