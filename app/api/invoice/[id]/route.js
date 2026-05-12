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

/* ================= CONSTANTS ================= */

const PAGE_HEIGHT = 842;
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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

/* ================= API ================= */

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id }).lean();
    const company = await CompanySettings.findOne().lean();

    if (!order || !company) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 404 }
      );
    }

    /* ================= INVOICE NO ================= */

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

    const qrBuffer = await generateQR({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order?.billing?.grandTotal || 0,
      hash: invoiceHash,
      verifyUrl: `${BASE_URL}/invoice/verify/${order.orderId}`,
    });

    const pdf = createPDF();
    const chunks = [];

    pdf.on("data", (c) => chunks.push(c));

    const bufferPromise = new Promise((resolve) =>
      pdf.on("end", () => resolve(Buffer.concat(chunks)))
    );

    /* ================= HEADER SECTION ================= */

    const logoPath = company.logoUrl
      ? path.join(process.cwd(), "public", company.logoUrl)
      : null;

    // LOGO (LEFT)
    if (logoPath && fs.existsSync(logoPath)) {
      pdf.image(logoPath, 40, 30, { width: 70 });
    }

    // COMPANY BLOCK (CENTER LEFT)
    pdf
      .font("Inter-Bold")
      .fontSize(18)
      .text(company.companyName || "COMPANY", 120, 32);

    pdf
      .font("Inter")
      .fontSize(9)
      .text(company.tagline || "Eat Healthy, Stay Healthy", 120, 52);

    let cy = 72;

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
        pdf.fontSize(9).text(t, 120, cy);
        cy += 12;
      });

    // INVOICE BOX (RIGHT SIDE)
    pdf
      .roundedRect(360, 25, 195, 120, 8)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    pdf.font("Inter-Bold").fontSize(14).text("TAX INVOICE", 380, 35);

    let iy = 60;

    [
      ["Invoice", invoiceNumber],
      ["Order", order.orderId],
      ["Date", new Date(order.createdAt).toLocaleDateString()],
    ].forEach(([k, v]) => {
      pdf.font("Inter").fontSize(9);
      pdf.text(k, 380, iy);
      pdf.text(v, 430, iy);
      iy += 20;
    });

    line(pdf, 160);

    /* ================= ADDRESS SECTION ================= */

    const top = 175;

    const box = (x, title, fields) => {
      pdf.font("Inter-Bold").fontSize(10).text(title, x, top);

      let y = top + 18;

      fields.forEach((f) => {
        pdf.font("Inter").fontSize(9).text(safe(f), x, y, { width: 150 });
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

    line(pdf, 310);

    /* ================= ITEMS TABLE (FULL ERP) ================= */

    const items = order.items || [];

    let y = 330;

    const headers = [
      "#",
      "Item",
      "HSN",
      "Qty",
      "Rate",
      "GST%",
      "Taxable",
      "GST",
      "Total",
    ];

    const xs = [45, 70, 200, 255, 300, 345, 400, 455, 500];

    pdf.rect(40, y, 515, 25).fill("#111827");

    pdf.font("Inter-Bold").fontSize(8).fillColor("#fff");

    headers.forEach((h, i) => pdf.text(h, xs[i], y + 7));

    y += 32;

    pdf.font("Inter").fillColor("#111827");

    let grandItemsTotal = 0;

    items.forEach((item, i) => {
      const total = item?.total || 0;
      grandItemsTotal += total;

      pdf.rect(40, y - 3, 515, 28).stroke("#e5e7eb");

      const vals = [
        i + 1,
        item?.name,
        item?.snapshot?.hsn,
        item?.qty,
        money(item?.price),
        `${item?.gstPercent || 0}%`,
        money(item?.taxableAmount),
        money(item?.gstAmount || 0),
        money(total),
      ];

      vals.forEach((v, j) =>
        pdf.text(String(v), xs[j], y + 4, {
          width: j === 1 ? 120 : undefined,
        })
      );

      y += 30;
    });

    pdf
      .font("Inter-Bold")
      .fontSize(9)
      .text(`Items Total: ${money(grandItemsTotal)}`, 40, y + 10);

    /* ================= BOTTOM SECTION ================= */

    const bottom = 520;

    // QR LEFT
    pdf.image(qrBuffer, 40, bottom, { width: 85 });

    pdf
      .font("Inter")
      .fontSize(8)
      .text(`Hash: ${invoiceHash}`, 140, bottom + 10);

    pdf.text(
      `Generated: ${new Date().toLocaleString()}`,
      140,
      bottom + 25
    );

    /* SIGNATURE BELOW QR (PROPER SPACING) */
    const signY = bottom + 70;

    pdf
      .font("Inter-Bold")
      .text(`For ${company.companyName}`, 140, signY);

    const sign = path.join(process.cwd(), "public/signature.png");

    if (fs.existsSync(sign)) {
      pdf.image(sign, 140, signY + 15, { width: 120 });
    }

    /* ================= SUMMARY RIGHT ================= */

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
      .roundedRect(sx, sy, 230, 170, 8)
      .fillAndStroke("#f9fafb", "#e5e7eb");

    pdf.font("Inter-Bold").text("GST Summary", sx + 15, sy + 12);

    sy += 35;

    summary.forEach(([k, v]) => {
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
        "This is a system-generated invoice. All transactions are subject to verification and applicable GST laws.",
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
