import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { generateOrderId } from "@/lib/orderId";
import { createOrder } from "@/lib/order/createOrder";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const { cart = [], address = {}, paymentMethod = "UPI" } = body;

    if (!cart.length) {
      return NextResponse.json(
        { success: false, message: "Cart empty" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS ================= */
    let subtotal = 0;
    const items = [];

    for (const c of cart) {
      const id = c.productId || c._id || c.productKey;
      if (!id) continue;

      let product = null;

      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id).lean();
      }

      if (!product) {
        product = await Product.findOne({ productKey: id }).lean();
      }

      if (!product) continue;

      const qty = Math.max(Number(c.qty || 1), 1);

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
        image: product.primaryImage || "",
        price,
        qty,
        gstPercent,
        baseAmount,
        total: baseAmount + gst,
      });
    }

    if (!items.length) {
      return NextResponse.json(
        { success: false, message: "Invalid products" },
        { status: 400 }
      );
    }

    const finalAmount = Math.round(
      items.reduce((a, b) => a + b.total, 0)
    );

    const orderId = await generateOrderId();

    /* ================= CREATE ================= */
    const order = await createOrder({
      orderId,
      items,
      amount: finalAmount,
      address,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
