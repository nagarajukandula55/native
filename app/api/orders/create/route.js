export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/db";

import Product from "@/models/Product";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

import { sendTelegramMessage } from "@/lib/telegram";
import { sendOrderPlacedEmail } from "@/lib/email";

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

/* ================= INVOICE NUMBER ================= */
async function generateInvoiceNumber() {

  const company =
    await CompanySettings.findOne().lean();

  const prefix =
    company?.invoicePrefix || "NA";

  const now = new Date();

  const yy = String(
    now.getFullYear()
  ).slice(-2);

  const mm = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const dd = String(
    now.getDate()
  ).padStart(2, "0");

  const dateCode =
    `${yy}${mm}${dd}`;

  /* ================= DAILY COUNT ================= */

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const count =
    await Order.countDocuments({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

  const sequence = String(
    count + 1
  ).padStart(6, "0");

  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `${prefix}-${dateCode}-${sequence}-${random}`;
}

/* ================= TELEGRAM FORMAT ================= */

function buildTelegramMessage({
  order,
  grandTotal,
  paymentMethod,
}) {

  return `
🛒 NEW ORDER RECEIVED

━━━━━━━━━━━━━━━

📦 Order ID:
${order.orderId}

👤 Customer:
${order.address?.name || "-"}

📞 Phone:
${order.address?.phone || "-"}

📧 Email:
${order.address?.email || "-"}

💰 Amount:
₹${grandTotal}

💳 Payment:
${paymentMethod}

📍 City:
${order.address?.city || "-"}

🧾 GST:
${order.address?.gstNumber || "N/A"}

📦 Items:
${order.items
  .map(
    (i) =>
      `• ${i.name} x ${i.qty}`
  )
  .join("\n")}

━━━━━━━━━━━━━━━

⚡ Status:
${order.status}
`;
}

/* ================= API ================= */

export async function POST(req) {

  console.log("\n==================================");
  console.log("🔥 ORDER API START");
  console.log("==================================");

  try {

    /* ================= DB ================= */

    console.log("1️⃣ CONNECTING DB");

    await dbConnect();

    console.log("✅ DB CONNECTED");

    /* ================= BODY ================= */

    console.log("2️⃣ READING BODY");

    let body = {};

    try {

      body = await req.json();

      console.log(
        "✅ BODY READ SUCCESS"
      );

    } catch (jsonErr) {

      console.log(
        "❌ JSON PARSE FAILED"
      );

      return NextResponse.json(
        {
          success: false,
          step: "BODY_PARSE",
          error: String(jsonErr),
        },
        { status: 500 }
      );
    }

    /* ================= BODY DATA ================= */

    let {
      cart = [],
      address = {},
      paymentMethod = "UPI",
      email = "",
    } = body;

    /* ================= VALIDATE CART ================= */

    console.log("3️⃣ VALIDATING CART");

    if (
      !Array.isArray(cart) ||
      cart.length === 0
    ) {

      return NextResponse.json(
        {
          success: false,
          message: "Cart empty",
        },
        { status: 400 }
      );
    }

    console.log(
      "✅ CART VALID"
    );

    /* ================= BUILD ITEMS ================= */

    const items = [];

    for (const item of cart) {

      try {

        const productId =
          item.productId;

        if (!productId) {

          console.log(
            "❌ PRODUCT ID MISSING"
          );

          continue;
        }

        let product = null;

        /* ================= OBJECT ID ================= */

        if (
          mongoose.Types.ObjectId.isValid(
            productId
          )
        ) {

          product =
            await Product.findById(
              productId
            ).lean();
        }

        /* ================= PRODUCT KEY ================= */

        if (
          !product &&
          typeof productId === "string"
        ) {

          product =
            await Product.findOne({
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

        /* ================= QTY ================= */

        const qty = Math.max(
          Number(item.qty || 1),
          1
        );

        /* ================= PRICE ================= */

        const price =
          Number(
            product?.primaryVariant
              ?.sellingPrice
          ) ||
          Number(
            product?.pricing
              ?.sellingPrice
          ) ||
          Number(product?.price) ||
          0;

        const gstPercent = Number(
          product?.tax || 0
        );

        /* ================= GST MODE ================= */

        const isInterState =
          address?.state &&
          address.state !==
            "Andhra Pradesh";

        /* ================= AMOUNTS ================= */

        const baseAmount =
          round(price * qty);

        const gstAmount =
          round(
            (baseAmount *
              gstPercent) /
              100
          );

        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (isInterState) {

          igst = gstAmount;

        } else {

          cgst =
            round(gstAmount / 2);

          sgst =
            round(gstAmount / 2);
        }

        const total =
          round(
            baseAmount +
              gstAmount
          );

        /* ================= ITEM ================= */

        items.push({

          productId:
            product._id,

          productKey:
            product.productKey || "",

          name:
            product.name || "",

          image:
            product?.images?.[0]?.url ||
            product?.thumbnail ||
            "",

          price,

          qty,

          gstPercent,

          baseAmount,

          discountAmount: 0,

          taxableAmount:
            baseAmount,

          cgst,

          sgst,

          igst,

          total,

          snapshot: {

            brand:
              product?.brand || "",

            category:
              product?.category || "",

            hsn:
              product?.hsn || "",
          },
        });

      } catch (itemErr) {

        console.log(
          "❌ ITEM ERROR"
        );

        console.log(
          String(itemErr)
        );
      }
    }

    /* ================= FINAL CHECK ================= */

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

    const subtotal =
      round(
        items.reduce(
          (sum, item) =>
            sum +
            item.baseAmount,
          0
        )
      );

    const totalCGST =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.cgst,
          0
        )
      );

    const totalSGST =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.sgst,
          0
        )
      );

    const totalIGST =
      round(
        items.reduce(
          (sum, item) =>
            sum + item.igst,
          0
        )
      );

    const totalGST =
      round(
        totalCGST +
          totalSGST +
          totalIGST
      );

    const grandTotal =
      round(
        subtotal +
          totalGST
      );

    console.log(
      "💰 GRAND TOTAL:",
      grandTotal
    );

    /* ================= IDS ================= */

    const invoiceNumber =
      await generateInvoiceNumber();

    /* ================= CREATE ORDER ================= */

    let order = null;

    let retries = 3;

    while (retries > 0) {

      try {

        const orderId =
          generateSafeOrderId();

        order =
          await Order.create({

            orderId,

            amount:
              grandTotal,

            items,

            /* ================= ADDRESS ================= */

            address: {

              name:
                address?.name ||
                "",

              phone:
                address?.phone ||
                "",

              email:
                address?.email ||
                email ||
                "",

              address:
                address?.address ||
                "",

              city:
                address?.city ||
                "",

              state:
                address?.state ||
                "",

              pincode:
                address?.pincode ||
                "",

              gstNumber:
                address?.gstNumber ||
                "",

              gstType:
                address?.gstNumber
                  ? "B2B"
                  : "B2C",

              placeOfSupply:
                address?.state ||
                "",
            },

            /* ================= BILLING ================= */

            billing: {

              currency: "INR",

              subtotal,

              discount: 0,

              taxableAmount:
                subtotal,

              cgst:
                totalCGST,

              sgst:
                totalSGST,

              igst:
                totalIGST,

              totalGST,

              roundOff: 0,

              grandTotal,

              locked: true,
            },

            /* ================= GST ================= */

            gstDetails: {

              isInterState:
                totalIGST > 0,

              gstType:
                address?.gstNumber
                  ? "B2B"
                  : "B2C",

              placeOfSupply:
                address?.state ||
                "",

              gstin:
                address?.gstNumber ||
                "",
            },

            /* ================= PAYMENT ================= */

            payment: {

              method:
                paymentMethod ||
                "UNKNOWN",

              status:
                "PENDING",

              amountPaid: 0,

              logs: [

                {
                  status:
                    "PENDING",

                  message:
                    "Order initiated",

                  at:
                    new Date(),
                },
              ],
            },

            /* ================= ORDER STATUS ================= */

            status:
              paymentMethod ===
              "COD"
                ? "PROCESSING"
                : "PENDING_PAYMENT",

            statusTimeline: {

              createdAt:
                new Date(),
            },

            /* ================= SHIPPING ================= */

            shipping: {

              dispatchType:
                "COURIER",

              trackingStatus:
                "ORDER_CREATED",

              pickupScheduled:
                false,
            },

            /* ================= WAREHOUSE ================= */

            warehouse: {

              status:
                "NEW",
            },

            /* ================= INVOICE ================= */

            invoice: {

              invoiceNumber,

              generatedAt:
                new Date(),

              invoiceUrl:
                `/invoice/${orderId}`,
            },

            /* ================= AUDIT ================= */

            auditLogs: [

              {
                action:
                  "ORDER_CREATED",

                by:
                  "SYSTEM",

                meta: {

                  paymentMethod,
                },

                at:
                  new Date(),
              },
            ],
          });

        console.log(
          "✅ ORDER SAVED:",
          order.orderId
        );

        break;

      } catch (saveErr) {

        console.log(
          "❌ SAVE ERROR"
        );

        console.log(saveErr);

        if (
          saveErr?.code ===
          11000
        ) {

          retries--;

          continue;
        }

        return NextResponse.json(
          {
            success: false,

            step:
              "ORDER_CREATE",

            message:
              saveErr?.message ||
              "SAVE FAILED",

            code:
              saveErr?.code ||
              null,
          },
          { status: 500 }
        );
      }
    }

    /* ================= NULL CHECK ================= */

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

    /* ================= TELEGRAM ================= */

    try {

      await sendTelegramMessage(
        buildTelegramMessage({
          order,
          grandTotal,
          paymentMethod,
        })
      );

      console.log(
        "✅ TELEGRAM SENT"
      );

    } catch (telegramErr) {

      console.log(
        "❌ TELEGRAM FAILED"
      );

      console.log(telegramErr);
    }

    /* ================= EMAIL ================= */

    try {

      if (order.address?.email) {

        await sendOrderPlacedEmail({

          to:
            order.address.email,

          order,
        });

        console.log(
          "✅ ORDER EMAIL SENT"
        );
      }

    } catch (emailErr) {

      console.log(
        "❌ EMAIL FAILED"
      );

      console.log(emailErr);
    }

    /* ================= RAZORPAY ================= */

    let razorpayOrder = null;

    if (
      paymentMethod ===
      "RAZORPAY"
    ) {

      try {

        console.log(
          "💳 STARTING RAZORPAY"
        );

        const Razorpay =
          (
            await import(
              "razorpay"
            )
          ).default;

        const rzp =
          new Razorpay({

            key_id:
              process.env
                .RAZORPAY_KEY_ID,

            key_secret:
              process.env
                .RAZORPAY_SECRET,
          });

        razorpayOrder =
          await rzp.orders.create({

            amount:
              Math.round(
                grandTotal *
                  100
              ),

            currency:
              "INR",

            receipt:
              order.orderId.substring(
                0,
                40
              ),
          });

        /* ================= UPDATE ORDER ================= */

        await Order.findByIdAndUpdate(
          order._id,
          {
            $set: {
              "payment.razorpay_order_id":
                razorpayOrder.id,
            },
          }
        );

        console.log(
          "✅ RAZORPAY SUCCESS"
        );

      } catch (rzpErr) {

        console.log(
          "❌ RAZORPAY ERROR"
        );

        console.log(rzpErr);

        return NextResponse.json(
          {
            success: false,

            step:
              "RAZORPAY",

            message:
              rzpErr?.error
                ?.description ||
              rzpErr?.message ||
              "Razorpay failed",

            full:
              JSON.stringify(
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

      orderId:
        order.orderId,

      invoiceNumber:
        order.invoice
          ?.invoiceNumber,

      amount:
        grandTotal,

      razorpayOrder,
    });

  } catch (err) {

    console.log("\n==================================");
    console.log("💥 FINAL CRASH");
    console.log("==================================");

    console.log(err);

    return NextResponse.json(
      {
        success: false,

        step:
          "FINAL_CATCH",

        message:
          err?.message ||
          String(err),
      },
      { status: 500 }
    );
  }
}
