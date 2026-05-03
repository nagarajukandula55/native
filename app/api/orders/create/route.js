import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Razorpay from "razorpay";
import { generateOrderId } from "@/lib/orderId";

import { notifyOrderEvent } from "@/lib/notifications/notifyOrderEvent";
import { validateCart } from "@/lib/validators/validateCart";

/* ================= HELPERS ================= */
const round = (n) => Math.round(n * 100) / 100;

/* ================= PAYMENT CONFIG ================= */
const PAYMENT_CONFIG = {
  RAZORPAY: false, // 🔥 DISABLED SAFELY (only change)
  UPI: true,
  COD: true,
  MANUAL: true,
};

/* ================= MAIN API ================= */
export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    let {
      cart = [],
      address = {},
      coupon = null,
      paymentMethod = "RAZORPAY",
      gstNumber = null,
    } = body;

    console.log("🛒 RAW CART:", cart);

    /* ================= BLOCK RAZORPAY SAFELY ================= */
    if (paymentMethod === "RAZORPAY" && PAYMENT_CONFIG.RAZORPAY === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay is temporarily disabled. Please choose UPI or COD.",
        },
        { status: 400 }
      );
    }

    /* ================= SAFE CART VALIDATION ================= */
    cart = validateCart(cart);

    if (!cart.length) {
      return NextResponse.json(
        { success: false, message: "Cart empty after validation" },
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

    for (const item of cart) {
      if (!item.productId) continue;

      let product;

      try {
        product = await Product.findById(item.productId).lean();
      } catch (err) {
        console.error("Product lookup error:", item.productId, err);
        continue;
      }

      if (!product) {
        console.warn("Product missing:", item.productId);
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

    if (!items.length) {
      return NextResponse.json(
        { success: false, message: "No valid products found" },
        { status: 400 }
      );
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

    if (!isFinite(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount calculated" },
        { status: 400 }
      );
    }

    const orderId = await generateOrderId();

    /* ================= CREATE ORDER ================= */
    const orderDoc = await Order.create({
      orderId,
      items,
      amount: finalAmount,
      address,
      status: "PENDING_PAYMENT",
      paymentMethod,
    });

    /* ================= NOTIFICATION ================= */
    try {
      await notifyOrderEvent(orderDoc, null);
    } catch (err) {
      console.error("Notify failed:", err);
    }

    /* ================= RAZORPAY DISABLED ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY" && PAYMENT_CONFIG.RAZORPAY === true) {
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
        message: err.message || "Order creation failed",
      },
      { status: 500 }
    );
  }
}
