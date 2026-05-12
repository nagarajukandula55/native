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
const FOOTER_HEIGHT = 90;

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const line = (pdf, y, color = "#d1d5db") => {
  pdf.strokeColor(color).lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();
};

const generateInvoiceHash = (order, invoiceNumber) =>
  crypto
    .createHash("sha256")
    .update(`${order.orderId}-${invoiceNumber}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 20)
    .toUpperCase();

const generateQR = async (payload) =>
  await QRCode.toBuffer(JSON.stringify(payload), {
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

    let invoiceNumber = order.invoice?.invoiceNumber;

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

    const invoiceType = company?.gstin ? "B2B TAX INVOICE" : "B2C TAX INVOICE";

    const qrBuffer = await generateQR({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order.billing?.grandTotal,
      hash: invoiceHash,
      verifyUrl: `${BASE_URL}/invoice/verify/${order.orderId}`,
    });

    const pdf = createPDF();
    const chunks = [];
    pdf.on("data", (c) => chunks.push(c));

    /* WATERMARK */
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

    /* LOGO */
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

    /* HEADER */
    pdf.font("Inter-Bold").fontSize(22).fillColor("#111827")
      .text(company.companyName, 105, 36);

    pdf.font("Inter").fontSize(9).fillColor("#6b7280")
      .text(company.tagline || "-", 105, 62);

    let companyY = 82;
    [
      company.addressLine1,
      `City: ${company.city}`,
      `State: ${company.state}`,
      `PIN Code: ${company.pincode}`,
      `GSTIN: ${company.gstin}`,
      `Phone: ${company.phone}`,
      `Email: ${company.email}`
    ].forEach((t) => {
      pdf.text(t || "-", 105, companyY);
      companyY += 14;
    });

    /* INVOICE BOX */
    pdf.roundedRect(360, 30, 195, 170, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold").fontSize(18).fillColor("#111827")
      .text("TAX INVOICE", 382, 50);

    pdf.font("Inter").fontSize(8).fillColor("#2563eb")
      .text(invoiceType, 382, 72);

    pdf.font("Inter").fontSize(9).fillColor("#374151");

    let invY = 100;
    [
      ["Invoice No", invoiceNumber],
      ["Invoice Date", new Date(order.createdAt).toLocaleDateString()],
      ["Order ID", order.orderId]
    ].forEach(([label, val]) => {
      pdf.text(`${label}:`, 382, invY);
      pdf.text(val, 382, invY + 14);
      invY += 36;
    });

    line(pdf, 210);

    /* ADDRESS BLOCK */
    const top = 225;

    const drawAddress = (x, title) => {
      pdf.font("Inter-Bold").fontSize(11).text(title, x, top);
      pdf.font("Inter").fontSize(9);

      let y = top + 18;

      const fields = [
        order.address?.name,
        order.address?.phone,
        order.address?.address,
        `City: ${order.address?.city}`,
        `State: ${order.address?.state}`,
        `PIN: ${order.address?.pincode}`,
        order.address?.email
      ];

      fields.forEach((f) => {
        pdf.text(f || "-", x, y, { width: 150 });
        y += 16;
      });
    };

    drawAddress(40, "Bill To");
    drawAddress(220, "Ship To");

    pdf.font("Inter-Bold").text("Payment", 410, top);
    pdf.font("Inter");

    [
      `Method: ${order.payment?.method || "-"}`,
      `Status: ${order.payment?.status || "-"}`,
      `Paid: ${money(order.payment?.amountPaid)}`,
      `Txn ID: ${order.payment?.transactionId || "-"}`,
      `UTR: ${order.payment?.utr || "-"}`
    ].forEach((t, i) => pdf.text(t, 410, top + 18 + i * 16));

    line(pdf, 360);

    /* TABLE */
    let y = 375;

    pdf.rect(40, y, 515, 28).fill("#111827");

    pdf.font("Inter-Bold").fillColor("#fff").fontSize(9);

    ["#", "Product", "HSN", "Qty", "Rate", "GST%", "Taxable", "Total"]
      .forEach((h, i) => {
        const xs = [45, 65, 205, 255, 295, 355, 410, 490];
        pdf.text(h, xs[i], y + 9);
      });

    y += 35;

    pdf.font("Inter").fillColor("#111827");

    order.items.forEach((item, idx) => {
      pdf.rect(40, y - 4, 515, 30).stroke("#e5e7eb");

      const vals = [
        idx + 1,
        item.name,
        item.snapshot?.hsn || "-",
        item.qty,
        money(item.price),
        `${item.gstPercent}%`,
        money(item.taxableAmount),
        money(item.total)
      ];

      const xs = [45, 65, 205, 255, 295, 355, 410, 490];

      vals.forEach((v, i) => pdf.text(String(v), xs[i], y + 6));

      y += 32;
    });

    pdf.font("Inter-Bold").fontSize(9)
      .text(`Total Items: ${order.items.length}`, 40, y + 10);

    const blockY = y + 28;

    /* QR */
    pdf.image(qrBuffer, 40, blockY, { width: 85 });

    pdf.font("Inter").fontSize(8).fillColor("#6b7280");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 135, blockY + 10);
    pdf.text(`Hash: ${invoiceHash}`, 135, blockY + 26);

    /* SIGNATURE */
    pdf.font("Inter-Bold").fontSize(10).fillColor("#111827")
      .text(`For ${company.companyName}`, 145, blockY + 55);

    const signPath = path.join(process.cwd(), "public/signature.png");

    if (fs.existsSync(signPath)) {
      pdf.image(signPath, 145, blockY + 70, { width: 120 });
    }

    pdf.font("Inter").fontSize(9)
      .text("Authorised Signatory", 145, blockY + 128);

    /* SUMMARY */
    pdf.roundedRect(325, blockY, 230, 165, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold").fontSize(12)
      .text("GST Summary", 340, blockY + 18);

    const rows = [
      ["Taxable Amount", gst.taxable],
      ["Discount", order.billing?.discount || 0],
      ["CGST", gst.cgst],
      ["SGST", gst.sgst],
      ["IGST", gst.igst]
    ];

    let sy = blockY + 48;

    rows.forEach(([label, val]) => {
      pdf.font("Inter").fontSize(10);
      pdf.text(label, 340, sy);
      pdf.text(money(val), 470, sy);
      sy += 28;
    });

    pdf.font("Inter-Bold").fontSize(13).fillColor("#16a34a");
    pdf.text("Grand Total", 340, sy + 6);
    pdf.text(money(order.billing?.grandTotal), 450, sy + 6);

    /* FOOTER FIXED */
    const footerY = PAGE_HEIGHT - FOOTER_HEIGHT;

    line(pdf, footerY);

    pdf.font("Inter").fontSize(8).fillColor("#6b7280")
      .text(
        "Certified that the particulars given above are true and correct. This is a computer-generated tax invoice.",
        40,
        footerY + 14,
        { width: 400 }
      );

    pdf.font("Inter").fontSize(9).fillColor("#dc2626")
      .text(
        "Thank You for Shopping with Native ❤️",
        0,
        footerY + 42,
        { width: 595, align: "center" }
      );

    pdf.end();

    const pdfBuffer = await new Promise((resolve) => {
      pdf.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${invoiceNumber}.pdf`,
      },
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
