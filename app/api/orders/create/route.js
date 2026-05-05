import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import { generateOrderId } from "@/lib/orderId";
import Order from "@/models/Order";

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

    /* ================= VALIDATE ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    /* ================= ADDRESS ================= */
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

    const isInterState =
      safeAddress.state !== "Andhra Pradesh";

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

      items.push({
        productId: product._id,
        productKey: product.productKey,
        name: product.name,
        image: product.primaryImage || "",

        price,
        qty,
        gstPercent,

        baseAmount,
        discountAmount: 0,

        taxableAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
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

    /* ================= TAX ================= */
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    for (const item of items) {
      const discountAmt = item.baseAmount * discountRatio;
      const taxable = item.baseAmount - discountAmt;
      const gst = (taxable * item.gstPercent) / 100;

      item.discountAmount = round(discountAmt);
      item.taxableAmount = round(taxable);

      if (isInterState) {
        item.igst = round(gst);
        totalIGST += gst;
      } else {
        item.cgst = round(gst / 2);
        item.sgst = round(gst / 2);
        totalCGST += gst / 2;
        totalSGST += gst / 2;
      }

      item.total = round(taxable + gst);
      totalTaxable += taxable;
    }

    const totalGST = totalCGST + totalSGST + totalIGST;
    const finalAmount = round(totalTaxable + totalGST);

    if (!isFinite(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    /* ================= ORDER ID ================= */
    const orderId = await generateOrderId();

    /* ================= CREATE ORDER ================= */
    const orderDoc = await Order.create({
      orderId,

      items,

      billing: {
        subtotal,
        discount,
        taxableAmount: totalTaxable,

        cgst: totalCGST,
        sgst: totalSGST,
        igst: totalIGST,

        totalGST,
        grandTotal: finalAmount,
      },

      amount: finalAmount,

      address: safeAddress,

      payment: {
        method: paymentMethod,
        status: "PENDING",
      },

      status: "PENDING_PAYMENT",
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

      orderDoc.payment.razorpay_order_id = razorpayOrder.id;
      await orderDoc.save();
    }

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      orderId,
      amount: finalAmount,
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
