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

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

const PAGE_HEIGHT = 842;
const FOOTER_HEIGHT = 85;

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const line = (pdf, y, color = "#d1d5db") => {
  pdf
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(40, y)
    .lineTo(555, y)
    .stroke();
};

const generateInvoiceHash = (order, invoiceNumber) =>
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

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id }).lean();
    const company = await CompanySettings.findOne().lean();

    if (!order || !company) {
      return NextResponse.json(
        { success: false, message: "Data missing" },
        { status: 404 }
      );
    }

    /* ---------------- INVOICE NUMBER SAFETY ---------------- */
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
    const invoiceHash = generateInvoiceHash(order, invoiceNumber);

    const isB2B =
      order?.address?.gstType === "B2B" &&
      order?.address?.gstNumber;

    const invoiceType = isB2B ? "B2B TAX INVOICE" : "B2C TAX INVOICE";

    const qrBuffer = await generateQR({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order?.billing?.grandTotal || 0,
      hash: invoiceHash,
      verifyUrl: `${BASE_URL}/invoice/verify/${order.orderId}`,
    });

    /* ---------------- PDF INIT ---------------- */
    const pdf = createPDF();

    const chunks = [];
    const bufferPromise = new Promise((resolve) => {
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
    });

    pdf.on("data", (c) => chunks.push(c));

    /* ---------------- WATERMARK ---------------- */
    pdf.save();
    pdf.rotate(-35, { origin: [300, 400] });

    pdf
      .opacity(0.05)
      .font("Inter-Bold")
      .fontSize(70)
      .fillColor("#e5e7eb")
      .text(company.companyName || "NATIVE", 50, 350, {
        width: 500,
        align: "center",
      });

    pdf.restore();

    /* ---------------- LOGO ---------------- */
    if (company.logoUrl) {
      const logoPath = path.join(
        process.cwd(),
        "public",
        company.logoUrl.replace(/^\/+/, "")
      );

      if (fs.existsSync(logoPath)) {
        pdf.image(logoPath, 28, 35, { width: 62 });
      }
    }

    /* ---------------- HEADER ---------------- */
    pdf
      .font("Inter-Bold")
      .fontSize(22)
      .fillColor("#111827")
      .text(company.companyName || "COMPANY", 105, 36);

    if (company.tagline) {
      pdf
        .font("Inter")
        .fontSize(9)
        .fillColor("#6b7280")
        .text(company.tagline, 105, 62);
    }

    let companyY = 82;

    [
      company.addressLine1,
      company.addressLine2,
      `City: ${company.city || "-"}`,
      `State: ${company.state || "-"}`,
      `PIN Code: ${company.pincode || "-"}`,
      `GSTIN: ${company.gstin || "-"}`,
      `Phone: ${company.phone || "-"}`,
      `Email: ${company.email || "-"}`,
    ]
      .filter(Boolean)
      .forEach((t) => {
        pdf.text(t, 105, companyY);
        companyY += 14;
      });

    /* ---------------- INVOICE BOX ---------------- */
    pdf
      .roundedRect(360, 30, 195, 175, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf
      .font("Inter-Bold")
      .fontSize(18)
      .fillColor("#111827")
      .text("TAX INVOICE", 382, 50);

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#2563eb")
      .text(invoiceType, 382, 72);

    let invY = 100;

    [
      ["Invoice No", invoiceNumber],
      ["Invoice Date", new Date(order.createdAt).toLocaleDateString()],
      ["Order ID", order.orderId],
    ].forEach(([label, val]) => {
      pdf.font("Inter").fontSize(9).fillColor("#374151");
      pdf.text(`${label}:`, 382, invY);
      pdf.text(String(val), 382, invY + 14);
      invY += 34;
    });

    line(pdf, 215);

    /* ---------------- ITEMS SAFE ---------------- */
    const items = order.items || [];

    let y = 380;

    pdf.rect(40, y, 515, 28).fill("#111827");

    const headers = [
      "#",
      "Product",
      "HSN",
      "Qty",
      "Rate",
      "GST%",
      "Taxable",
      "Total",
    ];

    const xs = [45, 65, 205, 255, 295, 355, 410, 490];

    pdf.font("Inter-Bold").fontSize(9).fillColor("#fff");

    headers.forEach((h, i) => pdf.text(h, xs[i], y + 9));

    y += 35;

    pdf.font("Inter").fillColor("#111827");

    items.forEach((item, idx) => {
      pdf.rect(40, y - 4, 515, 30).stroke("#e5e7eb");

      const vals = [
        idx + 1,
        item?.name || "-",
        item?.snapshot?.hsn || "-",
        item?.qty || 1,
        money(item?.price),
        `${item?.gstPercent || 0}%`,
        money(item?.taxableAmount),
        money(item?.total),
      ];

      vals.forEach((v, i) =>
        pdf.text(String(v), xs[i], y + 6, {
          width: i === 1 ? 130 : undefined,
        })
      );

      y += 32;
    });

    pdf
      .font("Inter-Bold")
      .fontSize(9)
      .text(`Total Items: ${items.length}`, 40, y + 10);

    const blockY = y + 28;

    /* ---------------- QR ---------------- */
    pdf.image(qrBuffer, 40, blockY, { width: 85 });

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(`Generated: ${new Date().toLocaleString()}`, 135, blockY + 10);

    pdf.text(`Hash: ${invoiceHash}`, 135, blockY + 26);

    /* ---------------- SIGN ---------------- */
    pdf
      .font("Inter-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(`For ${company.companyName}`, 135, blockY + 62);

    const signPath = path.join(process.cwd(), "public/signature.png");

    if (fs.existsSync(signPath)) {
      pdf.image(signPath, 135, blockY + 75, { width: 120 });
    }

    pdf.font("Inter").fontSize(9).text("Authorised Signatory", 135, blockY + 140);

    /* ---------------- GST SUMMARY SAFE ---------------- */
    const summaryRows = [
      ["Taxable Amount", gst?.taxable || 0],
      ["Discount", order?.billing?.discount || 0],
      ["CGST", gst?.cgst || 0],
      ["SGST", gst?.sgst || 0],
      ["IGST", gst?.igst || 0],
      ["Total GST", order?.billing?.totalGST || 0],
    ];

    const summaryHeight = 60 + summaryRows.length * 24 + 40;

    pdf
      .roundedRect(325, blockY, 230, summaryHeight, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf
      .font("Inter-Bold")
      .fontSize(12)
      .fillColor("#111827")
      .text("GST Summary", 340, blockY + 16);

    let sy = blockY + 42;

    summaryRows.forEach(([label, val]) => {
      pdf.font("Inter").fontSize(10);
      pdf.text(label, 340, sy);
      pdf.text(money(val), 470, sy);
      sy += 24;
    });

    line(pdf, sy + 4);

    pdf
      .font("Inter-Bold")
      .fontSize(13)
      .fillColor("#16a34a")
      .text("Grand Total", 340, sy + 18);

    pdf.text(money(order?.billing?.grandTotal), 450, sy + 18);

    /* ---------------- FOOTER ---------------- */
    const footerY = PAGE_HEIGHT - FOOTER_HEIGHT;

    pdf
      .font("Inter")
      .fontSize(9)
      .fillColor("#dc2626")
      .text(
        "Thank You for Shopping with Native ❤️",
        0,
        footerY - 20,
        { width: 595, align: "center" }
      );

    line(pdf, footerY);

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "Certified that the particulars given above are true and correct. This is a computer-generated tax invoice.",
        40,
        footerY + 14,
        { width: 500 }
      );

    pdf.end();

    const pdfBuffer = await bufferPromise;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${invoiceNumber}.pdf`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      { status: 500 }
    );
  }
}
