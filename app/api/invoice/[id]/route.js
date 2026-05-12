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

const PAGE_HEIGHT = 842;

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;
const safe = (v) => (v === undefined || v === null || v === "" ? "-" : String(v));

const toNum = (v) => Number(v || 0);

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
    const page = pdf.addPage([595, PAGE_HEIGHT]);

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const qrImg = await pdf.embedPng(qrBuffer);

    const signPath = path.join(process.cwd(), "public/signature.png");
    const signImg =
      fs.existsSync(signPath) &&
      (await pdf.embedPng(fs.readFileSync(signPath)));

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    const logoImg =
      logoPath && fs.existsSync(logoPath)
        ? await pdf.embedPng(fs.readFileSync(logoPath))
        : null;

    /* ================= DRAW HELPERS ================= */

    const drawText = (text, x, y, size = 10, isBold = false) => {
      page.drawText(safe(text), {
        x: toNum(x),
        y: toNum(y),
        size,
        font: isBold ? bold : font,
        color: rgb(0, 0, 0),
      });
    };

    const line = (y) => {
      page.drawLine({
        start: { x: 40, y: toNum(y) },
        end: { x: 555, y: toNum(y) },
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

    drawText(company.companyName, 110, y, 16, true);
    drawText(
      company.tagline || "Eat Healthy, Stay Healthy",
      110,
      y - 20,
      10
    );

    drawText("TAX INVOICE", 420, y, 12, true);
    drawText(invoiceNumber, 420, y - 20, 10);

    line(740);

    /* ================= ADDRESS BLOCK ================= */

    const addrY = 690;

    const block = (title, x, rows) => {
      drawText(title, x, addrY, 11, true);

      let yy = addrY - 18;

      rows.forEach((r) => {
        drawText(r, x, yy, 9);
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

    let itemY = 520;
    let itemTotal = 0;

    drawText("# Item Qty Rate GST Total", 40, itemY, 10, true);

    itemY -= 25;

    (order.items || []).forEach((it, i) => {
      itemTotal += it.total || 0;

      const row = `${i + 1} ${it.name} ${it.qty} ${money(
        it.price
      )} ${it.gstPercent || 0}% ${money(it.total)}`;

      drawText(row, 40, itemY, 9);

      itemY -= 15;
    });

    drawText(`Items Total: ${money(itemTotal)}`, 40, itemY - 10, 11, true);

    /* ================= SUMMARY ================= */

    const sx = 330;
    let sy = itemY - 40;

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

    drawText("GST Summary", sx + 15, sy, 11, true);

    sy -= 25;

    rows.forEach(([k, v]) => {
      drawText(k, sx + 15, sy, 9);
      drawText(money(v), sx + 150, sy, 9);
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

    drawText(`For ${company.companyName}`, 150, 100, 10, true);
    drawText(`Hash: ${hash}`, 150, 85, 8);

    /* ================= FOOTER ================= */

    drawText(
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
