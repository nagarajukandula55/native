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

/* ================= ERP V9 CORE CONFIG ================= */

const PAGE = {
  w: 595,
  h: 842,
  margin: 40,
};

const N = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ================= SAFE TEXT ENGINE ================= */

const safeText = (v) =>
  v === undefined || v === null || v === "" ? "-" : String(v);

/* ❌ FIX FOR ₹ ERROR */
const money = (v) => {
  const n = N(v);
  return `INR ${n.toFixed(2)}`;
};

/* ================= HASH ================= */

const hashInvoice = (order, inv) =>
  crypto
    .createHash("sha256")
    .update(`${order.orderId}-${inv}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 20)
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

    /* ================= INVOICE NUMBER ================= */

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

    /* ================= PDF INIT ================= */

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

    let y = PAGE.h - PAGE.margin;

    const draw = (text, x, yy, size = 10, isBold = false) => {
      page.drawText(safeText(text), {
        x: N(x),
        y: N(yy),
        size,
        font: isBold ? bold : font,
        color: rgb(0, 0, 0),
      });
    };

    const line = (yy) => {
      page.drawLine({
        start: { x: 40, y: N(yy) },
        end: { x: 555, y: N(yy) },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
      });
    };

    const next = (gap = 14) => (y -= gap);

    /* ================= HEADER ================= */

    if (logoImg) {
      page.drawImage(logoImg, {
        x: 40,
        y: y - 40,
        width: 45,
        height: 45,
      });
    }

    draw(company.companyName, 100, y, 16, true);
    draw(company.tagline || "Eat Healthy, Stay Healthy", 100, y - 18, 10);

    draw("TAX INVOICE", 420, y, 12, true);
    draw(invoiceNumber, 420, y - 18, 10);

    next(60);
    line(y);
    next(20);

    /* ================= ADDRESS ================= */

    const block = (title, x, rows) => {
      draw(title, x, y, 11, true);
      let yy = y - 18;

      rows.forEach((r) => {
        draw(r, x, yy, 9);
        yy -= 13;
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

    next(140);

    /* ================= ITEMS ================= */

    draw("# Items", 40, y, 11, true);
    next(18);

    let itemTotal = 0;

    (order.items || []).forEach((it, i) => {
      const total = N(it?.total);
      itemTotal += total;

      draw(
        `${i + 1}. ${it?.name} | Qty:${it?.qty} | Rate:${money(
          it?.price
        )} | GST:${N(it?.gstPercent)}% | Total:${money(total)}`,
        40,
        y,
        9
      );

      next(14);
    });

    draw(`Items Total: ${money(itemTotal)}`, 40, y, 11, true);

    next(30);

    /* ================= SUMMARY ================= */

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
      x: N(sx),
      y: N(sy - 120),
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

    /* ================= QR + SIGN ================= */

    page.drawImage(qrImg, {
      x: 40,
      y: 120,
      width: 70,
      height: 70,
    });

    if (signImg) {
      page.drawImage(signImg, {
        x: 150,
        y: 120,
        width: 90,
        height: 40,
      });
    }

    draw(`For ${company.companyName}`, 150, 100, 10, true);
    draw(`Hash: ${hash}`, 150, 85, 8);

    /* ================= FOOTER ================= */

    draw(
      "This is a system generated invoice and valid without signature verification.",
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
