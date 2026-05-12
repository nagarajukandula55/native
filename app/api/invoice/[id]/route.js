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

/* ========================================= */
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const line = (pdf, y, color = "#d1d5db") => {
  pdf.strokeColor(color).lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();
};

const generateInvoiceHash = (order, invoiceNumber) => {
  return crypto
    .createHash("sha256")
    .update(`${order.orderId}-${invoiceNumber}-${order.createdAt}`)
    .digest("hex")
    .slice(0, 20)
    .toUpperCase();
};

const generateQR = async (payload) => {
  return await QRCode.toBuffer(JSON.stringify(payload), {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 1,
    scale: 6,
  });
};

/* ========================================= */
export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await Order.findOne({ orderId: id }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const company = await CompanySettings.findOne().lean();

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company settings missing" },
        { status: 500 }
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

    const gst = calculateGSTSummary(order, company?.state || "");
    const invoiceHash = generateInvoiceHash(order, invoiceNumber);

    const qrBuffer = await generateQR({
      invoice: invoiceNumber,
      orderId: order.orderId,
      amount: order.billing?.grandTotal,
      gstin: company?.gstin || "-",
      hash: invoiceHash,
      verifyUrl: `${BASE_URL}/invoice/verify/${order.orderId}`,
    });

    const pdf = createPDF();
    const chunks = [];
    pdf.on("data", (c) => chunks.push(c));

    /* ================= WATERMARK ================= */
    pdf.save();
    pdf.rotate(-32, { origin: [300, 380] });

    pdf
      .opacity(0.035)
      .font("Inter-Bold")
      .fontSize(60)
      .fillColor("#d1d5db")
      .text(company?.companyName || "NATIVE", 60, 360, {
        width: 480,
        align: "center",
      });

    pdf.restore();

    /* ================= LOGO ================= */
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

    /* ================= COMPANY ================= */
    pdf.font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(22)
      .text(company?.companyName || "COMPANY", 118, 38);

    pdf.font("Inter")
      .fontSize(10)
      .fillColor("#6b7280")
      .text(company?.tagline || "", 118, 66);

    pdf.font("Inter")
      .fontSize(9)
      .fillColor("#4b5563")
      .text(company?.addressLine1 || "", 118, 88)
      .text(company?.addressLine2 || "", 118, 102)
      .text(
        `${company?.city || ""}, ${company?.state || ""} - ${company?.pincode || ""}`,
        118,
        116
      )
      .text(`Email: ${company?.email || "-"}`, 118, 130)
      .text(`Phone: ${company?.phone || "-"}`, 118, 144)
      .text(`GSTIN: ${company?.gstin || "-"}`, 118, 158);

    /* ================= INVOICE BOX ================= */
    pdf.roundedRect(360, 35, 195, 138, 10).fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(18)
      .text("TAX INVOICE", 386, 52);

    pdf.font("Inter")
      .fontSize(10)
      .fillColor("#374151")
      .text("Invoice No", 385, 90)
      .text(invoiceNumber, 385, 104)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 385, 128)
      .text(`Order: ${order.orderId}`, 385, 146);

    line(pdf, 190);

    /* ================= BILL / SHIP / PAYMENT ================= */
    pdf.font("Inter-Bold").fontSize(11).text("Bill To", 40, 210);
    pdf.font("Inter").fontSize(9);

    pdf.text(order.address?.name || "-", 40, 230);
    pdf.text(order.address?.phone || "-", 40, 244);
    pdf.text(order.address?.email || "-", 40, 258);
    pdf.text(order.address?.address || "-", 40, 272, { width: 150 });
    pdf.text(`${order.address?.city || ""}, ${order.address?.state || ""}`, 40, 308);
    pdf.text(`PIN: ${order.address?.pincode || "-"}`, 40, 322);

    pdf.font("Inter-Bold").text("Ship To", 220, 210);
    pdf.font("Inter");

    pdf.text(order.address?.name || "-", 220, 230);
    pdf.text(order.address?.phone || "-", 220, 244);
    pdf.text(order.address?.address || "-", 220, 258, { width: 150 });
    pdf.text(`${order.address?.city || ""}, ${order.address?.state || ""}`, 220, 294);
    pdf.text(`PIN: ${order.address?.pincode || "-"}`, 220, 308);

    pdf.font("Inter-Bold").text("Payment", 410, 210);
    pdf.font("Inter");

    pdf.text(`Method: ${order.payment?.method || "-"}`, 410, 230);
    pdf.text(`Status: ${order.payment?.status || "-"}`, 410, 244);
    pdf.text(
      `Paid: ${money(order.payment?.amountPaid || order.billing?.grandTotal)}`,
      410,
      258
    );

    /* ================= TABLE ================= */
    line(pdf, 360);

    pdf.rect(40, 375, 515, 28).fill("#111827");

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
      pdf.rect(40, y - 5, 515, 32).stroke("#e5e7eb");

      pdf.text(String(idx + 1), 45, y + 5);
      pdf.text(item.name || "", 65, y + 5, { width: 130 });
      pdf.text(item.snapshot?.hsn || "-", 205, y + 5);
      pdf.text(String(item.qty || 1), 255, y + 5);
      pdf.text(money(item.price), 295, y + 5);
      pdf.text(`${item.gstPercent || 0}%`, 355, y + 5);
      pdf.text(money(item.taxableAmount), 410, y + 5);
      pdf.text(money(item.total), 490, y + 5);

      y += 32;
    });

    /* ================= GST SUMMARY ================= */
    const summaryTop = y + 20;

    pdf.roundedRect(325, summaryTop, 230, 150, 10).fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold").fontSize(12).fillColor("#111827")
      .text("GST Summary", 340, summaryTop + 12);

    pdf.font("Inter").fontSize(10);

    pdf.text("Taxable", 340, summaryTop + 40);
    pdf.text(money(gst.taxable), 475, summaryTop + 40);

    pdf.text("CGST", 340, summaryTop + 62);
    pdf.text(money(gst.cgst), 475, summaryTop + 62);

    pdf.text("SGST", 340, summaryTop + 84);
    pdf.text(money(gst.sgst), 475, summaryTop + 84);

    pdf.text("IGST", 340, summaryTop + 106);
    pdf.text(money(gst.igst), 475, summaryTop + 106);

    pdf.font("Inter-Bold").fillColor("#16a34a")
      .text("Grand Total", 340, summaryTop + 130);

    pdf.text(money(order.billing?.grandTotal), 465, summaryTop + 130);

    /* ================= QR ================= */
    pdf.image(qrBuffer, 470, summaryTop + 82, { width: 55 });

    /* ================= FOOTER ================= */
    const footerY = 735;

    line(pdf, footerY);

    pdf.font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text("Certified that the particulars given above are true and correct.", 40, footerY + 14)
      .text("This is a computer-generated tax invoice.", 40, footerY + 28);

    pdf.font("Inter-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(`For ${company?.companyName || "COMPANY"}`, 390, footerY + 14);

    pdf.font("Inter")
      .fontSize(9)
      .text("Authorised Signatory", 390, footerY + 34);

    pdf.font("Inter-Bold")
      .fontSize(10)
      .fillColor("#16a34a")
      .text("Thank You for Shopping with Native ♥", 145, footerY + 52, {
        width: 280,
        align: "center",
      });

    pdf.font("Inter")
      .fontSize(7)
      .fillColor("#9ca3af")
      .text(`Generated on ${new Date().toLocaleString()}`, 40, footerY + 75);

    pdf.text(`Invoice Hash: ${invoiceHash}`, 220, footerY + 75);

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
    console.error("INVOICE ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
