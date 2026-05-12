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

/* ================= SAFE NUMBER ================= */

const N = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const S = (v) => (v ? String(v) : "-");
const M = (v) => `₹${N(v).toFixed(2)}`;

/* ================= CONSTANTS ================= */

const PAGE = { w: 595, h: 842, m: 40 };
const MIN_Y = 100; // safe bottom threshold

/* ================= HASH ================= */

const hashInvoice = (o, inv) =>
  crypto
    .createHash("sha256")
    .update(`${o.orderId}-${inv}`)
    .digest("hex")
    .slice(0, 16);

/* ================= QR ================= */

const qr = (data) =>
  QRCode.toBuffer(JSON.stringify(data), {
    type: "png",
    errorCorrectionLevel: "H",
    scale: 5,
  });

/* ================= MAIN ================= */

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findOne({ orderId: params.id }).lean();
    const company = await CompanySettings.findOne().lean();

    if (!order || !company) {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    /* ================= INVOICE ================= */

    let invoiceNo = order?.invoice?.invoiceNumber;

    if (!invoiceNo) {
      const count = await Order.countDocuments({
        "invoice.invoiceNumber": { $exists: true },
      });

      invoiceNo = generateInvoiceNumber(count);

      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            "invoice.invoiceNumber": invoiceNo,
            "invoice.generatedAt": new Date(),
          },
        }
      );
    }

    const gst = calculateGSTSummary(order, company.state || {});

    const qrBuffer = await qr({
      invoice: invoiceNo,
      orderId: order.orderId,
      amount: order.billing?.grandTotal,
    });

    /* ================= PDF ================= */

    const pdf = await PDFDocument.create();
    let page = pdf.addPage([PAGE.w, PAGE.h]);

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const qrImg = await pdf.embedPng(qrBuffer);

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    const logo =
      logoPath && fs.existsSync(logoPath)
        ? await pdf.embedPng(fs.readFileSync(logoPath))
        : null;

    const signPath = path.join(process.cwd(), "public/signature.png");

    const sign =
      fs.existsSync(signPath)
        ? await pdf.embedPng(fs.readFileSync(signPath))
        : null;

    /* ================= SAFE DRAW ENGINE ================= */

    let y = PAGE.h - PAGE.m;

    const text = (t, x, size = 10, b = false) => {
      if (!Number.isFinite(y)) y = PAGE.h - PAGE.m;

      page.drawText(S(t), {
        x: N(x),
        y: N(y),
        size,
        font: b ? bold : font,
        color: rgb(0, 0, 0),
      });
    };

    const down = (h = 14) => {
      y = N(y - h);
      if (y < MIN_Y) {
        page = pdf.addPage([PAGE.w, PAGE.h]);
        y = PAGE.h - PAGE.m;
      }
    };

    const line = () => {
      page.drawLine({
        start: { x: PAGE.m, y },
        end: { x: PAGE.w - PAGE.m, y },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
      });
      down(10);
    };

    /* ================= HEADER ================= */

    if (logo) {
      page.drawImage(logo, {
        x: 40,
        y: y - 40,
        width: 45,
        height: 45,
      });
    }

    text(company.companyName, 100, 16, true);
    down(16);

    text(company.tagline || "Eat Healthy, Stay Healthy", 100, 10);
    down(25);

    text("TAX INVOICE", 420, 12, true);
    text(invoiceNo, 420, 10);

    down(40);
    line();

    /* ================= BLOCKS ================= */

    const block = (title, x, rows) => {
      text(title, x, 11, true);
      down();

      rows.forEach((r) => {
        text(r, x, 9);
        down(12);
      });
    };

    block(40, [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
    ]);

    block(220, [
      order.address?.city,
      order.address?.state,
      order.address?.pincode,
    ]);

    block(380, [
      order.payment?.method,
      order.payment?.status,
      M(order.payment?.amountPaid),
    ]);

    down(20);
    line();

    /* ================= ITEMS ================= */

    text("ITEMS", 40, 11, true);
    down();

    let total = 0;

    (order.items || []).forEach((i, idx) => {
      total += N(i.total);

      text(
        `${idx + 1}. ${i.name} | Qty:${i.qty} | Rate:${M(
          i.price
        )} | Total:${M(i.total)}`,
        40,
        9
      );

      down(12);
    });

    down();
    text(`ITEM TOTAL: ${M(total)}`, 40, 11, true);

    down(40);

    /* ================= SUMMARY ================= */

    const sx = 330;

    page.drawRectangle({
      x: sx,
      y: y - 120,
      width: 220,
      height: 140,
      color: rgb(0.97, 0.97, 0.97),
    });

    text("GST SUMMARY", sx + 15, 11, true);

    const rows = [
      ["Taxable", gst.taxable],
      ["CGST", gst.cgst],
      ["SGST", gst.sgst],
      ["IGST", gst.igst],
      ["Discount", order.billing?.discount],
      ["Grand Total", order.billing?.grandTotal],
    ];

    let sy = y - 20;

    rows.forEach(([k, v]) => {
      text(k, sx + 15, 9);
      text(M(v), sx + 140, 9);
      sy -= 14;
    });

    /* ================= QR + SIGN ================= */

    page.drawImage(qrImg, {
      x: 40,
      y: 120,
      width: 70,
      height: 70,
    });

    if (sign) {
      page.drawImage(sign, {
        x: 140,
        y: 120,
        width: 90,
        height: 40,
      });
    }

    text(`For ${company.companyName}`, 140, 10, true);

    /* ================= FINAL ================= */

    const bytes = await pdf.save();

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${invoiceNo}.pdf`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: 500 }
    );
  }
}
