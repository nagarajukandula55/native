import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Razorpay from "razorpay";
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
      gstNumber = null,
    } = body;

    /* ================= BASIC VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!address?.pincode || !address?.state) {
      return NextResponse.json(
        { success: false, message: "Invalid address" },
        { status: 400 }
      );
    }

    /* ================= FETCH & LOCK PRODUCTS ================= */
    let subtotal = 0;
    let gstTotal = 0;

    const safeItems = [];

    for (const item of cart) {
      let product = null;

      // 🔒 Try both identifiers (tamper-proof)
      if (item.productId) {
        product = await Product.findById(item.productId).lean();
      }

      if (!product && item.productKey) {
        product = await Product.findOne({
          productKey: item.productKey,
        }).lean();
      }

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Invalid product detected" },
          { status: 400 }
        );
      }

      const qty = Math.max(Number(item.qty || 1), 1);
      const price = Number(product.price || 0);
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
        hsn: product.hsn || "NA",
        gstPercent,
        gstAmount: gst,
        image: product.primaryImage || "",
      });
    }

    /* ================= CART INTEGRITY CHECK ================= */
    if (safeItems.length !== cart.length) {
      return NextResponse.json(
        { success: false, message: "Cart tampering detected" },
        { status: 400 }
      );
    }

    /* ================= GST MODE ================= */
    const isInterState =
      address.state && address.state !== SELLER_STATE;

    const gstMode = isInterState ? "IGST" : "CGST_SGST";

    const cgstTotal = isInterState ? 0 : gstTotal / 2;
    const sgstTotal = isInterState ? 0 : gstTotal / 2;
    const igstTotal = isInterState ? gstTotal : 0;

    /* ================= COUPON VALIDATION ================= */
    let discount = 0;

    if (coupon) {
      const validCoupon = await Coupon.findOne({
        code: coupon,
        active: true,
      });

      if (
        validCoupon &&
        (!validCoupon.expiry || new Date(validCoupon.expiry) > new Date()) &&
        subtotal >= (validCoupon.minOrder || 0)
      ) {
        discount = Number(validCoupon.discount || 0);
      }
    }

    /* ================= FINAL AMOUNT ================= */
    const totalBeforeDiscount = subtotal + gstTotal;

    const finalAmount = Math.max(
      totalBeforeDiscount - discount,
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
        discount,
      },

      gstMode,
      gstNumber,

      address,
      coupon,
      discount,
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
      orderId: orderDoc.orderId,
      dbOrderId: orderDoc._id,

      amount: orderDoc.amount,

      gstSummary: orderDoc.gstSummary,

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
