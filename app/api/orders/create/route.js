import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Razorpay from "razorpay";
import { generateOrderId } from "@/lib/orderId";

import { notifyOrderEvent } from "@/lib/notifications/notifyOrderEvent";

const round = (n) => Math.round(n * 100) / 100;

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      cart = [],
      address = {},
      coupon = null,
      paymentMethod = "RAZORPAY",
      gstNumber = null,
    } = body;

    console.log("🛒 CART RECEIVED:", cart);

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!address?.state || !address?.pincode) {
      return NextResponse.json(
        { success: false, message: "Invalid address" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS ================= */
    let subtotal = 0;
    let items = [];
    let errors = [];

    for (const item of cart) {
      const productId = item.productId || item._id;

      if (!productId) {
        errors.push({ item, reason: "Missing productId" });
        continue;
      }

      const product = await Product.findById(productId).lean();

      if (!product) {
        errors.push({ productId, reason: "Product not found" });
        continue;
      }

      const qty = Math.max(Number(item.qty || 1), 1);
      const price = Number(product.price || 0);
      const gstPercent = Number(product.tax || 0);

      const baseAmount = price * qty;
      subtotal += baseAmount;

      items.push({
        productId: product._id,
        name: product.name,
        price,
        qty,
        gstPercent,
        baseAmount,
        total: 0,
      });
    }

    /* ================= HARD STOP IF INVALID ================= */
    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid products found",
          errors, // 🔥 IMPORTANT DEBUG
        },
        { status: 400 }
      );
    }

    if (errors.length > 0) {
      console.warn("⚠️ Cart validation issues:", errors);
    }

    /* ================= COUPON ================= */
    let discount = 0;

    if (coupon) {
      const c = await Coupon.findOne({ code: coupon, active: true });
      if (c && subtotal >= (c.minOrder || 0)) {
        discount = Number(c.discount || 0);
      }
    }

    const discountRatio = subtotal ? discount / subtotal : 0;

    /* ================= TOTAL CALC ================= */
    let totalTaxable = 0;
    let totalGST = 0;

    for (let item of items) {
      const discounted = item.baseAmount * discountRatio;
      const taxable = item.baseAmount - discounted;

      const gst = (taxable * item.gstPercent) / 100;

      item.total = round(taxable + gst);

      totalTaxable += taxable;
      totalGST += gst;
    }

    const finalAmount = round(totalTaxable + totalGST);

    if (finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    /* ================= ORDER ================= */
    const orderId = await generateOrderId();

    const orderDoc = await Order.create({
      orderId,
      items,
      amount: finalAmount,
      address,
      status: "PENDING_PAYMENT",
      paymentMethod,
    });

    try {
      await notifyOrderEvent(orderDoc, null);
    } catch (err) {
      console.error("Notify failed:", err);
    }

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

    return NextResponse.json({
      success: true,
      orderId: orderDoc.orderId,
      amount: orderDoc.amount,
      razorpayOrder,
    });

  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Order failed",
      },
      { status: 500 }
    );
  }
}
