export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";
import { calculateGSTSummary } from "@/lib/gst";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/* ================= CONFIG ================= */

const W = 595;
const H = 842;

const num = (v) => (isNaN(Number(v)) ? 0 : Number(v));

const safe = (v) =>
  v === undefined || v === null || v === "" ? "-" : String(v);

const money = (v) => `₹${num(v).toFixed(2)}`;

const hashInvoice = (order, inv) =>
  crypto
    .createHash("sha256")
    .update(`${order.orderId}-${inv}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 20)
    .toUpperCase();

const qrGen = async (data) =>
  QRCode.toBuffer(JSON.stringify(data), {
    type: "png",
    errorCorrectionLevel: "H",
    scale: 5,
  });

/* ================= ROUTE ================= */

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const order = await Order.findOne({ orderId: params.id }).lean();
    const company = await CompanySettings.findOne().lean();

    if (!order || !company) {
      return NextResponse.json(
        { success: false, message: "Missing order/company" },
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

    /* ================= DATA ================= */

    const gst = calculateGSTSummary(order, company.state || "");
    const hash = hashInvoice(order, invoiceNumber);

    const qrBuffer = await qrGen({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order?.billing?.grandTotal || 0,
      hash,
    });

    /* ================= PDF ================= */

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([W, H]);

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const draw = (text, x, y, size = 10, b = false) => {
      page.drawText(safe(text), {
        x,
        y,
        size,
        font: b ? bold : font,
        color: rgb(0, 0, 0),
      });
    };

    let y = 800;

    /* ================= HEADER ================= */

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    if (logoPath && fs.existsSync(logoPath)) {
      const img = await pdf.embedPng(fs.readFileSync(logoPath));
      page.drawImage(img, { x: 40, y: 760, width: 50, height: 50 });
    }

    draw(company.companyName, 110, y, 16, true);

    draw(
      company.tagline || "Eat Healthy, Stay Healthy",
      110,
      y - 18,
      10
    );

    draw("TAX INVOICE", 420, y, 12, true);
    draw(invoiceNumber, 420, y - 18, 10);

    y -= 60;
    page.drawLine({
      start: { x: 40, y },
      end: { x: 555, y },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });

    y -= 30;

    /* ================= ADDRESS ================= */

    const addr = order.address || {};
    const pay = order.payment || {};

    draw("BILL TO", 40, y, 10, true);
    draw(addr.name, 40, y - 15);
    draw(addr.phone, 40, y - 30);
    draw(addr.address, 40, y - 45);

    draw("SHIP TO", 200, y, 10, true);
    draw(addr.city, 200, y - 15);
    draw(addr.state, 200, y - 30);

    draw("PAYMENT", 360, y, 10, true);
    draw(pay.method, 360, y - 15);
    draw(pay.status, 360, y - 30);
    draw(money(pay.amountPaid), 360, y - 45);

    y -= 120;

    /* ================= ITEMS ================= */

    const items = Array.isArray(order.items) ? order.items : [];

    draw("# ITEM QTY RATE GST TOTAL", 40, y, 10, true);
    y -= 20;

    let itemTotal = 0;

    items.forEach((it, i) => {
      const total = num(it?.total);
      itemTotal += total;

      draw(
        `${i + 1} ${it?.name || "-"} ${it?.qty || 0} ${money(
          it?.price
        )} ${it?.gstPercent || 0}% ${money(total)}`,
        40,
        y
      );

      y -= 15;
    });

    y -= 10;
    draw(`ITEM TOTAL: ${money(itemTotal)}`, 40, y, 11, true);

    y -= 40;

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
      x: sx,
      y: sy - 110,
      width: 220,
      height: 140,
      color: rgb(0.97, 0.97, 0.97),
    });

    draw("GST SUMMARY", sx + 15, sy, 10, true);

    sy -= 20;

    rows.forEach(([k, v]) => {
      draw(k, sx + 15, sy);
      draw(money(v), sx + 140, sy);
      sy -= 15;
    });

    /* ================= QR ================= */

    const qrImg = await pdf.embedPng(qrBuffer);

    page.drawImage(qrImg, {
      x: 40,
      y: 120,
      width: 70,
      height: 70,
    });

    /* ================= SIGN ================= */

    const signPath = path.join(process.cwd(), "public/signature.png");

    if (fs.existsSync(signPath)) {
      const signImg = await pdf.embedPng(fs.readFileSync(signPath));

      page.drawImage(signImg, {
        x: 150,
        y: 120,
        width: 90,
        height: 40,
      });
    }

    draw(`For ${company.companyName}`, 150, 105, 10, true);
    draw(`Hash: ${hash}`, 150, 90, 8);

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
