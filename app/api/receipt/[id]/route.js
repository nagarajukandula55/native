// app/api/receipt/[id]/route.js

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

import { buildReceiptData } from "@/lib/receipt/buildReceiptData";
import { renderReceiptPDF } from "@/lib/receipt/pdfReceiptTemplate";

import path from "path";
import fs from "fs";

export async function GET(req, { params }) {
  try {

    await dbConnect();

    /* =========================================
       ORDER
    ========================================= */

    const order = await Order.findOne({
      orderId: params.id,
    }).lean();

    if (!order) {

      return NextResponse.json(
        {
          success: false,
          message: "Order is not found",
        },
        { status: 404 }
      );
    }

    /* =========================================
       COMPANY
    ========================================= */

    const company =
      await CompanySettings.findOne().lean();

    /* =========================================
       RECEIPT DATA
    ========================================= */

    const data =
      buildReceiptData(order);

    /* =========================================
       PDF INIT
    ========================================= */

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      compress: true,
    });

    const chunks = [];

    doc.on("data", (c) =>
      chunks.push(c)
    );

    /* =========================================
       SAFE FONT
    ========================================= */

    doc.font("Helvetica");

    /* =========================================
       OPTIMIZED INVOICE LOGO
    ========================================= */

    try {

      const invoiceLogoPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "invoice-logo.jpg"
        );

      if (
        fs.existsSync(invoiceLogoPath)
      ) {

        company.invoiceLogoPath =
          invoiceLogoPath;
      }

    } catch (e) {

      console.log(
        "RECEIPT LOGO ERROR:",
        e.message
      );
    }

    /* =========================================
       OPTIMIZED SIGNATURE
    ========================================= */

    try {

      const invoiceSignPath =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "invoice-sign.jpg"
        );

      if (
        fs.existsSync(invoiceSignPath)
      ) {

        company.invoiceSignPath =
          invoiceSignPath;
      }

    } catch (e) {

      console.log(
        "RECEIPT SIGN ERROR:",
        e.message
      );
    }

    /* =========================================
       WATERMARK TEXT
    ========================================= */

    doc.save();

    doc.opacity(0.05);

    doc
      .font("Helvetica-Bold")
      .fontSize(55)
      .fillColor("#9ca3af")
      .rotate(-35, {
        origin: [300, 400],
      })
      .text(
        company?.companyName ||
          "NATIVE",
        120,
        380,
        {
          width: 350,
          align: "center",
        }
      );

    doc.restore();

    /* =========================================
       RENDER RECEIPT
    ========================================= */

    renderReceiptPDF(
      doc,
      data,
      company
    );

    /* =========================================
       END PDF
    ========================================= */

    doc.end();

    const buffer =
      await new Promise(
        (resolve) => {

          doc.on("end", () => {

            resolve(
              Buffer.concat(chunks)
            );
          });
        }
      );

    return new NextResponse(
      buffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename=RECEIPT-${order.orderId}.pdf`,
        },
      }
    );

  } catch (err) {

    console.error(
      "RECEIPT ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to generate receipt",
      },
      { status: 500 }
    );
  }
}
