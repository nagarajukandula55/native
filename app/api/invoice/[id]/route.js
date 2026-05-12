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

const PAGE_H = 842;
const PAGE_W = 595;

/* ================= CORE SAFE ENGINE ================= */

const num = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const safe = (v) =>
  v === undefined || v === null || v === "" ? "-" : String(v);

const money = (v) =>
  `INR ${num(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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

/* ================= MAIN API ================= */

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

    /* ================= SAFE DATA ================= */

    const gst = calculateGSTSummary(order, company.state || "");
    const hash = hashInvoice(order, invoiceNumber);

    const qrBuffer = await qr({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: num(order.billing?.grandTotal),
      hash,
    });

    /* ================= PDF INIT ================= */

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([PAGE_W, PAGE_H]);

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

    /* ================= DRAW HELPERS ================= */

    const draw = (text, x, y, size = 10, isBold = false) => {
      page.drawText(safe(text), {
        x: num(x),
        y: num(y),
        size,
        font: isBold ? bold : font,
        color: rgb(0, 0, 0),
      });
    };

    const line = (y) => {
      page.drawLine({
        start: { x: 40, y: num(y) },
        end: { x: 555, y: num(y) },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
      });
    };

    /* ================= HEADER ================= */

    let y = 800;

    if (logoImg) {
      page.drawImage(logoImg, {
        x: 40,
        y: 760,
        width: 50,
        height: 50,
      });
    }

    draw(company.companyName, 110, y, 16, true);

    draw(
      company.tagline || "Eat Healthy, Stay Healthy",
      110,
      y - 20,
      10
    );

    draw("TAX INVOICE", 420, y, 12, true);
    draw(invoiceNumber, 420, y - 20, 10);

    line(740);

    /* ================= ADDRESS ================= */

    const baseY = 690;

    const block = (title, x, rows) => {
      draw(title, x, baseY, 11, true);

      let yy = baseY - 18;

      rows.forEach((r) => {
        draw(r, x, yy, 9);
        yy -= 14;
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

    /* ================= ITEMS ================= */

    let yItem = 520;
    let itemTotal = 0;

    draw("# Item Qty Rate GST Total", 40, yItem, 10, true);

    yItem -= 25;

    (order.items || []).forEach((it, i) => {
      const total = num(it?.total);
      itemTotal += total;

      const row = `${i + 1} ${it?.name} ${it?.qty} ${money(
        it?.price
      )} ${num(it?.gstPercent)}% ${money(total)}`;

      draw(row, 40, yItem, 9);
      yItem -= 15;
    });

    draw(`Items Total: ${money(itemTotal)}`, 40, yItem - 10, 11, true);

    /* ================= SUMMARY ================= */

    let sy = yItem - 40;
    const sx = 330;

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
      width: 230,
      height: 140,
      color: rgb(0.97, 0.97, 0.97),
    });

    draw("GST Summary", sx + 15, sy, 11, true);

    sy -= 25;

    rows.forEach(([k, v]) => {
      draw(k, sx + 15, sy, 9);
      draw(money(v), sx + 150, sy, 9);
      sy -= 15;
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
      "This invoice is system generated and valid without physical signature.",
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
