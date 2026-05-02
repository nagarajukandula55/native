import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { generateInvoiceHTML } from "@/lib/invoice";

/* ================= SAFE RECEIPT GENERATOR ================= */
async function generateSafeReceipt(order, index) {
  const date = new Date(order.createdAt || Date.now());

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const base = `NARCP${yyyy}${mm}${dd}`;

  const seq = String(index + 1).padStart(3, "0");

  return `${base}${seq}`;
}

export async function POST() {
  try {
    await dbConnect();

    /* ================= FETCH ONLY VALID ORDERS ================= */
    const orders = await Order.find({
      status: "PAID",
    }).sort({ createdAt: 1 });

    let updated = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      let changed = false;

      /* ================= RECEIPT (SAFE + IDEMPOTENT) ================= */
      if (!order.receipt?.receiptNumber) {
        order.receipt = {
          receiptNumber: await generateSafeReceipt(order, i),
          generatedAt: order.createdAt || new Date(),
          paymentReference:
            order.payment?.razorpay_payment_id || "MANUAL",
          amountPaid: order.amount,
        };

        changed = true;
      }

      /* ================= INVOICE ================= */
      if (!order.invoice?.invoiceNumber) {
        const invoiceNumber = await generateInvoiceNumber(order.createdAt);

        order.invoice = {
          invoiceNumber,
          generatedAt: order.createdAt || new Date(),
        };

        order.invoiceHTML = generateInvoiceHTML(order.toObject());

        changed = true;
      }

      /* ================= SAVE ONLY IF NEEDED ================= */
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
