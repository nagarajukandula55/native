// lib/invoice/invoice.engine.js

import { createPDF } from "@/lib/pdfSetup";
import { calculateGSTSummary } from "@/lib/gst";
import fs from "fs";
import path from "path";

import {
  money,
  line,
  checkPage,
  getPDFBuffer,
} from "./invoice.helpers";

import {
  generateInvoiceHash,
  generateQR,
  BASE_URL,
} from "./invoice.security";

export async function buildInvoicePDF({
  order,
  company,
  invoiceNumber,
}) {
  const gst = calculateGSTSummary(order, company?.state || "");

  const hash = generateInvoiceHash(order, invoiceNumber);

  const qrBuffer = await generateQR({
    invoice: invoiceNumber,
    orderId: order.orderId,
    amount: order.billing?.grandTotal,
    hash,
    verifyUrl: `${BASE_URL}/invoice/verify/${order.orderId}`,
  });

  const pdf = createPDF();
  pdf.font("Inter");

  const chunks = [];
  pdf.on("data", (c) => chunks.push(c));

  /* =========================================
     WATERMARK (UNCHANGED)
  ========================================= */
  pdf.save();
  pdf.rotate(-32, { origin: [300, 380] });

  pdf
    .opacity(0.045)
    .font("Inter-Bold")
    .fontSize(58)
    .fillColor("#d1d5db")
    .text(company?.companyName || "NATIVE", 60, 360, {
      width: 480,
      align: "center",
    });

  if (company?.tagline) {
    pdf
      .opacity(0.03)
      .font("Inter")
      .fontSize(18)
      .fillColor("#e5e7eb")
      .text(company.tagline, 120, 425, {
        width: 360,
        align: "center",
      });
  }

  pdf.restore();

  /* =========================================
     LOGO
  ========================================= */
  if (company?.logoUrl) {
    try {
      const logoPath = path.join(
        process.cwd(),
        "public",
        company.logoUrl.replace(/^\/+/, "")
      );

      if (fs.existsSync(logoPath)) {
        pdf.image(logoPath, 40, 35, { width: 62 });
      }
    } catch {}
  }

  /* =========================================
     COMPANY DETAILS
  ========================================= */
  pdf.font("Inter-Bold").fontSize(22).fillColor("#111827");
  pdf.text(company?.companyName || "COMPANY", 118, 38);

  pdf.font("Inter").fontSize(10).fillColor("#6b7280");
  pdf.text(company?.tagline || "", 118, 66);

  pdf.fontSize(10).fillColor("#4b5563");
  pdf.text(company?.addressLine1 || "", 118, 88);

  pdf.text(`City: ${company?.city || ""}`, 118, 102);
  pdf.text(`State: ${company?.state || ""}`, 118, 116);
  pdf.text(`PIN Code: ${company?.pincode || ""}`, 118, 130);
  pdf.text(`GSTIN: ${company?.gstin || "-"}`, 118, 144);
  pdf.text(`Phone: ${company?.phone || "-"}`, 118, 158);

  /* =========================================
     TAX BOX
  ========================================= */
  pdf.roundedRect(360, 35, 195, 138, 10).fillAndStroke("#f9fafb", "#d1d5db");

  pdf.font("Inter-Bold").fontSize(18).fillColor("#111827");
  pdf.text("TAX INVOICE", 386, 52);

  pdf.font("Inter").fontSize(10).fillColor("#374151");

  pdf.text("Invoice No", 385, 90);
  pdf.text(invoiceNumber, 385, 104);
  pdf.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 385, 128);
  pdf.text(`Order ID: ${order.orderId}`, 385, 146);

  line(pdf, 190);

  /* =========================================
     BILL TO
  ========================================= */
  pdf.font("Inter-Bold").fontSize(13).text("Bill To", 40, 205);

  pdf.font("Inter").fontSize(10);
  pdf.text(order.address?.name || "", 40, 228);
  pdf.text(order.address?.phone || "", 40);
  pdf.text(order.address?.address || "", 40, undefined, { width: 150 });

  /* =========================================
     SHIP TO
  ========================================= */
  pdf.font("Inter-Bold").text("Ship To", 220, 205);

  pdf.font("Inter");
  pdf.text(order.shippingAddress?.name || order.address?.name || "", 220, 228);

  /* =========================================
     PAYMENT
  ========================================= */
  pdf.font("Inter-Bold").text("Payment Details", 410, 205);

  pdf.font("Inter");
  pdf.text(`Method: ${order.payment?.method || "-"}`, 410, 228);

  /* =========================================
     TABLE
  ========================================= */
  line(pdf, 360);

  const tableTop = 375;

  pdf.rect(40, tableTop, 515, 28).fill("#111827");

  pdf.font("Inter-Bold").fillColor("#fff").fontSize(9);

  pdf.text("#", 45, 384);
  pdf.text("Product", 65, 384);
  pdf.text("HSN", 205, 384);
  pdf.text("Qty", 255, 384);
  pdf.text("Rate", 295, 384);
  pdf.text("GST%", 355, 384);
  pdf.text("Taxable", 410, 384);
  pdf.text("Total", 490, 384);

  let y = 408;

  pdf.font("Inter").fillColor("#111827");

  order.items?.forEach((item, idx) => {
    y = checkPage(pdf, y);

    pdf.rect(40, y - 5, 515, 32).stroke("#e5e7eb");

    pdf.text(String(idx + 1), 45, y + 5);
    pdf.text(item.name || "", 65, y + 5, { width: 130 });

    pdf.text(String(item.qty || 1), 255, y + 5);
    pdf.text(money(item.price), 295, y + 5);
    pdf.text(money(item.total), 490, y + 5);

    y += 32;
  });

  /* =========================================
     GST SUMMARY
  ========================================= */
  const summaryTop = y + 25;

  pdf.roundedRect(325, summaryTop, 230, 180, 10).fillAndStroke("#f9fafb", "#d1d5db");

  pdf.font("Inter-Bold").fontSize(12).text("GST Summary", 340, summaryTop + 12);

  pdf.font("Inter").fontSize(10);

  pdf.text(money(gst.taxable), 475, summaryTop + 40);
  pdf.text(money(order.billing?.grandTotal), 465, summaryTop + 152);

  /* =========================================
     QR
  ========================================= */
  pdf.image(qrBuffer, 460, summaryTop + 160, { width: 70 });

  pdf.text("Scan to verify", 455, summaryTop + 230);

  /* =========================================
     FOOTER SAFE
  ========================================= */
  pdf
    .font("Inter")
    .fontSize(8)
    .fillColor("#6b7280")
    .text("Thanks for Shopping With Native ❤️", 40, 780, {
      align: "center",
      width: 515,
    });

  return getPDFBuffer(pdf, chunks);
}
