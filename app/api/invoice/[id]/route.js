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

/* =========================================
   CONFIG
========================================= */
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000";

/* =========================================
   HELPERS
========================================= */
const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

const line = (pdf, y, color = "#d1d5db") => {
  pdf.strokeColor(color).lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();
};

const checkPage = (pdf, y) => {
  if (y > 690) {
    pdf.addPage();
    return 60;
  }
  return y;
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

/* =========================================
   MAIN
========================================= */
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

    /* =========================================
       WATERMARK
    ========================================= */
    pdf.save();

    pdf.rotate(-35, { origin: [300, 400] });

    pdf
      .opacity(0.09)
      .font("Inter-Bold")
      .fontSize(72)
      .fillColor("#d1d5db")
      .text(company?.companyName || "NATIVE", 50, 350, {
        width: 500,
        align: "center",
      });

    if (company?.tagline) {
      pdf
        .opacity(0.05)
        .font("Inter")
        .fontSize(20)
        .fillColor("#e5e7eb")
        .text(company.tagline, 110, 430, {
          width: 380,
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
       COMPANY HEADER
    ========================================= */
    pdf.font("Inter-Bold").fontSize(22).fillColor("#111827")
      .text(company?.companyName || "COMPANY", 118, 38);

    pdf.font("Inter").fontSize(10).fillColor("#6b7280")
      .text(company?.tagline || "", 118, 66);

    pdf.text(company?.addressLine1 || "", 118, 88);
    pdf.text(`City: ${company?.city || ""}`, 118, 104);
    pdf.text(`State: ${company?.state || ""}`, 118, 118);
    pdf.text(`PIN Code: ${company?.pincode || ""}`, 118, 132);
    pdf.text(`GSTIN: ${company?.gstin || "-"}`, 118, 146);
    pdf.text(`Phone: ${company?.phone || "-"}`, 118, 160);
    pdf.text(`Email: ${company?.email || "-"}`, 118, 174);

    /* =========================================
       INVOICE BOX
    ========================================= */
    pdf.roundedRect(360, 35, 195, 150, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold").fontSize(18).fillColor("#111827")
      .text("TAX INVOICE", 386, 52);

    pdf.font("Inter").fontSize(10).fillColor("#374151");

    pdf.text(`Invoice No: ${invoiceNumber}`, 385, 92);
    pdf.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 385, 112);
    pdf.text(`Order ID: ${order.orderId}`, 385, 132);

    line(pdf, 205);

    /* =========================================
       BILL / SHIP / PAYMENT
    ========================================= */
    const top = 220;
    const addressY = top + 18;

    pdf.font("Inter-Bold").fontSize(11).text("Bill To", 40, top);
    pdf.font("Inter").fontSize(9);

    let billY = addressY;
    pdf.text(order.address?.name || "-", 40, billY); billY += 15;
    pdf.text(order.address?.phone || "-", 40, billY); billY += 15;

    if (order.address?.address) {
      pdf.text(order.address.address, 40, billY, { width: 150 });
      billY += 32;
    }

    pdf.text(`City: ${order.address?.city || "-"}`, 40, billY); billY += 15;
    pdf.text(`State: ${order.address?.state || "-"}`, 40, billY); billY += 15;
    pdf.text(`PIN: ${order.address?.pincode || "-"}`, 40, billY); billY += 15;
    pdf.text(order.address?.email || "-", 40, billY);

    pdf.font("Inter-Bold").text("Ship To", 220, top);
    pdf.font("Inter");

    let shipY = addressY;
    pdf.text(order.address?.name || "-", 220, shipY); shipY += 15;
    pdf.text(order.address?.phone || "-", 220, shipY); shipY += 15;

    if (order.address?.address) {
      pdf.text(order.address.address, 220, shipY, { width: 150 });
      shipY += 32;
    }

    pdf.text(`City: ${order.address?.city || "-"}`, 220, shipY); shipY += 15;
    pdf.text(`State: ${order.address?.state || "-"}`, 220, shipY); shipY += 15;
    pdf.text(`PIN: ${order.address?.pincode || "-"}`, 220, shipY); shipY += 15;
    pdf.text(order.address?.email || "-", 220, shipY);

    pdf.font("Inter-Bold").text("Payment", 410, top);
    pdf.font("Inter");

    pdf.text(`Method: ${order.payment?.method || "-"}`, 410, addressY);
    pdf.text(`Status: ${order.payment?.status || "-"}`, 410, addressY + 14);
    pdf.text(`Paid: ${money(order.payment?.amountPaid)}`, 410, addressY + 28);
    pdf.text(`Txn ID: ${order.payment?.transactionId || "-"}`, 410, addressY + 42);
    pdf.text(`UTR: ${order.payment?.utr || "-"}`, 410, addressY + 56);

    line(pdf, 360);

    /* =========================================
       TABLE
    ========================================= */
    let y = 375;

    pdf.rect(40, y, 515, 28).fill("#111827");

    pdf.font("Inter-Bold").fillColor("#fff").fontSize(9);

    pdf.text("#", 45, y + 9);
    pdf.text("Product", 65, y + 9);
    pdf.text("HSN", 205, y + 9);
    pdf.text("Qty", 255, y + 9);
    pdf.text("Rate", 295, y + 9);
    pdf.text("GST%", 355, y + 9);
    pdf.text("Taxable", 410, y + 9);
    pdf.text("Total", 490, y + 9);

    y += 35;

    pdf.font("Inter").fillColor("#111827");

    order.items?.forEach((item, idx) => {
      y = checkPage(pdf, y);

      pdf.rect(40, y - 4, 515, 30).stroke("#e5e7eb");

      pdf.text(String(idx + 1), 45, y + 6);
      pdf.text(item.name || "", 65, y + 6, { width: 130 });
      pdf.text(item.snapshot?.hsn || "-", 205, y + 6);
      pdf.text(String(item.qty || 1), 255, y + 6);
      pdf.text(money(item.price), 295, y + 6);
      pdf.text(`${item.gstPercent || 0}%`, 355, y + 6);
      pdf.text(money(item.taxableAmount), 410, y + 6);
      pdf.text(money(item.total), 490, y + 6);

      y += 32;
    });

    /* =========================================
       QR + SUMMARY
    ========================================= */
    const blockY = y + 20;

    pdf.image(qrBuffer, 40, blockY, { width: 90 });

    pdf.fontSize(8).fillColor("#6b7280");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 140, blockY + 10);
    pdf.text(`Hash: ${invoiceHash}`, 140, blockY + 28, { width: 160 });

    pdf.roundedRect(325, blockY, 230, 170, 10)
      .fillAndStroke("#f9fafb", "#d1d5db");

    pdf.font("Inter-Bold").fontSize(12).fillColor("#111827")
      .text("GST Summary", 340, blockY + 12);

    pdf.font("Inter").fontSize(10);

    pdf.text("Taxable Amount", 340, blockY + 40);
    pdf.text(money(gst.taxable), 470, blockY + 40);

    pdf.text("Discount", 340, blockY + 62);
    pdf.text(money(order.billing?.discount || 0), 470, blockY + 62);

    pdf.text("CGST", 340, blockY + 84);
    pdf.text(money(gst.cgst), 470, blockY + 84);

    pdf.text("SGST", 340, blockY + 106);
    pdf.text(money(gst.sgst), 470, blockY + 106);

    pdf.text("IGST", 340, blockY + 128);
    pdf.text(money(gst.igst), 470, blockY + 128);

    pdf.font("Inter-Bold").fontSize(13).fillColor("#16a34a");
    pdf.text("Grand Total", 340, blockY + 150);
    pdf.text(money(order.billing?.grandTotal), 450, blockY + 150);

    /* =========================================
       FOOTER
    ========================================= */
    const footerY = blockY + 190;

    line(pdf, footerY);

    pdf.font("Inter-Bold")
      .fontSize(10)
      .fillColor("#111827")
      .text(`For ${company?.companyName || "COMPANY"}`, 390, footerY - 8);

    pdf.font("Inter")
      .fontSize(9)
      .text("Authorised Signatory", 390, footerY + 12);

    pdf.font("Inter").fontSize(8).fillColor("#6b7280")
      .text("Certified that the particulars given above are true and correct.", 40, footerY + 12);

    pdf.text("This is a computer-generated tax invoice.", 40, footerY + 26);

    pdf.font("Inter").fontSize(9).fillColor("#dc2626")
      .text("Thank You for Shopping with Native ❤️", 170, footerY + 50);

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
      {
        success: false,
        message: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
