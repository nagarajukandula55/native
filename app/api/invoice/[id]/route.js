export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

import { buildInvoiceData } from "@/lib/invoice/buildInvoiceData";
import { renderInvoicePDF } from "@/lib/invoice/pdfTemplate";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findOne({
      orderId: params.id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const company = await CompanySettings.findOne().lean();

    const data = buildInvoiceData(order);

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks = [];

    doc.on("data", (c) => chunks.push(c));

    renderInvoicePDF(doc, data, company);

    doc.end();

    const buffer = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${order.orderId}.pdf`,
      },
    });
  } catch (err) {
    console.error("INVOICE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to generate invoice",
      },
      { status: 500 }
    );
  }
}
