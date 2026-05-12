export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";
import { createPDF } from "@/lib/pdfSetup";
import { calculateGSTSummary } from "@/lib/gst";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";

import fs from "fs";
import path from "path";
import crypto from "crypto";
import QRCode from "qrcode";

/* ================= CONSTANTS ================= */

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/* ================= HELPERS ================= */

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const safe = (v) => (v ? String(v) : "-");

const hashInvoice = (order, invoiceNumber) =>
  crypto
    .createHash("sha256")
    .update(`${order.orderId}-${invoiceNumber}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 20)
    .toUpperCase();

const generateQR = async (payload) =>
  QRCode.toBuffer(JSON.stringify(payload), {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 1,
    scale: 6,
  });

/* ================= API ================= */

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id }).lean();
    const company = await CompanySettings.findOne().lean();

    if (!order || !company) {
      return NextResponse.json(
        { success: false, message: "Missing Data" },
        { status: 404 }
      );
    }

    /* ================= INVOICE ================= */

    let invoiceNumber = order?.invoice?.invoiceNumber;

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

    const gst = calculateGSTSummary(order, company.state || "");
    const invoiceHash = hashInvoice(order, invoiceNumber);

    const qrBuffer = await generateQR({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order?.billing?.grandTotal || 0,
      hash: invoiceHash,
    });

    /* ================= PDF ================= */

    const pdf = createPDF();
    const chunks = [];

    pdf.on("data", (c) => chunks.push(c));

    const bufferPromise = new Promise((res) =>
      pdf.on("end", () => res(Buffer.concat(chunks)))
    );

    let y = 40;

    const line = () => {
      pdf
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .moveTo(40, y)
        .lineTo(555, y)
        .stroke();
    };

    /* ================= HEADER ROW (ERP STRIP) ================= */

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    // LEFT: LOGO
    if (logoPath && fs.existsSync(logoPath)) {
      pdf.image(logoPath, 40, y, { width: 60 });
    }

    // CENTER: COMPANY
    pdf.font("Helvetica-Bold").fontSize(16).text(company.companyName, 110, y);

    pdf.font("Helvetica").fontSize(9).text(
      company.tagline || "Eat Healthy, Stay Healthy",
      110,
      y + 18
    );

    // RIGHT: INVOICE
    pdf
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("TAX INVOICE", 420, y);

    pdf
      .font("Helvetica")
      .fontSize(9)
      .text(`No: ${invoiceNumber}`, 420, y + 18);

    y += 60;
    line();
    y += 15;

    /* ================= BILL / SHIP / PAYMENT ================= */

    const block = (x, title, data) => {
      pdf.font("Helvetica-Bold").fontSize(10).text(title, x, y);

      let yy = y + 15;

      data.forEach((d) => {
        pdf.font("Helvetica").fontSize(9).text(safe(d), x, yy);
        yy += 14;
      });
    };

    block(40, "Bill To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
    ]);

    block(200, "Ship To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
    ]);

    block(360, "Payment", [
      order.payment?.method,
      order.payment?.status,
      money(order.payment?.amountPaid),
      order.payment?.transactionId,
    ]);

    y += 95;
    line();
    y += 15;

    /* ================= ITEMS TABLE ================= */

    const items = order.items || [];

    const headers = ["#", "Item", "Qty", "Rate", "GST", "Total"];
    const xs = [45, 70, 260, 320, 380, 470];

    pdf.font("Helvetica-Bold").fontSize(9);

    pdf.rect(40, y, 515, 20).fill("#111827");

    headers.forEach((h, i) => {
      pdf.fillColor("#fff").text(h, xs[i], y + 6);
    });

    y += 25;

    let itemTotal = 0;

    pdf.fillColor("#000");

    items.forEach((it, i) => {
      const total = it?.total || 0;
      itemTotal += total;

      pdf.rect(40, y - 3, 515, 22).stroke("#e5e7eb");

      const row = [
        i + 1,
        it?.name,
        it?.qty,
        money(it?.price),
        `${it?.gstPercent || 0}%`,
        money(total),
      ];

      pdf.font("Helvetica").fontSize(9);

      row.forEach((v, j) =>
        pdf.text(String(v), xs[j], y + 3)
      );

      y += 24;
    });

    y += 10;
    pdf.font("Helvetica-Bold").text(`Items: ${items.length}`, 40, y);
    pdf.text(`Total: ${money(itemTotal)}`, 450, y);

    y += 30;

    /* ================= SUMMARY ================= */

    const summary = calculateGSTSummary(order, company.state || "");

    const sx = 330;
    let sy = y;

    pdf.roundedRect(sx, sy, 230, 140).fillAndStroke("#f9fafb", "#e5e7eb");

    pdf.font("Helvetica-Bold").text("GST Summary", sx + 15, sy + 12);

    sy += 30;

    [
      ["Taxable", summary.taxable],
      ["CGST", summary.cgst],
      ["SGST", summary.sgst],
      ["IGST", summary.igst],
      ["Discount", order.billing?.discount],
      ["Grand Total", order.billing?.grandTotal],
    ].forEach(([k, v]) => {
      pdf.font("Helvetica").fontSize(9);
      pdf.text(k, sx + 15, sy);
      pdf.text(money(v), sx + 140, sy);
      sy += 18;
    });

    /* ================= QR + SIGNATURE ROW ================= */

    const baseY = sy + 30;

    // QR LEFT
    pdf.image(qrBuffer, 40, baseY, { width: 70 });

    // SIGN CENTER
    const signPath = path.join(process.cwd(), "public/signature.png");

    pdf.font("Helvetica-Bold").text(
      `For ${company.companyName}`,
      150,
      baseY
    );

    if (fs.existsSync(signPath)) {
      pdf.image(signPath, 150, baseY + 15, { width: 90 });
    }

    /* ================= FOOTER (FIXED INSIDE PAGE) ================= */

    const footerY = PAGE_HEIGHT - 60;

    pdf
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "This is a system generated invoice. No physical signature required.",
        40,
        footerY,
        { width: 515, align: "center" }
      );

    pdf.end();

    const buffer = await bufferPromise;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${invoiceNumber}.pdf`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
