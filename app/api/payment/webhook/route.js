import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { generateOrderId } from "@/lib/orderId";

const SELLER_STATE = "Andhra Pradesh";

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

    /* ================= SECURE PRODUCT FETCH ================= */
    let subtotal = 0;
    let gstTotal = 0;

    const safeItems = [];

    for (const item of cart) {
      let product = null;

      // ✅ Strict validation
      if (
        item.productId &&
        mongoose.Types.ObjectId.isValid(item.productId)
      ) {
        product = await Product.findById(item.productId).lean();
      }

      if (!product && item.productKey) {
        product = await Product.findOne({
          productKey: item.productKey,
        }).lean();
      }

      // ❌ BLOCK if not found
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Invalid product" },
          { status: 400 }
        );
      }

      const price = Number(product.price || 0);
      const qty = Math.max(Number(item.qty || 1), 1);
      const gstPercent = Number(product.tax || 0);

      const base = price * qty;
      const gst = (base * gstPercent) / 100;

      subtotal += base;
      gstTotal += gst;

      safeItems.push({
        productId: product._id,
        productKey: product.productKey,
        name: product.name,
        price,
        qty,
        image: product.primaryImage || "",
        hsn: product.hsn || "NA",
        gstPercent,
        gstAmount: gst,
      });
    }

    /* ================= CART INTEGRITY ================= */
    if (safeItems.length !== cart.length) {
      return NextResponse.json(
        { success: false, message: "Cart tampering detected" },
        { status: 400 }
      );
    }

    /* ================= GST MODE ================= */
    const isInterState =
      address?.state &&
      address.state !== SELLER_STATE;

    const cgstTotal = isInterState ? 0 : gstTotal / 2;
    const sgstTotal = isInterState ? 0 : gstTotal / 2;
    const igstTotal = isInterState ? gstTotal : 0;

    /* ================= FINAL AMOUNT ================= */
    const appliedDiscount = 0; // 🔒 no frontend trust

    const totalBeforeDiscount = subtotal + gstTotal;

    const finalAmount = Math.max(
      totalBeforeDiscount - appliedDiscount,
      0
    );

    if (finalAmount <= 0) {
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

      amount: finalAmount,

      gstSummary: {
        subtotal,
        gstTotal,
        cgstTotal,
        sgstTotal,
        igstTotal,
        totalBeforeDiscount,
      },

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
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: orderId,
      });

      orderDoc.payment = {
        razorpay_order_id: razorpayOrder.id,
      };

      await orderDoc.save();
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      orderId,
      amount: finalAmount,
      gstSummary: orderDoc.gstSummary,
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
