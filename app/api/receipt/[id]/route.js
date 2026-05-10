export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

import { buildReceiptData } from "@/lib/receipt/buildReceiptData";
import { renderReceiptPDF } from "@/lib/receipt/pdfReceiptTemplate";

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

    const data = buildReceiptData(order);

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks = [];

    doc.on("data", (c) => chunks.push(c));

    renderReceiptPDF(doc, data, company);

    doc.end();

    const buffer = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=RECEIPT-${order.orderId}.pdf`,
      },
    });
  } catch (err) {
    console.error("RECEIPT ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to generate receipt",
      },
      { status: 500 }
    );
  }
}
