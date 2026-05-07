export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";

const round = (n) => Math.round(n * 100) / 100;

/* ================= SAFE ORDER ID ================= */
function generateSafeOrderId() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `NA-${Date.now()}-${random}`;
}

export async function POST(req) {
  console.log("\n==============================");
  console.log("🔥 ORDER API HIT");
  console.log("🕒 TIME:", new Date().toISOString());
  console.log("==============================\n");

  try {
    /* ================= DB CONNECT ================= */
    await dbConnect();
    console.log("✅ DB CONNECTED");

    /* ================= BODY ================= */
    const body = await req.json();

    console.log(
      "📦 RAW BODY:",
      JSON.stringify(body, null, 2)
    );

    let {
      cart = [],
      address = {},
      paymentMethod = "UPI",
      email = "",
    } = body;

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      console.log("❌ CART EMPTY");

      return NextResponse.json(
        {
          success: false,
          message: "Cart empty",
        },
        { status: 400 }
      );
    }

    console.log("🛒 CART COUNT:", cart.length);

    /* ================= PROCESS ITEMS ================= */
    let items = [];

    for (const item of cart) {
      try {
        console.log("\n-------------------");
        console.log("🔍 PROCESSING ITEM");
        console.log("-------------------");

        console.log("📦 ITEM:", item);

        const productId =
          item.productId ||
          item._id ||
          item.productKey;

        console.log("🆔 PRODUCT ID:", productId);

        if (!productId) {
          console.log("❌ NO PRODUCT ID FOUND");
          continue;
        }

        let product = null;

        /* ================= FIND PRODUCT ================= */
        try {
          if (mongoose.Types.ObjectId.isValid(productId)) {
            console.log("🔎 SEARCHING BY OBJECT ID");

            product = await Product.findById(productId).lean();
          }

          if (!product && typeof productId === "string") {
            console.log("🔎 SEARCHING BY PRODUCT KEY");

            product = await Product.findOne({
              productKey: productId,
            }).lean();
          }
        } catch (fetchErr) {
          console.error(
            "❌ PRODUCT FETCH ERROR:",
            fetchErr
          );

          continue;
        }

        if (!product) {
          console.log(
            "❌ PRODUCT NOT FOUND:",
            productId
          );

          continue;
        }

        console.log("✅ PRODUCT FOUND:", product.name);

        /* ================= QTY ================= */
        const qty = Math.max(
          Number(item.qty || 1),
          1
        );

        console.log("🔢 QTY:", qty);

        /* ================= PRICE ================= */
        const price =
          Number(product?.primaryVariant?.sellingPrice) ||
          Number(product?.pricing?.sellingPrice) ||
          Number(product?.price) ||
          0;

        console.log("💰 PRICE:", price);

        if (!price) {
          console.log(
            "⚠️ INVALID PRICE FOR:",
            product.name
          );
        }

        /* ================= GST ================= */
        const gstPercent = Number(product?.tax || 0);

        const baseAmount = round(price * qty);

        const gst = round(
          (baseAmount * gstPercent) / 100
        );

        const total = round(baseAmount + gst);

        console.log("🧾 GST %:", gstPercent);
        console.log("🧾 BASE:", baseAmount);
        console.log("🧾 GST:", gst);
        console.log("🧾 TOTAL:", total);

        items.push({
          productId: product._id,
          productKey: product.productKey,
          name: product.name,
          price,
          qty,
          gstPercent,
          baseAmount,
          gst,
          total,
        });

        console.log("✅ ITEM ADDED");
      } catch (itemErr) {
        console.error(
          "❌ ITEM PROCESSING ERROR:",
          itemErr
        );
      }
    }

    /* ================= FINAL ITEM CHECK ================= */
    console.log("\n==============================");
    console.log("📦 FINAL ITEMS");
    console.log("==============================");

    console.log(
      JSON.stringify(items, null, 2)
    );

    if (!items.length) {
      console.log("❌ NO VALID ITEMS");

      return NextResponse.json(
        {
          success: false,
          message: "No valid products found",
        },
        { status: 400 }
      );
    }

    /* ================= TOTAL ================= */
    const amount = round(
      items.reduce((sum, item) => sum + item.total, 0)
    );

    console.log("💰 FINAL AMOUNT:", amount);

    /* ================= SAFE ORDER CREATE ================= */
    let order = null;

    let retries = 3;

    while (retries > 0) {
      try {
        const orderId = generateSafeOrderId();

        console.log("🆔 GENERATED ORDER ID:", orderId);

        order = await Order.create({
          orderId,

          items,

          address,

          email,

          amount,

          paymentMethod,

          paymentStatus:
            paymentMethod === "COD"
              ? "Pending"
              : "Initiated",

          orderStatus: "Placed",

          createdAt: new Date(),
        });

        console.log(
          "✅ ORDER CREATED SUCCESSFULLY"
        );

        break;
      } catch (orderErr) {
        console.error(
          "❌ ORDER CREATE ERROR:",
          orderErr
        );

        /* DUPLICATE ORDER ID */
        if (orderErr.code === 11000) {
          console.log(
            "⚠️ DUPLICATE ORDER ID — RETRYING..."
          );

          retries--;

          continue;
        }

        throw orderErr;
      }
    }

    if (!order) {
      throw new Error(
        "Failed to create order after retries"
      );
    }

    /* ================= RAZORPAY ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY") {
      console.log("💳 CREATING RAZORPAY ORDER");

      const Razorpay = (await import("razorpay"))
        .default;

      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      razorpayOrder = await rzp.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: order.orderId,
      });

      console.log(
        "✅ RAZORPAY ORDER CREATED:",
        razorpayOrder.id
      );
    }

    /* ================= SUCCESS ================= */
    console.log("\n==============================");
    console.log("🎉 ORDER SUCCESS");
    console.log("==============================");

    console.log("🆔 ORDER:", order.orderId);
    console.log("💰 AMOUNT:", amount);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount,
      razorpayOrder,
    });
  } catch (err) {
    console.error("\n==============================");
    console.error("🔥 FULL ORDER ERROR");
    console.error("==============================");

    console.error("❌ MESSAGE:", err.message);

    console.error("❌ STACK:", err.stack);

    if (err.code) {
      console.error("❌ CODE:", err.code);
    }

    return NextResponse.json(
      {
        success: false,
        message: err.message,
        code: err.code || null,
        stack:
          process.env.NODE_ENV === "development"
            ? err.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
