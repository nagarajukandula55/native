import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Razorpay from "razorpay";
import { generateOrderId } from "@/lib/orderId";

/* ================= NOTIFICATIONS (HOOK READY) ================= */
import { notifyOrderEvent } from "@/lib/notifications/notifyOrderEvent";

/* ================= CONFIG ================= */
const SELLER_STATE = "Andhra Pradesh";

const STATE_CODE_MAP = {
  "Andhra Pradesh": "37",
  "Tamil Nadu": "33",
  "Karnataka": "29",
  "Telangana": "36",
};

/* ================= HELPERS ================= */
const round = (num) => Math.round(num * 100) / 100;

const GST_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/;

/* ================= ROUTE ================= */
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

    /* ================= VALIDATION ================= */
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

    /* ================= GST VALIDATION ================= */
    let gstType = "B2C";
    let gstStateCode = null;

    if (gstNumber) {
      if (!GST_REGEX.test(gstNumber)) {
        return NextResponse.json(
          { success: false, message: "Invalid GSTIN" },
          { status: 400 }
        );
      }

      gstType = "B2B";
      gstStateCode = gstNumber.slice(0, 2);
    }

    /* ================= BUILD ITEMS ================= */
    let subtotal = 0;
    let items = [];

    for (const item of cart) {
      const product = await Product.findById(item.productId).lean();

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Invalid product" },
          { status: 400 }
        );
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

    /* ================= COUPON ================= */
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

    /* ================= GST MODE ================= */
    const sellerCode = STATE_CODE_MAP[SELLER_STATE] || null;

    const buyerCode = address?.state
      ? STATE_CODE_MAP[address.state]
      : null;

    const gstOverrideCode = gstNumber ? gstStateCode : null;

    const finalBuyerCode = gstOverrideCode || buyerCode;

    const isInterState =
      sellerCode && finalBuyerCode
        ? sellerCode !== finalBuyerCode
        : false;

    const gstMode = isInterState ? "IGST" : "CGST_SGST";

    /* ================= DISCOUNT DISTRIBUTION ================= */
    const discountRatio = subtotal > 0 ? discount / subtotal : 0;

    let totalTaxable = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    for (let item of items) {
      const itemDiscount = item.baseAmount * discountRatio;
      const taxable = item.baseAmount - itemDiscount;

      const gstValue = (taxable * item.gstPercent) / 100;

      let cgst = 0,
        sgst = 0,
        igst = 0;

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

    /* ================= FINAL ================= */
    const totalGST = cgstTotal + sgstTotal + igstTotal;
    const finalAmount = totalTaxable + totalGST;

    if (finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    const orderId = await generateOrderId();

    /* ================= CREATE ORDER ================= */
    const orderDoc = await Order.create({
      orderId,
      items,
      amount: round(finalAmount),

      billing: {
        subtotal: round(subtotal),
        discount: round(discount),
        taxableAmount: round(totalTaxable),

        cgst: round(cgstTotal),
        sgst: round(sgstTotal),
        igst: round(igstTotal),

        total: round(finalAmount),
        itemCount: items.reduce((a, b) => a + b.qty, 0),
      },

      gstDetails: {
        gstNumber: gstNumber || null,
        gstType,
        gstMode,
        isInterState,
      },

      address,
      paymentMethod,
      status: "PENDING_PAYMENT",
    });

    /* ================= NOTIFICATION HOOK (SAFE) ================= */
    try {
      await notifyOrderEvent(orderDoc, null);
    } catch (notifyErr) {
      console.error("NOTIFICATION FAILED:", notifyErr);
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

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      success: true,
      orderId: orderDoc.orderId,
      amount: orderDoc.amount,
      billing: orderDoc.billing,
      gstDetails: orderDoc.gstDetails,
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
