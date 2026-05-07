export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/db";

import Product from "@/models/Product";
import Order from "@/models/Order";

const round = (n) => Math.round(Number(n || 0) * 100) / 100;

/* ================= SAFE ORDER ID ================= */
function generateSafeOrderId() {
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `NA-${Date.now()}-${random}`;
}

/* ================= API ================= */
export async function POST(req) {
  console.log("\n==============================");
  console.log("🔥 ORDER API HIT");
  console.log("🕒 TIME:", new Date().toISOString());
  console.log("==============================\n");

  try {
    /* ================= DB ================= */
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
      console.log("❌ EMPTY CART");

      return NextResponse.json(
        {
          success: false,
          message: "Cart empty",
        },
        { status: 400 }
      );
    }

    console.log("🛒 CART COUNT:", cart.length);

    /* ================= BUILD ITEMS ================= */
    const items = [];

    for (const item of cart) {
      try {
        console.log("\n-------------------------");
        console.log("🔍 PROCESSING ITEM");
        console.log("-------------------------");

        console.log("📦 ITEM:", item);

        const productId =
          item.productId ||
          item._id ||
          item.productKey;

        console.log("🆔 PRODUCT ID:", productId);

        if (!productId) {
          console.log("❌ PRODUCT ID MISSING");
          continue;
        }

        let product = null;

        /* ================= FIND PRODUCT ================= */
        try {
          if (mongoose.Types.ObjectId.isValid(productId)) {
            console.log("🔎 FIND BY OBJECT ID");

            product = await Product.findById(
              productId
            ).lean();
          }

          if (!product && typeof productId === "string") {
            console.log("🔎 FIND BY PRODUCT KEY");

            product = await Product.findOne({
              productKey: productId,
            }).lean();
          }
        } catch (findErr) {
          console.error(
            "❌ PRODUCT FETCH ERROR:",
            findErr
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

        console.log(
          "✅ PRODUCT FOUND:",
          product.name
        );

        /* ================= QTY ================= */
        const qty = Math.max(
          Number(item.qty || 1),
          1
        );

        /* ================= PRICE ================= */
        const price =
          Number(product?.primaryVariant?.sellingPrice) ||
          Number(product?.pricing?.sellingPrice) ||
          Number(product?.price) ||
          0;

        console.log("💰 PRICE:", price);

        if (!price) {
          console.log(
            "⚠️ INVALID PRICE:",
            product.name
          );
        }

        /* ================= GST ================= */
        const gstPercent = Number(product?.tax || 0);

        const baseAmount = round(price * qty);

        const gstAmount = round(
          (baseAmount * gstPercent) / 100
        );

        const cgst = round(gstAmount / 2);

        const sgst = round(gstAmount / 2);

        const total = round(baseAmount + gstAmount);

        /* ================= ITEM ================= */
        items.push({
          productId: product._id,

          productKey: product.productKey,

          name: product.name,

          image:
            product?.images?.[0]?.url ||
            product?.thumbnail ||
            "",

          price,

          qty,

          gstPercent,

          baseAmount,

          taxableAmount: baseAmount,

          cgst,

          sgst,

          igst: 0,

          total,

          snapshot: {
            brand: product?.brand || "",

            category: product?.category || "",

            hsn: product?.hsn || "",
          },
        });

        console.log("✅ ITEM ADDED");
      } catch (itemErr) {
        console.error(
          "❌ ITEM PROCESS ERROR:",
          itemErr
        );
      }
    }

    /* ================= ITEM CHECK ================= */
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

    /* ================= TOTALS ================= */
    const subtotal = round(
      items.reduce(
        (sum, item) => sum + item.baseAmount,
        0
      )
    );

    const totalCGST = round(
      items.reduce(
        (sum, item) => sum + item.cgst,
        0
      )
    );

    const totalSGST = round(
      items.reduce(
        (sum, item) => sum + item.sgst,
        0
      )
    );

    const totalIGST = round(
      items.reduce(
        (sum, item) => sum + item.igst,
        0
      )
    );

    const totalGST = round(
      totalCGST + totalSGST + totalIGST
    );

    const grandTotal = round(
      subtotal + totalGST
    );

    console.log("💰 SUBTOTAL:", subtotal);
    console.log("🧾 GST:", totalGST);
    console.log("💰 GRAND TOTAL:", grandTotal);

    /* ================= ORDER CREATE ================= */
    let order = null;

    let retries = 3;

    while (retries > 0) {
      try {
        const orderId = generateSafeOrderId();

        console.log(
          "🆔 GENERATED ORDER ID:",
          orderId
        );

        order = await Order.create({
          orderId,

          items,

          amount: grandTotal,

          address: {
            name: address?.name || "",

            phone: address?.phone || "",

            email:
              address?.email || email || "",

            address: address?.address || "",

            city: address?.city || "",

            state: address?.state || "",

            pincode:
              address?.pincode || "",

            gstNumber:
              address?.gstNumber || "",

            gstType:
              address?.gstType || "B2C",
          },

          billing: {
            currency: "INR",

            subtotal,

            discount: 0,

            taxableAmount: subtotal,

            cgst: totalCGST,

            sgst: totalSGST,

            igst: totalIGST,

            totalGST,

            roundOff: 0,

            grandTotal,

            locked: true,
          },

          payment: {
            method: paymentMethod || "UNKNOWN",

            status: "PENDING",

            amountPaid: 0,

            logs: [
              {
                status: "PENDING",

                message: "Order initiated",

                at: new Date(),
              },
            ],
          },

          status:
            paymentMethod === "COD"
              ? "PROCESSING"
              : "PENDING_PAYMENT",

          warehouse: {
            status: "NEW",
          },

          auditLogs: [
            {
              action: "ORDER_CREATED",

              by: "SYSTEM",

              meta: {
                paymentMethod,
              },

              at: new Date(),
            },
          ],
        });

        console.log(
          "✅ ORDER CREATED:",
          order.orderId
        );

        break;
      } catch (orderErr) {
        console.error(
          "❌ ORDER CREATE ERROR:"
        );

        console.error(orderErr);

        /* ================= DUPLICATE ================= */
        if (orderErr?.code === 11000) {
          console.log(
            "⚠️ DUPLICATE ORDER ID - RETRYING"
          );

          retries--;

          continue;
        }

        throw orderErr;
      }
    }

    if (!order) {
      throw new Error(
        "Order creation failed after retries"
      );
    }

    /* ================= RAZORPAY ================= */
    let razorpayOrder = null;

    if (paymentMethod === "RAZORPAY") {
      console.log(
        "💳 CREATING RAZORPAY ORDER"
      );

      const Razorpay = (await import("razorpay"))
        .default;

      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,

        key_secret:
          process.env.RAZORPAY_SECRET,
      });

      razorpayOrder =
        await rzp.orders.create({
          amount: Math.round(
            grandTotal * 100
          ),

          currency: "INR",

          receipt: order.orderId,
        });

      console.log(
        "✅ RAZORPAY ORDER:",
        razorpayOrder.id
      );

      /* SAVE RAZORPAY ORDER ID */
      await Order.findByIdAndUpdate(order._id, {
        $set: {
          "payment.razorpay_order_id":
            razorpayOrder.id,
        },
      });
    }

    /* ================= SUCCESS ================= */
    console.log("\n==============================");
    console.log("🎉 ORDER SUCCESS");
    console.log("==============================");

    console.log("🆔 ORDER:", order.orderId);

    return NextResponse.json({
      success: true,

      orderId: order.orderId,

      amount: grandTotal,

      razorpayOrder,
    });
  } catch (err) {
    console.error("\n==============================");
    console.error("🔥 FULL ORDER ERROR");
    console.error("==============================");

    console.error(err);

    return NextResponse.json(
      {
        success: false,

        message:
          err?.message || "Unknown error",

        name: err?.name || null,

        code: err?.code || null,

        errors: err?.errors || null,

        stack:
          process.env.NODE_ENV ===
          "development"
            ? err?.stack
            : null,
      },
      { status: 500 }
    );
  }
}
