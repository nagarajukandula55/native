// app/api/receipt/[id]/route.js

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

import { buildReceiptData } from "@/lib/receipt/buildReceiptData";
import { renderReceiptPDF } from "@/lib/receipt/pdfReceiptTemplate";

import { createPDF } from "@/lib/pdfSetup";

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

    const doc = createPDF();

    const chunks = [];

    doc.on("data", (c) =>
      chunks.push(c)
    );

    /* =========================================
       FORCE SAFE FONT
    ========================================= */

    doc.font("Inter");

    /* =========================================
       OPTIMIZED RECEIPT LOGO
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
       LIGHTWEIGHT WATERMARK
    ========================================= */

    doc.save();

    doc.rotate(-32, {
      origin: [300, 380],
    });

    doc
      .opacity(0.04)
      .font("Inter-Bold")
      .fontSize(54)
      .fillColor("#d1d5db")
      .text(
        company?.companyName ||
          "NATIVE",
        60,
        360,
        {
          width: 480,
          align: "center",
        }
      );

    if (company?.tagline) {

      doc
        .opacity(0.03)
        .font("Inter")
        .fontSize(18)
        .fillColor("#e5e7eb")
        .text(
          company.tagline,
          120,
          425,
          {
            width: 360,
            align: "center",
          }
        );
    }

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
