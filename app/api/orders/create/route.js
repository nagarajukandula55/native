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

    /* ================= VALIDATION (UNCHANGED) ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty or invalid format" },
        { status: 400 }
      );
    }

    if (!address?.state || !address?.pincode) {
      return NextResponse.json(
        { success: false, message: "Invalid address" },
        { status: 400 }
      );
    }

    /* ================= BUILD ITEMS (FIXED SAFELY) ================= */
    let subtotal = 0;
    let items = [];

    for (const item of cart) {
      const productId = item.productId || item._id;

      if (!productId) {
        console.error("❌ Missing productId:", item);
        continue;
      }

      const product = await Product.findById(productId).lean();

      if (!product) {
        console.error("❌ Product not found:", productId);
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
        sku: product.productKey || "",
        hsn: product.hsn || "NA",

        price,
        qty,
        gstPercent,

        baseAmount,

        discountAllocated: 0,
        taxableAmount: 0,

        cgst: 0,
        sgst: 0,
        igst: 0,

        total: 0,
      });
    }

    /* ================= IMPORTANT FIX ================= */
    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid products found in cart",
        },
        { status: 400 }
      );
    }

    /* ================= COUPON (UNCHANGED) ================= */
    let discount = 0;

    if (coupon) {
      const c = await Coupon.findOne({ code: coupon, active: true });

      if (
        c &&
        (!c.expiry || new Date(c.expiry) > new Date()) &&
        subtotal >= (c.minOrder || 0)
      ) {
        discount = Number(c.discount || 0);
      }
    }

    /* ================= GST (UNCHANGED LOGIC) ================= */
    const STATE_CODE_MAP = {
      "Andhra Pradesh": "37",
      "Tamil Nadu": "33",
      "Karnataka": "29",
      "Telangana": "36",
    };

    const SELLER_STATE = "Andhra Pradesh";

    const sellerCode = STATE_CODE_MAP[SELLER_STATE];
    const buyerCode = address?.state ? STATE_CODE_MAP[address.state] : null;

    const gstStateCode = gstNumber ? gstNumber.slice(0, 2) : null;

    const finalBuyerCode = gstStateCode || buyerCode;

    const isInterState =
      sellerCode && finalBuyerCode
        ? sellerCode !== finalBuyerCode
        : false;

    const gstMode = isInterState ? "IGST" : "CGST_SGST";

    /* ================= TAX CALC (UNCHANGED) ================= */
    const discountRatio = subtotal > 0 ? discount / subtotal : 0;

    let totalTaxable = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    for (let item of items) {
      const itemDiscount = item.baseAmount * discountRatio;
      const taxable = item.baseAmount - itemDiscount;

      const gstValue = (taxable * item.gstPercent) / 100;

      let cgst = 0, sgst = 0, igst = 0;

      if (isInterState) {
        igst = gstValue;
      } else {
        cgst = gstValue / 2;
        sgst = gstValue / 2;
      }

      const total = taxable + gstValue;

      item.discountAllocated = round(itemDiscount);
      item.taxableAmount = round(taxable);

      item.cgst = round(cgst);
      item.sgst = round(sgst);
      item.igst = round(igst);

      item.total = round(total);

      totalTaxable += taxable;
      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;
    }

    const finalAmount = round(totalTaxable + cgstTotal + sgstTotal + igstTotal);

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

      billing: {
        subtotal,
        discount,
        taxableAmount: totalTaxable,
        cgst: cgstTotal,
        sgst: sgstTotal,
        igst: igstTotal,
        total: finalAmount,
        itemCount: items.reduce((a, b) => a + b.qty, 0),
      },

      gstDetails: {
        gstNumber,
        gstType: gstNumber ? "B2B" : "B2C",
        gstMode,
        isInterState,
      },

      address,
      paymentMethod,
      status: "PENDING_PAYMENT",
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
      { success: false, message: err.message || "Order failed" },
      { status: 500 }
    );
  }
}
