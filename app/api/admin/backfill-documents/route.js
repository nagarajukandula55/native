import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { generateInvoiceHTML } from "@/lib/invoice";

/* ================= SAFE RECEIPT SEQUENCE ================= */
function createReceiptGenerator() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const base = `NARCP${yyyy}${mm}${dd}`;
  let counter = 1;

  return () => {
    const seq = String(counter++).padStart(3, "0");
    return `${base}${seq}`;
  };
}

export async function POST() {
  try {
    await dbConnect();

    /* ================= SORT ORDERS (IMPORTANT) ================= */
    const orders = await Order.find({
      status: "PAID",
    }).sort({ createdAt: 1 }); // FIX ORDERING

    const generateReceipt = createReceiptGenerator();

    let updated = 0;

    for (const order of orders) {
      let changed = false;

      /* ================= RECEIPT ================= */
      if (!order.receipt?.receiptNumber) {
        order.receipt = {
          receiptNumber: generateReceipt(),
          generatedAt: order.createdAt || new Date(),
          paymentReference:
            order.payment?.razorpay_payment_id || "MANUAL",
          amountPaid: order.amount,
        };

        changed = true;
      }

      /* ================= INVOICE ================= */
      if (!order.invoice?.invoiceNumber) {
        const invoiceNumber = await generateInvoiceNumber(
          order.createdAt
        );

        order.invoice = {
          invoiceNumber,
          generatedAt: order.createdAt || new Date(),
        };

        order.invoiceHTML = generateInvoiceHTML(order.toObject());

        changed = true;
      }

      if (changed) {
        await order.save();
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Backfill completed safely",
      totalOrders: orders.length,
      updated,
    });

  } catch (err) {
    console.error("BACKFILL ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Backfill failed",
      },
      { status: 500 }
    );
  }
}
