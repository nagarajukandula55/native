import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateReceiptNumber } from "@/lib/receipt";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { generateInvoiceHTML } from "@/lib/invoice";

export async function POST() {
  try {
    await dbConnect();

    /* ================= FETCH ALL PAID ORDERS ================= */
    const orders = await Order.find({
      status: "PAID",
    });

    let updated = 0;

    for (const order of orders) {
      let changed = false;

      /* ================= RECEIPT GENERATION ================= */
      if (!order.receipt?.receiptNumber) {
        const receiptNumber = await generateReceiptNumber();

        order.receipt = {
          receiptNumber,
          generatedAt: new Date(),
          paymentReference:
            order.payment?.razorpay_payment_id || "MANUAL",
          amountPaid: order.amount,
        };

        changed = true;
      }

      /* ================= INVOICE GENERATION ================= */
      if (!order.invoice?.invoiceNumber) {
        const invoiceNumber = await generateInvoiceNumber(order.createdAt);

        order.invoice = {
          invoiceNumber,
          generatedAt: new Date(),
        };

        /* Optional cached HTML */
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
      message: "Backfill completed",
      totalOrders: orders.length,
      updated,
    });

  } catch (err) {
    console.error("BACKFILL ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Backfill failed" },
      { status: 500 }
    );
  }
}
