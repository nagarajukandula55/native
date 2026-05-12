export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";
import { calculateGSTSummary } from "@/lib/gst";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import QRCode from "qrcode";

/* ================= CONFIG ================= */

const PAGE = { w: 595, h: 842, m: 40 };

const N = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safe = (v) => (v ? String(v) : "-");

const money = (v) => `INR ${N(v).toFixed(2)}`;

/* ================= HASH ================= */

const hashInvoice = (order, inv) =>
  crypto
    .createHash("sha256")
    .update(`${order.orderId}-${inv}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 18)
    .toUpperCase();

/* ================= QR ================= */

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

    const gst = calculateGSTSummary(order, company.state || {});
    const hash = hashInvoice(order, invoiceNumber);

    const qrBuffer = await qr({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: N(order.billing?.grandTotal),
      hash,
    });

    /* ================= PDF ================= */

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([PAGE.w, PAGE.h]);

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const qrImg = await pdf.embedPng(qrBuffer);

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    const logoImg =
      logoPath && fs.existsSync(logoPath)
        ? await pdf.embedPng(fs.readFileSync(logoPath))
        : null;

    const signPath = path.join(process.cwd(), "public/signature.png");

    const signImg =
      fs.existsSync(signPath)
        ? await pdf.embedPng(fs.readFileSync(signPath))
        : null;

    /* ================= DRAW ENGINE ================= */

    const draw = (text, x, y, size = 10, isBold = false) => {
      page.drawText(safe(text), {
        x: N(x),
        y: N(y),
        size,
        font: isBold ? bold : font,
        color: rgb(0, 0, 0),
      });
    };

    const line = (y) => {
      page.drawLine({
        start: { x: 40, y: N(y) },
        end: { x: 555, y: N(y) },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
      });
    };

    let y = PAGE.h - PAGE.m;

    /* ================= HEADER GRID ================= */

    // LOGO
    if (logoImg) {
      page.drawImage(logoImg, {
        x: 40,
        y: y - 40,
        width: 45,
        height: 45,
      });
    }

    // COMPANY BLOCK
    draw(company.companyName, 100, y, 16, true);
    draw(
      company.tagline || "Eat Healthy, Stay Healthy",
      100,
      y - 18,
      10
    );

    // TAX INVOICE BOX (FIXED)
    page.drawRectangle({
      x: 400,
      y: y - 25,
      width: 155,
      height: 55,
      color: rgb(0.97, 0.97, 0.97),
    });

    draw("TAX INVOICE", 415, y, 12, true);
    draw(invoiceNumber, 415, y - 18, 10);

    y -= 70;
    line(y);
    y -= 20;

    /* ================= 3-COLUMN INFO CARDS ================= */

    const card = (title, x, rows) => {
      draw(title, x, y, 11, true);
      let yy = y - 16;

      rows.forEach((r) => {
        draw(r, x, yy, 9);
        yy -= 13;
      });
    };

    card(40, "Bill To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
    ]);

    card(200, "Ship To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
    ]);

    card(360, "Payment", [
      order.payment?.method,
      order.payment?.status,
      money(order.payment?.amountPaid),
      order.payment?.transactionId,
    ]);

    y -= 120;

    line(y);
    y -= 20;

    /* ================= ITEM TABLE ================= */

    draw("ITEMS", 40, y, 11, true);
    y -= 20;

    let total = 0;

    (order.items || []).forEach((it, i) => {
      const t = N(it?.total);
      total += t;

      draw(
        `${i + 1}. ${it?.name} | Qty:${it?.qty} | Rate:${money(
          it?.price
        )} | GST:${N(it?.gstPercent)}% | Total:${money(t)}`,
        40,
        y,
        9
      );

      y -= 14;
    });

    draw(`ITEM TOTAL: ${money(total)}`, 40, y - 10, 11, true);

    y -= 40;

    /* ================= SUMMARY PANEL ================= */

    const sx = 330;
    let sy = y;

    const rows = [
      ["Taxable", gst.taxable],
      ["CGST", gst.cgst],
      ["SGST", gst.sgst],
      ["IGST", gst.igst],
      ["Discount", order.billing?.discount],
      ["Grand Total", order.billing?.grandTotal],
    ];

    page.drawRectangle({
      x: sx,
      y: sy - 120,
      width: 230,
      height: 140,
      color: rgb(0.97, 0.97, 0.97),
    });

    draw("GST SUMMARY", sx + 15, sy, 11, true);

    sy -= 22;

    rows.forEach(([k, v]) => {
      draw(k, sx + 15, sy, 9);
      draw(money(v), sx + 150, sy, 9);
      sy -= 14;
    });

    /* ================= QR + SIGN ROW ================= */

    const baseY = 120;

    page.drawImage(qrImg, {
      x: 40,
      y: baseY,
      width: 70,
      height: 70,
    });

    if (signImg) {
      page.drawImage(signImg, {
        x: 140,
        y: baseY,
        width: 90,
        height: 40,
      });
    }

    draw(`For ${company.companyName}`, 140, 105, 10, true);
    draw(`Hash: ${hash}`, 140, 90, 8);

    /* ================= FOOTER ================= */

    draw(
      "This invoice is system generated and valid without signature verification.",
      40,
      30,
      8
    );

    const pdfBytes = await pdf.save();

    return new NextResponse(pdfBytes, {
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
