export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/db";

import Product from "@/models/Product";
import Order from "@/models/Order";

/* ================= ROUND ================= */
const round = (n) =>
  Math.round(Number(n || 0) * 100) / 100;

/* ================= ORDER ID ================= */
function generateSafeOrderId() {
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `NA-${Date.now()}-${random}`;
}

/* ================= API ================= */
export async function POST(req) {

  console.log("\n==================================");
  console.log("🔥 ORDER API START");
  console.log("==================================");

  try {

    /* ================= STEP 1 ================= */
    console.log("1️⃣ CONNECTING DB");

    await dbConnect();

    console.log("✅ DB CONNECTED");

    /* ================= STEP 2 ================= */
    console.log("2️⃣ READING BODY");

    let body = {};

    try {
      body = await req.json();
      console.log("✅ BODY READ SUCCESS");
    } catch (jsonErr) {

      console.log("❌ JSON PARSE FAILED");

      return NextResponse.json(
        {
          success: false,
          step: "BODY_PARSE",
          error: String(jsonErr),
        },
        { status: 500 }
      );
    }

    /* ================= SAFE BODY LOG ================= */
    console.log("📦 BODY RECEIVED");

    let {
      cart = [],
      address = {},
      paymentMethod = "UPI",
      email = "",
    } = body;

    /* ================= STEP 3 ================= */
    console.log("3️⃣ VALIDATING CART");

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

    console.log("✅ CART VALID");
    console.log("🛒 ITEMS:", cart.length);

    /* ================= BUILD ITEMS ================= */
    const items = [];

    for (const item of cart) {

      try {

        console.log("\n-----------------------");
        console.log("🔍 PROCESS ITEM");
        console.log("-----------------------");

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

        /* ================= OBJECT ID ================= */
        if (
          mongoose.Types.ObjectId.isValid(productId)
        ) {

          console.log("🔎 FIND OBJECT ID");

          product = await Product.findById(
            productId
          ).lean();
        }

        /* ================= PRODUCT KEY ================= */
        if (
          !product &&
          typeof productId === "string"
        ) {

          console.log("🔎 FIND PRODUCT KEY");

          product = await Product.findOne({
            productKey: productId,
          }).lean();
        }

        if (!product) {

          console.log(
            "❌ PRODUCT NOT FOUND:",
            productId
          );

          continue;
        }

        console.log(
          "✅ PRODUCT:",
          product.name
        );

        /* ================= PRICE ================= */
        const qty = Math.max(
          Number(item.qty || 1),
          1
        );

        const price =
          Number(
            product?.primaryVariant?.sellingPrice
          ) ||
          Number(
            product?.pricing?.sellingPrice
          ) ||
          Number(product?.price) ||
          0;

        console.log("💰 PRICE:", price);

        const gstPercent = Number(
          product?.tax || 0
        );

        const baseAmount = round(price * qty);

        const gstAmount = round(
          (baseAmount * gstPercent) / 100
        );

        const cgst = round(gstAmount / 2);

        const sgst = round(gstAmount / 2);

        const total = round(
          baseAmount + gstAmount
        );

        /* ================= PUSH ITEM ================= */
        items.push({

          productId: product._id,

          productKey:
            product.productKey || "",

          name: product.name || "",

          image:
            product?.images?.[0]?.url ||
            product?.thumbnail ||
            "",

          price,

          qty,

          gstPercent,

          baseAmount,

          discountAmount: 0,

          taxableAmount: baseAmount,

          cgst,

          sgst,

          igst: 0,

          total,

          snapshot: {
            brand: product?.brand || "",

            category:
              product?.category || "",

            hsn: product?.hsn || "",
          },
        });

        console.log("✅ ITEM ADDED");

      } catch (itemErr) {

        console.log("❌ ITEM ERROR");

        console.log(String(itemErr));
      }
    }

    /* ================= STEP 4 ================= */
    console.log("4️⃣ FINAL ITEM CHECK");

    console.log(
      "📦 VALID ITEMS:",
      items.length
    );

    if (!items.length) {

      return NextResponse.json(
        {
          success: false,
          message:
            "No valid products found",
        },
        { status: 400 }
      );
    }

    /* ================= TOTALS ================= */
    const subtotal = round(
      items.reduce(
        (sum, item) =>
          sum + item.baseAmount,
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
      totalCGST +
      totalSGST +
      totalIGST
    );

    const grandTotal = round(
      subtotal + totalGST
    );

    console.log("💰 GRAND TOTAL:", grandTotal);

    /* ================= STEP 5 ================= */
    console.log("5️⃣ CREATING ORDER");

    let order = null;

    let retries = 3;

    while (retries > 0) {

      try {

        const orderId =
          generateSafeOrderId();

        console.log(
          "🆔 ORDER ID:",
          orderId
        );

        order = await Order.create({

          orderId,

          amount: grandTotal,

          items,

          address: {

            name:
              address?.name || "",

            phone:
              address?.phone || "",

            email:
              address?.email ||
              email ||
              "",

            address:
              address?.address || "",

            city:
              address?.city || "",

            state:
              address?.state || "",

            pincode:
              address?.pincode || "",

            gstNumber:
              address?.gstNumber || "",

            gstType:
              address?.gstType ||
              "B2C",
          },

          billing: {

            currency: "INR",

            subtotal,

            discount: 0,

            taxableAmount:
              subtotal,

            cgst: totalCGST,

            sgst: totalSGST,

            igst: totalIGST,

            totalGST,

            roundOff: 0,

            grandTotal,

            locked: true,
          },

          payment: {

            method:
              paymentMethod ||
              "UNKNOWN",

            status: "PENDING",

            amountPaid: 0,

            logs: [
              {
                status: "PENDING",

                message:
                  "Order initiated",

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
              action:
                "ORDER_CREATED",

              by: "SYSTEM",

              meta: {
                paymentMethod,
              },

              at: new Date(),
            },
          ],
        });

        console.log(
          "✅ ORDER SAVED:",
          order.orderId
        );

        break;

      } catch (saveErr) {

        console.log("❌ SAVE ERROR");

        console.log(String(saveErr));

        console.log(saveErr);

        if (saveErr?.code === 11000) {

          console.log(
            "⚠️ DUPLICATE ORDER ID"
          );

          retries--;

          continue;
        }

        return NextResponse.json(
          {
            success: false,

            step: "ORDER_CREATE",

            message: String(saveErr),

            error:
              saveErr?.message ||
              "SAVE FAILED",

            name:
              saveErr?.name || null,

            code:
              saveErr?.code || null,

            errors:
              saveErr?.errors || null,
          },
          { status: 500 }
        );
      }
    }

    if (!order) {

      return NextResponse.json(
        {
          success: false,
          step: "ORDER_NULL",
          message:
            "Order not created",
        },
        { status: 500 }
      );
    }

/* ================= RAZORPAY ================= */

let razorpayOrder = null;

if (paymentMethod === "RAZORPAY") {

  try {

    console.log("💳 STARTING RAZORPAY");

    console.log(
      "KEY:",
      process.env.RAZORPAY_KEY_ID
        ? "FOUND"
        : "MISSING"
    );

    console.log(
      "SECRET:",
      process.env.RAZORPAY_SECRET
        ? "FOUND"
        : "MISSING"
    );

    const Razorpay =
      (await import("razorpay")).default;

    console.log("✅ RAZORPAY IMPORT OK");

    const rzp = new Razorpay({

      key_id:
        process.env.RAZORPAY_KEY_ID,

      key_secret:
        process.env.RAZORPAY_SECRET,
    });

    console.log("✅ INSTANCE CREATED");

    console.log("💰 AMOUNT:", grandTotal);

    console.log(
      "🧾 RECEIPT:",
      order.orderId
    );

    razorpayOrder =
      await rzp.orders.create({

        amount: Math.round(
          grandTotal * 100
        ),

        currency: "INR",

        receipt: order.orderId.substring(0, 40),
      });

    console.log(
      "✅ RAZORPAY SUCCESS"
    );

    console.log(razorpayOrder);

    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          "payment.razorpay_order_id":
            razorpayOrder.id,
        },
      }
    );

  } catch (rzpErr) {

    console.log(
      "❌ RAZORPAY FULL ERROR"
    );

    console.log(rzpErr);

    console.log(
      JSON.stringify(rzpErr, null, 2)
    );

    return NextResponse.json(
      {
        success: false,

        step: "RAZORPAY",

        message:
          rzpErr?.error?.description ||
          rzpErr?.message ||
          "Razorpay failed",

        full: JSON.stringify(
          rzpErr,
          null,
          2
        ),
      },
      { status: 500 }
    );
  }
}

    /* ================= SUCCESS ================= */
    console.log("\n==================================");
    console.log("🎉 ORDER SUCCESS");
    console.log("==================================");

    return NextResponse.json({

      success: true,

      orderId: order.orderId,

      amount: grandTotal,

      razorpayOrder,
    });

  } catch (err) {

    console.log("\n==================================");
    console.log("💥 FINAL CRASH");
    console.log("==================================");

    console.log(String(err));

    return NextResponse.json(
      {
        success: false,

        step: "FINAL_CATCH",

        message: String(err),
      },
      { status: 500 }
    );
  }
}
