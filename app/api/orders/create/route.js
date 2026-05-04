import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Razorpay from "razorpay";
import { generateOrderId } from "@/lib/orderId";

import { validateCart } from "@/lib/validators/validateCart";
import { createOrderSafe } from "@/lib/safe/createOrderSafe";
import mongoose from "mongoose";

/* ================= CONFIG ================= */
const PAYMENT_CONFIG = {
  RAZORPAY: false,
  UPI: true,
  COD: true,
};

/* ================= HELPERS ================= */
const round = (n) => Math.round(n * 100) / 100;

/* ================= MAIN ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    let {
      cart = [],
      address = {},
      coupon = null,
      paymentMethod = "UPI",
    } = body;

    /* ================= VALIDATE CART ================= */
    cart = validateCart(cart);

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    /* ================= SAFE ADDRESS ================= */
    const safeAddress = {
      name: address?.name || "",
      phone: address?.phone || "",
      email: address?.email || "",
      address: address?.address || "",
      city: address?.city || "",
      state: address?.state || "",
      pincode: address?.pincode || "",
      gstNumber: address?.gstNumber || null,
    };

    if (!safeAddress.state || !safeAddress.pincode) {
      return NextResponse.json(
        { success: false, message: "Invalid address" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS ================= */
    let subtotal = 0;
    const items = [];

    for (const item of cart) {
      const productId =
        item.productId || item._id || item.productKey;

      if (!productId) continue;

      let product = null;

      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await Product.findById(productId).lean();
      }

      if (!product) {
        product = await Product.findOne({
          productKey: productId,
        }).lean();
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
      subtotal += baseAmount;

      /* 🚨 IMPORTANT: NO "name" or extra fields beyond schema */
      items.push({
        productId: product._id,
        productKey: product.productKey,
        image: product.primaryImage || "",
        price,
        qty,
        gstPercent,
        baseAmount,
        total: 0,
      });
    }

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid products found" },
        { status: 400 }
      );
    }

    /* ================= COUPON ================= */
    let discount = 0;

    if (coupon) {
      const c = await Coupon.findOne({
        code: coupon.toUpperCase(),
        active: true,
      });

      if (c && subtotal >= (c.minCartValue || 0)) {
        discount =
          c.type === "percent"
            ? (subtotal * c.value) / 100
            : c.value;
      }
    }

    const discountRatio = subtotal ? discount / subtotal : 0;

    /* ================= TAX CALCULATION ================= */
    let totalTaxable = 0;
    let totalGST = 0;

    for (const item of items) {
      const taxable = item.baseAmount - item.baseAmount * discountRatio;
      const gst = (taxable * item.gstPercent) / 100;

      item.total = round(taxable + gst);

      totalTaxable += taxable;
      totalGST += gst;
    }

    const finalAmount = round(totalTaxable + totalGST);

    if (!isFinite(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    /* ================= ORDER ID ================= */
    const orderId = await generateOrderId();

    /* ================= CREATE ORDER (SAFE LAYER) ================= */
    const orderDoc = await createOrderSafe({
      orderId,
      items,
      amount: finalAmount,
      address: safeAddress,
      paymentMethod,
    });

    /* ================= RAZORPAY ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY" && PAYMENT_CONFIG.RAZORPAY) {
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
        method: "RAZORPAY",
      };

      await orderDoc.save();
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      orderId: orderDoc.orderId,
      amount: orderDoc.amount,
      razorpayOrder,
    });

  } catch (err) {
    console.error("🔥 ORDER CREATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Order creation failed",
      },
      { status: 500 }
    );
  }
}
