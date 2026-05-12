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

/* ================= ERP CONSTANTS ================= */

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const FOOTER_HEIGHT = 60;

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

/* ================= HELPERS ================= */

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const safe = (v) => (v === undefined || v === null || v === "" ? "-" : v);

const line = (pdf, y) => {
  pdf.strokeColor("#e5e7eb").lineWidth(1);
  pdf.moveTo(40, y).lineTo(555, y).stroke();
};

const hashInvoice = (order, invoiceNumber) =>
  crypto
    .createHash("sha256")
    .update(`${order.orderId}-${invoiceNumber}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 20)
    .toUpperCase();

const generateQR = async (data) =>
  QRCode.toBuffer(JSON.stringify(data), {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 1,
    scale: 6,
  });

/* ================= MAIN API ================= */

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id }).lean();
    const company = await CompanySettings.findOne().lean();

    if (!order || !company) {
      return NextResponse.json(
        { success: false, message: "Order or Company missing" },
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

    /* ================= CALCULATIONS ================= */

    const gst = calculateGSTSummary(order, company.state || "");
    const invoiceHash = hashInvoice(order, invoiceNumber);

    const isB2B =
      order?.address?.gstType === "B2B" && order?.address?.gstNumber;

    const invoiceType = isB2B ? "B2B TAX INVOICE" : "B2C TAX INVOICE";

    const qrBuffer = await generateQR({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order?.billing?.grandTotal || 0,
      hash: invoiceHash,
      verifyUrl: `${BASE_URL}/invoice/verify/${order.orderId}`,
    });

    /* ================= PDF INIT ================= */

    const pdf = createPDF();
    const chunks = [];

    pdf.on("data", (c) => chunks.push(c));

    const bufferPromise = new Promise((resolve) => {
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
    });

    /* ================= HEADER ================= */

    const tagline =
      company.tagline?.trim() || "Eat Healthy, Stay Healthy";

    pdf
      .font("Inter-Bold")
      .fontSize(22)
      .fillColor("#111827")
      .text(company.companyName || "COMPANY", 105, 35, { width: 300 });

    pdf
      .font("Inter")
      .fontSize(9)
      .fillColor("#6b7280")
      .text(tagline, 105, 60, { width: 300 });

    let y = 80;

    const companyFields = [
      company.addressLine1,
      company.addressLine2,
      `City: ${company.city || "-"}`,
      `State: ${company.state || "-"}`,
      `PIN: ${company.pincode || "-"}`,
      `GSTIN: ${company.gstin || "-"}`,
      `Phone: ${company.phone || "-"}`,
      `Email: ${company.email || "-"}`,
    ];

    companyFields.forEach((t) => {
      if (!t) return;
      pdf.font("Inter").fontSize(9).fillColor("#374151").text(t, 105, y);
      y += 14;
    });

    /* ================= INVOICE BOX ================= */

    pdf
      .roundedRect(360, 30, 195, 165, 10)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    pdf
      .font("Inter-Bold")
      .fontSize(16)
      .fillColor("#111827")
      .text("TAX INVOICE", 380, 45);

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#2563eb")
      .text(invoiceType, 380, 65);

    let iy = 95;

    [
      ["Invoice No", invoiceNumber],
      ["Date", new Date(order.createdAt).toLocaleDateString()],
      ["Order ID", order.orderId],
    ].forEach(([k, v]) => {
      pdf.font("Inter").fontSize(9).fillColor("#374151");
      pdf.text(k, 380, iy);
      pdf.text(String(v), 380, iy + 12);
      iy += 32;
    });

    line(pdf, 210);

    /* ================= ADDRESS BLOCK ================= */

    const top = 235;

    const box = (x, title, fields) => {
      pdf.font("Inter-Bold").fontSize(10).text(title, x, top);

      let y = top + 18;

      fields.forEach((f) => {
        pdf
          .font("Inter")
          .fontSize(9)
          .fillColor("#374151")
          .text(safe(f), x, y, { width: 150 });

        y += 14;
      });
    };

    box(40, "Bill To", [
      order.address?.name,
      order.address?.phone,
      order.address?.address,
      order.address?.city,
      order.address?.state,
      order.address?.pincode,
      order.address?.gstNumber,
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
      `Method: ${order.payment?.method}`,
      `Status: ${order.payment?.status}`,
      `Paid: ${money(order.payment?.amountPaid)}`,
      `Txn: ${order.payment?.transactionId}`,
      `UTR: ${order.payment?.utr}`,
    ]);

    line(pdf, 360);

    /* ================= ITEMS ================= */

    const items = order.items || [];

    let ty = 385;

    const headers = [
      "#",
      "Product",
      "HSN",
      "Qty",
      "Rate",
      "GST",
      "Taxable",
      "Total",
    ];

    const xs = [45, 70, 210, 260, 300, 355, 410, 490];

    pdf.rect(40, ty, 515, 26).fill("#111827");

    pdf.font("Inter-Bold").fontSize(9).fillColor("#fff");

    headers.forEach((h, i) => pdf.text(h, xs[i], ty + 8));

    ty += 34;

    pdf.font("Inter").fillColor("#111827");

    items.forEach((item, i) => {
      pdf.rect(40, ty - 4, 515, 28).stroke("#e5e7eb");

      const vals = [
        i + 1,
        item?.name,
        item?.snapshot?.hsn,
        item?.qty,
        money(item?.price),
        `${item?.gstPercent || 0}%`,
        money(item?.taxableAmount),
        money(item?.total),
      ];

      vals.forEach((v, j) =>
        pdf.text(String(v), xs[j], ty + 4, {
          width: j === 1 ? 120 : undefined,
        })
      );

      ty += 30;
    });

    /* ================= BOTTOM ERP GRID ================= */

    const bottom = 540;

    pdf.image(qrBuffer, 40, bottom, { width: 85 });

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(`Generated: ${new Date().toLocaleString()}`, 140, bottom + 5);

    pdf.text(`Hash: ${invoiceHash}`, 140, bottom + 20);

    pdf
      .font("Inter-Bold")
      .fontSize(10)
      .text(`For ${company.companyName}`, 140, bottom + 55);

    const sign = path.join(process.cwd(), "public/signature.png");

    if (fs.existsSync(sign)) {
      pdf.image(sign, 140, bottom + 70, { width: 120 });
    }

    /* ================= GST SUMMARY ================= */

    const sx = 330;
    let sy = bottom;

    const summary = [
      ["Taxable", gst.taxable],
      ["CGST", gst.cgst],
      ["SGST", gst.sgst],
      ["IGST", gst.igst],
      ["Discount", order.billing?.discount],
      ["Total GST", order.billing?.totalGST],
    ];

    pdf
      .roundedRect(sx, sy, 230, 160, 10)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    pdf.font("Inter-Bold").text("GST Summary", sx + 15, sy + 12);

    sy += 35;

    summary.forEach(([k, v]) => {
      pdf.font("Inter").fontSize(9);
      pdf.text(k, sx + 15, sy);
      pdf.text(money(v), sx + 140, sy);
      sy += 18;
    });

    pdf
      .font("Inter-Bold")
      .fontSize(13)
      .fillColor("#16a34a")
      .text("Grand Total", sx + 15, sy + 10);

    pdf.text(money(order.billing?.grandTotal), sx + 140, sy + 10);

    /* ================= FOOTER ================= */

    const fy = PAGE_HEIGHT - FOOTER_HEIGHT;

    line(pdf, fy);

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "ERP Certified Invoice | System Generated | No Signature Required",
        40,
        fy + 10,
        { width: 500, align: "center" }
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
