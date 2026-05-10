export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";
import { buildInvoiceHTML } from "@/lib/invoice/buildInvoiceHTML";

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

    const html = buildInvoiceHTML({
      companyName: company?.companyName,
      gstin: company?.gstin,
      invoiceNumber: order.invoice?.invoiceNumber || order.orderId,
      customer: order.address,
      items: order.items.map((i) => ({
        name: i.name,
        hsn: i.snapshot?.hsn || "NA",
        qty: i.qty,
        rate: i.price,
        gstPercent: i.gstPercent,
        total: i.total,
      })),
      subtotal: order.billing?.subtotal,
      cgst: order.billing?.cgst,
      sgst: order.billing?.sgst,
      igst: order.billing?.igst,
      grandTotal: order.billing?.grandTotal,
    });

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
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
        message: err.message || "Invoice generation failed",
      },
      { status: 500 }
    );
  }
}
