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

    const gst = calculateGSTSummary(order, company.state || "");
    const hash = hashInvoice(order, invoiceNumber);

    const qrBuffer = await qr({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order.billing?.grandTotal,
      hash,
    });

    /* ================= PDF INIT ================= */

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, PAGE_H]);

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const qrImg = await pdf.embedPng(qrBuffer);

    const signPath = path.join(process.cwd(), "public/signature.png");
    const signImg = fs.existsSync(signPath)
      ? await pdf.embedPng(fs.readFileSync(signPath))
      : null;

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    const logoImg =
      logoPath && fs.existsSync(logoPath)
        ? await pdf.embedPng(fs.readFileSync(logoPath))
        : null;

    let y = 800;

    const text = (t, x, size = 10, isBold = false) => {
      page.drawText(String(t || "-"), {
        x,
        y,
        size,
        font: isBold ? bold : font,
        color: rgb(0, 0, 0),
      });
    };

    const line = (yy) =>
      page.drawLine({
        start: { x: 40, y: yy },
        end: { x: 555, y: yy },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.85),
      });

    /* ================= HEADER ================= */

    if (logoImg) {
      page.drawImage(logoImg, {
        x: 40,
        y: 760,
        width: 50,
        height: 50,
      });
    }

    text(company.companyName, 110, 16, true);
    text(company.tagline || "Eat Healthy, Stay Healthy", 110, 10);

    text("TAX INVOICE", 420, 12, true);
    text(invoiceNumber, 420, 10);

    line(740);

    /* ================= ADDRESS ================= */

    const addrY = 700;

    const drawBlock = (title, x, rows) => {
      text(title, x, 11, true);
      let yy = addrY;

      rows.forEach((r) => {
        page.drawText(safe(r), {
          x,
          y: yy,
          font,
          size: 9,
        });
        yy -= 14;
      });
    };

    drawBlock(40, "Bill To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
    ]);

    drawBlock(200, "Ship To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
    ]);

    drawBlock(360, "Payment", [
      order.payment?.method,
      order.payment?.status,
      money(order.payment?.amountPaid),
      order.payment?.transactionId,
    ]);

    /* ================= ITEMS ================= */

    let itemY = 520;

    const items = order.items || [];
    let totalItems = 0;

    text("# Item Qty Rate GST Total", 40, 10, true);
    itemY -= 25;

    items.forEach((it, i) => {
      totalItems += it.total || 0;

      const row = `${i + 1} ${it.name} ${it.qty} ${money(
        it.price
      )} ${it.gstPercent || 0}% ${money(it.total)}`;

      page.drawText(row, { x: 40, y: itemY, font, size: 9 });

      itemY -= 15;
    });

    text(`Items Total: ${money(totalItems)}`, 40, 11, true);

    /* ================= SUMMARY ================= */

    const sx = 330;
    let sy = itemY;

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

    text("GST Summary", sx + 15, 11, true);

    sy -= 30;

    rows.forEach(([k, v]) => {
      page.drawText(k, { x: sx + 15, y: sy, font, size: 9 });
      page.drawText(money(v), { x: sx + 150, y: sy, font, size: 9 });
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

    text(`For ${company.companyName}`, 150, 10, true);
    text(`Hash: ${hash}`, 150, 8);

    /* ================= FOOTER ================= */

    text(
      "This is a system generated invoice and valid without signature verification.",
      40,
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
