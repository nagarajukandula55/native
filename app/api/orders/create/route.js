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
  RAZORPAY: false,
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

    console.log("🛒 RAW CART:", JSON.stringify(cart, null, 2));

    /* ================= BLOCK RAZORPAY ================= */
    if (paymentMethod === "RAZORPAY" && !PAYMENT_CONFIG.RAZORPAY) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay disabled. Use UPI / COD",
        },
        { status: 400 }
      );
    }

    /* ================= SAFE CART ================= */
    cart = validateCart(cart);
    console.log("✅ CLEANED CART:", cart);

    if (!cart.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart empty after validation",
          debug: cart,
        },
        { status: 400 }
      );
    }

    /* ================= ADDRESS ================= */
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
      const productId =
        item.productId || item._id || item.productKey;

      if (!productId) {
        console.warn("❌ Missing productId:", item);
        continue;
      }

      let product = null;

      try {
        // ✅ Try Mongo _id first
        product = await Product.findById(productId).lean();
      } catch (err) {
        console.warn("⚠️ Not a valid ObjectId, trying productKey...");
      }

      try {
        // ✅ Fallback to productKey
        if (!product) {
          product = await Product.findOne({
            productKey: productId,
          }).lean();
        }
      } catch (err) {
        console.error("❌ Product lookup error:", productId, err);
        continue;
      }

      if (!product) {
        console.warn("❌ Product not found:", productId);
        continue;
      }

      const qty = Math.max(Number(item.qty || 1), 1);

      // 🔥 IMPORTANT FIX (your schema uses variants)
      const price =
        Number(product?.primaryVariant?.sellingPrice) ||
        Number(product.price) ||
        0;

      const gstPercent = Number(product.tax || 0);

      const baseAmount = price * qty;
      subtotal += baseAmount;

      items.push({
        productId: product._id,
        name: product.name,
        image:
          product.primaryImage ||
          product.images?.[0] ||
          "",
        price,
        qty,
        gstPercent,
        baseAmount,
        total: 0,
      });
    }

    console.log("🧾 FINAL ITEMS:", items);

    if (!items.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid products found",
          debug: cart,
        },
        { status: 400 }
      );
    }

    /* ================= COUPON ================= */
    let discount = 0;

    if (coupon) {
      try {
        const c = await Coupon.findOne({
          code: coupon,
          active: true,
        });

        if (c && subtotal >= (c.minOrder || 0)) {
          discount = Number(c.discount || 0);
        }
      } catch (err) {
        console.error("Coupon error:", err);
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

    console.log("💰 FINAL AMOUNT:", finalAmount);

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
      status: "PENDING_PAYMENT", // ✅ UPI will stay pending
      paymentMethod,
    });

    /* ================= NOTIFICATION ================= */
    try {
      await notifyOrderEvent(orderDoc, null);
    } catch (err) {
      console.error("Notify failed:", err);
    }

    /* ================= RAZORPAY ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY" && PAYMENT_CONFIG.RAZORPAY) {
      try {
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
      } catch (err) {
        console.error("Razorpay error:", err);

        return NextResponse.json(
          { success: false, message: "Payment gateway error" },
          { status: 500 }
        );
      }
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
