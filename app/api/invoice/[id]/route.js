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

/* ================= CONFIG ================= */

const PAGE_H = 842;
const FOOTER_Y = 780;

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const safe = (v) => (v ? String(v) : "-");

const hashInvoice = (order, inv) =>
  crypto
    .createHash("sha256")
    .update(`${order.orderId}-${inv}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 20)
    .toUpperCase();

const qr = async (data) =>
  QRCode.toBuffer(JSON.stringify(data), {
    type: "png",
    errorCorrectionLevel: "H",
    scale: 5,
  });

/* ================= API ================= */

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findOne({ orderId: params.id }).lean();
    const company = await CompanySettings.findOne().lean();

    if (!order || !company) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
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
    const hash = hashInvoice(order, invoiceNumber);

    const qrBuffer = await qr({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order.billing?.grandTotal,
      hash,
    });

    /* ================= PDF ================= */

    const pdf = createPDF();
    const chunks = [];

    pdf.on("data", (c) => chunks.push(c));

    const bufferPromise = new Promise((res) =>
      pdf.on("end", () => res(Buffer.concat(chunks)))
    );

    let y = 40;

    const check = (h = 40) => {
      if (y + h > FOOTER_Y - 120) {
        pdf.addPage();
        y = 40;
      }
    };

    /* ================= HEADER ================= */

    const logo = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    if (logo && fs.existsSync(logo)) {
      pdf.image(logo, 40, y, { width: 55 });
    }

    pdf.font("BOLD").fontSize(16).text(company.companyName, 110, y);

    pdf
      .font("REG")
      .fontSize(9)
      .text(company.tagline || "Eat Healthy, Stay Healthy", 110, y + 18);

    pdf.font("BOLD").text("TAX INVOICE", 420, y);

    pdf.font("REG").text(invoiceNumber, 420, y + 18);

    y += 60;
    pdf.moveTo(40, y).lineTo(555, y).stroke();
    y += 20;

    /* ================= ADDRESS BLOCK ================= */

    const block = (x, title, data) => {
      check(90);

      pdf.font("BOLD").fontSize(10).text(title, x, y);

      let yy = y + 16;

      data.forEach((d) => {
        pdf.font("REG").fontSize(9).text(safe(d), x, yy);
        yy += 13;
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

    y += 110;

    pdf.moveTo(40, y).lineTo(555, y).stroke();
    y += 15;

    /* ================= ITEMS ================= */

    const items = order.items || [];

    const headers = ["#", "Item", "Qty", "Rate", "GST", "Total"];
    const xs = [45, 70, 260, 320, 390, 480];

    check(40);

    pdf.rect(40, y, 515, 22).fill("#111827");

    pdf.font("BOLD").fontSize(9);

    headers.forEach((h, i) => {
      pdf.fillColor("#fff").text(h, xs[i], y + 6);
    });

    y += 30;

    let itemTotal = 0;

    pdf.fillColor("#000");

    items.forEach((it, i) => {
      check(25);

      itemTotal += it?.total || 0;

      pdf.rect(40, y - 2, 515, 22).stroke("#e5e7eb");

      const row = [
        i + 1,
        it?.name,
        it?.qty,
        money(it?.price),
        `${it?.gstPercent || 0}%`,
        money(it?.total),
      ];

      pdf.font("REG").fontSize(9);

      row.forEach((v, j) => pdf.text(String(v), xs[j], y + 4));

      y += 24;
    });

    y += 10;

    pdf.font("BOLD").text(`Items Total: ${money(itemTotal)}`, 40, y);

    y += 40;

    /* ================= SUMMARY ================= */

    const sx = 330;
    let sy = y;

    const summary = gst;

    const rows = [
      ["Taxable", summary.taxable],
      ["CGST", summary.cgst],
      ["SGST", summary.sgst],
      ["IGST", summary.igst],
      ["Discount", order.billing?.discount],
      ["Grand Total", order.billing?.grandTotal],
    ];

    pdf
      .roundedRect(sx, sy, 230, 150)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    pdf.font("BOLD").text("GST Summary", sx + 15, sy + 12);

    sy += 30;

    rows.forEach(([k, v]) => {
      pdf.font("REG").fontSize(9);
      pdf.text(k, sx + 15, sy);
      pdf.text(money(v), sx + 150, sy);
      sy += 18;
    });

    /* ================= QR + SIGNATURE ================= */

    const baseY = sy + 40;

    pdf.image(qrBuffer, 40, baseY, { width: 70 });

    const sign = path.join(process.cwd(), "public/signature.png");

    pdf.font("BOLD").text(`For ${company.companyName}`, 150, baseY);

    if (fs.existsSync(sign)) {
      pdf.image(sign, 150, baseY + 15, { width: 90 });
    }

    /* ================= FOOTER (LOCKED) ================= */

    pdf.font("REG").fontSize(8).fillColor("#6b7280");

    pdf.text(
      "This is a system generated invoice and is valid without signature verification.",
      40,
      FOOTER_Y,
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
