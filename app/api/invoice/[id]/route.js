// app/api/invoice/[id]/route.js

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

import { generateInvoiceNumber } from "@/lib/invoiceNumber";
import { buildInvoicePDF } from "@/lib/invoice/invoice.engine";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id }).lean();
    if (!order)
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });

    const company = await CompanySettings.findOne().lean();
    if (!company)
      return NextResponse.json({ success: false, message: "Company missing" }, { status: 500 });

    /* ================= INVOICE NUMBER ================= */
    let invoiceNumber = order.invoice?.invoiceNumber;

    if (!invoiceNumber) {
      const count = await Order.countDocuments({
        "invoice.invoiceNumber": { $exists: true },
      });

      invoiceNumber = generateInvoiceNumber(count);

      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            "invoice.invoiceNumber": invoiceNumber,
            "invoice.generatedAt": new Date(),
            "billing.locked": true,
          },
        }
      );
    }

    const pdfBuffer = await buildInvoicePDF({
      order,
      company,
      invoiceNumber,
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${invoiceNumber}.pdf`,
      },
    });
  } catch (err) {
    console.log("INVOICE ERROR:", err);

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
