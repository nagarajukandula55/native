import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon"; // optional if exists
import Razorpay from "razorpay";
import { generateOrderId } from "@/lib/orderId";

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

    /* ================= FETCH PRODUCTS & LOCK PRICING ================= */
    let subtotal = 0;
    let gstTotal = 0;

    const items = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.findOne({
          productKey: item.productKey,
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productKey}`);
        }

        const qty = Number(item.qty || 1);
        const price = Number(product.price || 0);

        const base = price * qty;
        const gst = (base * (product.tax || 0)) / 100;

        subtotal += base;
        gstTotal += gst;

        return {
          productId: product._id,
          productKey: product.productKey,
          name: product.name,
          price,
          qty,
          hsn: product.hsn,
          gstPercent: product.tax,
          image: product.primaryImage || "",
        };
      })
    );

    /* ================= COUPON VALIDATION (SERVER SIDE) ================= */
    let discount = 0;

    if (coupon) {
      const validCoupon = await Coupon.findOne({ code: coupon });

      if (validCoupon) {
        discount = Number(validCoupon.discount || 0);
      }
    }

    /* ================= FINAL AMOUNT ================= */
    const totalBeforeDiscount = subtotal + gstTotal;
    const finalAmount = Math.max(totalBeforeDiscount - discount, 0);

    if (finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid order amount" },
        { status: 400 }
      );
    }

    /* ================= ORDER ID ================= */
    const orderId = await generateOrderId();

    /* ================= SAVE ORDER ================= */
    const orderDoc = await Order.create({
      orderId,
      items,
      amount: finalAmount,

      gstSummary: {
        subtotal,
        gstTotal,
        totalBeforeDiscount,
        discount,
      },

      address,
      coupon,
      discount,
      paymentMethod,
      gstNumber,

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
