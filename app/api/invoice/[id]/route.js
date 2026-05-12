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

const PAGE_TOP = 40;
const PAGE_BOTTOM = 780;

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/* ================= HELPERS ================= */

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const safe = (v) => (v === undefined || v === null || v === "" ? "-" : v);

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
        { success: false, message: "Missing Order/Company" },
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
    const invoiceHash = hashInvoice(order, invoiceNumber);

    const isB2B =
      order?.address?.gstType === "B2B" &&
      order?.address?.gstNumber;

    const invoiceType = isB2B
      ? "B2B TAX INVOICE"
      : "B2C TAX INVOICE";

    const qrBuffer = await generateQR({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order?.billing?.grandTotal || 0,
      hash: invoiceHash,
      verifyUrl: `${BASE_URL}/invoice/verify/${order.orderId}`,
    });

    /* ================= PDF ================= */

    const pdf = createPDF();
    const chunks = [];

    pdf.on("data", (c) => chunks.push(c));

    const bufferPromise = new Promise((resolve) =>
      pdf.on("end", () => resolve(Buffer.concat(chunks)))
    );

    let y = PAGE_TOP;

    const checkPage = (h = 30) => {
      if (y + h > PAGE_BOTTOM) {
        pdf.addPage();
        y = PAGE_TOP;
      }
    };

    /* ================= HEADER ================= */

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    if (logoPath && fs.existsSync(logoPath)) {
      pdf.image(logoPath, 40, y, { width: 70 });
    }

    pdf.font("Inter-Bold").fontSize(18).text(company.companyName, 120, y);
    y += 20;

    pdf
      .font("Inter")
      .fontSize(9)
      .fillColor("#6b7280")
      .text(company.tagline || "Eat Healthy, Stay Healthy", 120, y);
    y += 15;

    [
      company.addressLine1,
      company.city,
      company.state,
      company.pincode,
      company.phone,
      company.email,
      company.gstin,
    ]
      .filter(Boolean)
      .forEach((t) => {
        pdf.fontSize(9).fillColor("#374151").text(t, 120, y);
        y += 13;
      });

    /* ================= INVOICE BOX ================= */

    pdf
      .roundedRect(360, 30, 195, 120, 8)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    pdf.font("Inter-Bold").fontSize(14).text("TAX INVOICE", 380, 40);

    let iy = 65;

    [
      ["Invoice", invoiceNumber],
      ["Order", order.orderId],
      ["Date", new Date(order.createdAt).toLocaleDateString()],
    ].forEach(([k, v]) => {
      pdf.font("Inter").fontSize(9);
      pdf.text(k, 380, iy);
      pdf.text(String(v), 430, iy);
      iy += 20;
    });

    y = 170;
    pdf.moveTo(40, y).lineTo(555, y).stroke();
    y += 20;

    /* ================= ADDRESS BLOCK ================= */

    const box = (x, title, fields) => {
      checkPage(120);

      pdf.font("Inter-Bold").fontSize(10).text(title, x, y);
      let yy = y + 15;

      fields.forEach((f) => {
        pdf.font("Inter").fontSize(9).text(safe(f), x, yy, { width: 150 });
        yy += 13;
      });
    };

    box(40, "Bill To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
      order.address?.pincode,
    ]);

    box(200, "Ship To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
      order.address?.pincode,
    ]);

    box(360, "Payment", [
      order.payment?.method,
      order.payment?.status,
      money(order.payment?.amountPaid),
      order.payment?.transactionId,
    ]);

    y += 120;

    pdf.moveTo(40, y).lineTo(555, y).stroke();
    y += 15;

    /* ================= ITEMS ================= */

    const items = order.items || [];

    const headers = [
      "#",
      "Item",
      "Qty",
      "Rate",
      "GST%",
      "Taxable",
      "Total",
    ];

    const xs = [45, 70, 260, 310, 360, 420, 500];

    checkPage(40);

    pdf.rect(40, y, 515, 22).fill("#111827");

    pdf.font("Inter-Bold").fontSize(8).fillColor("#fff");

    headers.forEach((h, i) => pdf.text(h, xs[i], y + 6));

    y += 30;

    let itemTotal = 0;

    items.forEach((it, i) => {
      checkPage(25);

      const total = it?.total || 0;
      itemTotal += total;

      pdf.rect(40, y - 3, 515, 24).stroke("#e5e7eb");

      const row = [
        i + 1,
        it?.name,
        it?.qty,
        money(it?.price),
        `${it?.gstPercent || 0}%`,
        money(it?.taxableAmount),
        money(total),
      ];

      pdf.font("Inter").fillColor("#111827").fontSize(9);

      row.forEach((v, j) =>
        pdf.text(String(v), xs[j], y + 5, {
          width: j === 1 ? 160 : undefined,
        })
      );

      y += 26;
    });

    y += 10;

    pdf.font("Inter-Bold").text(`Items Total: ${money(itemTotal)}`, 40, y);

    y += 30;

    /* ================= BOTTOM ================= */

    const bottom = 520;

    pdf.image(qrBuffer, 40, bottom, { width: 85 });

    pdf.font("Inter").fontSize(8);
    pdf.text(`Hash: ${invoiceHash}`, 140, bottom + 5);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 140, bottom + 20);

    const signY = bottom + 60;

    pdf.font("Inter-Bold").text(`For ${company.companyName}`, 140, signY);

    const sign = path.join(process.cwd(), "public/signature.png");

    if (fs.existsSync(sign)) {
      pdf.image(sign, 140, signY + 15, { width: 120 });
    }

    /* ================= SUMMARY ================= */

    const sx = 330;
    let sy = bottom;

    const summary = calculateGSTSummary(order, company.state || "");

    const rows = [
      ["Taxable", summary.taxable],
      ["CGST", summary.cgst],
      ["SGST", summary.sgst],
      ["IGST", summary.igst],
      ["Discount", order.billing?.discount],
      ["Total GST", order.billing?.totalGST],
    ];

    pdf
      .roundedRect(sx, sy, 230, 160)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    pdf.font("Inter-Bold").text("GST Summary", sx + 15, sy + 12);

    sy += 35;

    rows.forEach(([k, v]) => {
      pdf.font("Inter").fontSize(9);
      pdf.text(k, sx + 15, sy);
      pdf.text(money(v), sx + 150, sy);
      sy += 18;
    });

    pdf
      .font("Inter-Bold")
      .fontSize(13)
      .fillColor("#16a34a")
      .text("Grand Total", sx + 15, sy + 10);

    pdf.text(money(order.billing?.grandTotal), sx + 150, sy + 10);

    /* ================= THANK YOU ================= */

    pdf
      .font("Inter-Bold")
      .fontSize(12)
      .fillColor("#111827")
      .text(
        "Thank You for Your Business!",
        0,
        PAGE_HEIGHT - 80,
        { width: 595, align: "center" }
      );

    /* ================= FOOTER ================= */

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "This invoice is system generated and valid without signature verification.",
        40,
        PAGE_HEIGHT - 60,
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
