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
    pdf.rotate(-32, { origin: [300, 390] });

    pdf
      .opacity(0.06)
      .font("Inter-Bold")
      .fontSize(62)
      .fillColor("#d1d5db")
      .text(company?.companyName || "NATIVE", 50, 355, {
        width: 500,
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
      .text(company?.tagline || "", 118, 64);

    pdf.font("Inter")
      .fontSize(9)
      .fillColor("#4b5563")
      .text(company?.addressLine1 || "", 118, 88)
      .text(company?.addressLine2 || "", 118, 102)
      .text(`City: ${company?.city || "-"}`, 118, 118)
      .text(`State: ${company?.state || "-"}`, 118, 132)
      .text(`PIN Code: ${company?.pincode || "-"}`, 118, 146)
      .text(`Phone: ${company?.phone || "-"}`, 118, 160)
      .text(`Email: ${company?.email || "-"}`, 118, 174)
      .text(`GSTIN: ${company?.gstin || "-"}`, 118, 188);

    /* ================= INVOICE BOX ================= */
    pdf.roundedRect(360, 35, 195, 155, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold")
      .fontSize(18)
      .fillColor("#111827")
      .text("TAX INVOICE", 385, 52);

    pdf.font("Inter")
      .fontSize(10)
      .fillColor("#374151")
      .text(`Invoice No: ${invoiceNumber}`, 385, 92)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 385, 112)
      .text(`Order ID: ${order.orderId}`, 385, 132);

    line(pdf, 205);

    /* ================= BILL / SHIP / PAYMENT ================= */
    pdf.font("Inter-Bold").fontSize(11).text("Bill To", 40, 220);
    pdf.font("Inter").fontSize(9);

    pdf.text(order.address?.name || "-", 40, 240);
    pdf.text(order.address?.phone || "-", 40, 255);
    pdf.text(order.address?.email || "-", 40, 270);
    pdf.text(order.address?.address || "-", 40, 285, { width: 150 });
    pdf.text(`City: ${order.address?.city || "-"}`, 40, 325);
    pdf.text(`State: ${order.address?.state || "-"}`, 40, 340);
    pdf.text(`PIN: ${order.address?.pincode || "-"}`, 40, 355);

    pdf.font("Inter-Bold").text("Ship To", 220, 220);
    pdf.font("Inter");

    pdf.text(order.address?.name || "-", 220, 240);
    pdf.text(order.address?.phone || "-", 220, 255);
    pdf.text(order.address?.address || "-", 220, 270, { width: 150 });
    pdf.text(`City: ${order.address?.city || "-"}`, 220, 310);
    pdf.text(`State: ${order.address?.state || "-"}`, 220, 325);
    pdf.text(`PIN: ${order.address?.pincode || "-"}`, 220, 340);

    pdf.font("Inter-Bold").text("Payment", 410, 220);
    pdf.font("Inter");

    pdf.text(`Method: ${order.payment?.method || "-"}`, 410, 240);
    pdf.text(`Status: ${order.payment?.status || "-"}`, 410, 255);
    pdf.text(
      `Paid: ${money(order.payment?.amountPaid || order.billing?.grandTotal)}`,
      410,
      270
    );

    line(pdf, 380);

    /* ================= TABLE ================= */
    pdf.rect(40, 395, 515, 28).fill("#111827");

    pdf.font("Inter-Bold").fillColor("#fff").fontSize(9);

    pdf.text("#", 45, 404);
    pdf.text("Product", 65, 404);
    pdf.text("HSN", 205, 404);
    pdf.text("Qty", 255, 404);
    pdf.text("Rate", 295, 404);
    pdf.text("GST%", 355, 404);
    pdf.text("Taxable", 410, 404);
    pdf.text("Total", 490, 404);

    let y = 430;

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

    let summaryTop = y + 25;

    if (summaryTop + 260 > 780) {
      pdf.addPage();
      summaryTop = 60;
    }

    /* ================= QR BOX ================= */
    pdf.roundedRect(40, summaryTop, 250, 155, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf.image(qrBuffer, 55, summaryTop + 18, { width: 72 });

    pdf.font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text("Scan to Verify", 145, summaryTop + 20)
      .text(`Generated: ${new Date().toLocaleDateString()}`, 145, summaryTop + 45)
      .text(`Invoice Hash:`, 145, summaryTop + 70)
      .fontSize(7)
      .text(invoiceHash, 145, summaryTop + 84, { width: 120 });

    /* ================= GST SUMMARY ================= */
    pdf.roundedRect(305, summaryTop, 250, 155, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold")
      .fontSize(12)
      .fillColor("#111827")
      .text("GST Summary", 320, summaryTop + 12);

    pdf.font("Inter").fontSize(10);

    pdf.text("Taxable Amount", 320, summaryTop + 38);
    pdf.text(money(gst.taxable), 470, summaryTop + 38);

    pdf.text("Discount", 320, summaryTop + 58);
    pdf.text(money(order.billing?.discount || 0), 470, summaryTop + 58);

    pdf.text("CGST", 320, summaryTop + 78);
    pdf.text(money(gst.cgst), 470, summaryTop + 78);

    pdf.text("SGST", 320, summaryTop + 98);
    pdf.text(money(gst.sgst), 470, summaryTop + 98);

    pdf.text("IGST", 320, summaryTop + 118);
    pdf.text(money(gst.igst), 470, summaryTop + 118);

    pdf.font("Inter-Bold")
      .fontSize(12)
      .fillColor("#16a34a");

    pdf.text("Grand Total", 320, summaryTop + 140);
    pdf.text(money(order.billing?.grandTotal), 455, summaryTop + 140);

    /* ================= FOOTER ================= */
    const footerY = summaryTop + 185;

    line(pdf, footerY);

    pdf.font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "Certified that the particulars given above are true and correct.",
        40,
        footerY + 14
      );

    pdf.text(
      "This is a computer-generated tax invoice.",
      40,
      footerY + 28
    );

    pdf.font("Inter-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(`For ${company?.companyName}`, 390, footerY + 14);

    pdf.font("Inter")
      .fontSize(9)
      .text("Authorised Signatory", 390, footerY + 34);

    pdf.font("Inter-Bold")
      .fontSize(10)
      .fillColor("#16a34a")
      .text(
        "Thank You for Shopping with Native ♥",
        150,
        footerY + 58,
        { width: 260, align: "center" }
      );

    pdf.font("Inter")
      .fontSize(7)
      .fillColor("#9ca3af")
      .text(
        `Generated on ${new Date().toLocaleString()}`,
        40,
        footerY + 82
      );

    pdf.text(`Hash: ${invoiceHash}`, 240, footerY + 82);

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
