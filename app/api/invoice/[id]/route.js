// app/api/invoice/[id]/route.js

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

/* =========================================
   MONEY FORMAT
========================================= */

const money = (n) =>
  `₹${Number(n || 0).toFixed(2)}`;

/* =========================================
   DRAW LINE
========================================= */

const line = (
  pdf,
  y,
  color = "#d1d5db"
) => {
  pdf
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(40, y)
    .lineTo(555, y)
    .stroke();
};

/* =========================================
   GST INVOICE ENGINE
========================================= */

export async function GET(
  req,
  { params }
) {
  try {

    await dbConnect();

    const { id } = params;

    /* =========================================
       ORDER
    ========================================= */

    const order = await Order.findOne({
      orderId: id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    /* =========================================
       COMPANY
    ========================================= */

    const company =
      await CompanySettings.findOne().lean();

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Company settings missing",
        },
        { status: 500 }
      );
    }

    /* =========================================
       INVOICE NUMBER
    ========================================= */

    let invoiceNumber =
      order.invoice?.invoiceNumber;

    if (!invoiceNumber) {

      const count =
        await Order.countDocuments({
          "invoice.invoiceNumber": {
            $exists: true,
          },
        });

      invoiceNumber =
        generateInvoiceNumber(count);

      await Order.updateOne(
        {
          _id: order._id,
        },
        {
          $set: {
            "invoice.invoiceNumber":
              invoiceNumber,

            "invoice.generatedAt":
              new Date(),

            "billing.locked": true,
          },
        }
      );
    }

    /* =========================================
       GST SUMMARY
    ========================================= */

    const gst =
      calculateGSTSummary(
        order,
        company?.state || ""
      );

    /* =========================================
       PDF INIT
    ========================================= */

    const pdf = createPDF();

    pdf.font("Inter");

    const chunks = [];

    pdf.on("data", (chunk) => {
      chunks.push(chunk);
    });

    /* =========================================
       WATERMARK
    ========================================= */

    pdf.save();

    pdf.opacity(0.05);

    if (company?.logoUrl) {

      try {

        const watermarkPath = path.join(
          process.cwd(),
          "public",
          company.logoUrl
        );

        if (
          fs.existsSync(watermarkPath)
        ) {

          pdf.image(
            watermarkPath,
            140,
            220,
            {
              width: 300,
            }
          );
        }

      } catch (e) {
        console.log(
          "WATERMARK ERROR:",
          e
        );
      }

    } else {

      pdf
        .font("Inter-Bold")
        .fontSize(60)
        .fillColor("#111827")
        .text(
          company?.companyName ||
            "NATIVE",
          100,
          350,
          {
            align: "center",
          }
        );
    }

    pdf.restore();

    /* =========================================
       HEADER
    ========================================= */

    if (company?.logoUrl) {

      try {

        const logoPath = path.join(
          process.cwd(),
          "public",
          company.logoUrl
        );

        if (
          fs.existsSync(logoPath)
        ) {

          pdf.image(
            logoPath,
            40,
            35,
            {
              width: 65,
            }
          );
        }

      } catch (e) {

        console.log(
          "LOGO ERROR:",
          e.message
        );
      }
    }

    pdf
      .font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(22)
      .text(
        company?.companyName ||
          "COMPANY",
        120,
        38,
        {
          width: 230,
        }
      );

    pdf
      .font("Inter")
      .fontSize(10)
      .fillColor("#4b5563")
      .text(
        company?.addressLine1 || "",
        120,
        78
      );

    pdf.text(
      `${company?.city || ""} - ${
        company?.pincode || ""
      }`,
      120
    );

    pdf.text(
      `GSTIN: ${
        company?.gstin || "-"
      }`,
      120
    );

    pdf.text(
      `Phone: ${
        company?.phone || "-"
      }`,
      120
    );

    pdf.text(
      `Email: ${
        company?.email || "-"
      }`,
      120
    );

    /* =========================================
       TAX INVOICE BOX
    ========================================= */

    pdf
      .roundedRect(
        365,
        35,
        190,
        140,
        10
      )
      .fillAndStroke(
        "#f9fafb",
        "#d1d5db"
      );

    pdf
      .font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(18)
      .text(
        "TAX INVOICE",
        388,
        52
      );

   pdf
     .font("Inter")
     .fontSize(10)
     .fillColor("#374151");
   
   pdf.text(
     "Invoice No:",
     388,
     92
   );
   
   pdf.text(
     invoiceNumber,
     388,
     106,
     {
       width: 150,
     }
   );
   
   pdf.text(
     `Invoice Date: ${new Date(
       order.createdAt
     ).toLocaleDateString()}`,
     388,
     132
   );
   
   pdf.text(
     `Order ID: ${order.orderId}`,
     388,
     148,
     {
       width: 150,
     }
   );

    /* =========================================
       LINE
    ========================================= */

    line(pdf, 170);

    /* =========================================
       BILL TO
    ========================================= */

    pdf
      .font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Bill To",
        40,
        185
      );

    pdf
      .font("Inter")
      .fontSize(10)
      .fillColor("#374151")
      .text(
        order.address?.name || "",
        40,
        208
      );

    pdf.text(
      order.address?.phone || "",
      40
    );

    pdf.text(
      order.address?.address || "",
      40,
      undefined,
      {
        width: 180,
      }
    );

    pdf.text(
      `${order.address?.city || ""}, ${
        order.address?.state || ""
      } - ${
        order.address?.pincode || ""
      }`,
      40
    );

    pdf.text(
      `GSTIN: ${
        order.address?.gstNumber ||
        "B2C CUSTOMER"
      }`,
      40
    );

    /* =========================================
       SHIP TO
    ========================================= */

    pdf
      .font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Ship To",
        230,
        185
      );

    pdf
      .font("Inter")
      .fontSize(10)
      .fillColor("#374151")
      .text(
        order.shippingAddress?.name ||
        order.address?.name ||
        "",
        230,
        208
      );

    pdf.text(
      order.shippingAddress?.phone ||
      order.address?.phone ||
      "",
      230
    );

    pdf.text(
      order.shippingAddress?.address ||
      order.address?.address ||
      "",
      230,
      undefined,
      {
        width: 180,
      }
    );

    pdf.text(
      `${
        order.shippingAddress?.city ||
        order.address?.city ||
        ""
      }, ${
        order.shippingAddress?.state ||
        order.address?.state ||
        ""
      } - ${
        order.shippingAddress?.pincode ||
        order.address?.pincode ||
        ""
      }`,
      230
    );

    /* =========================================
       PAYMENT DETAILS
    ========================================= */

    pdf
      .font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Payment Details",
        420,
        185
      );

    pdf
      .font("Inter")
      .fontSize(10)
      .fillColor("#374151")
      .text(
        `Method: ${
          order.payment?.method ||
          "-"
        }`,
        420,
        208
      );

    pdf.text(
      `Status: ${
        order.payment?.status ||
        "-"
      }`,
      420
    );

    pdf.text(
      `Transaction ID: ${
        order.payment
          ?.razorpay_payment_id ||
        order.payment
          ?.transactionId ||
        "-"
      }`,
      420,
      undefined,
      {
        width: 120,
      }
    );

    line(pdf, 330);

    /* =========================================
       TABLE HEADER
    ========================================= */

    const tableTop = 345;

    pdf
      .rect(
        40,
        tableTop,
        515,
        28
      )
      .fill("#111827");

    pdf
      .font("Inter-Bold")
      .fillColor("#ffffff")
      .fontSize(9);

    pdf.text("#", 45, 354);

    pdf.text(
      "Product",
      65,
      354
    );

    pdf.text(
      "HSN",
      205,
      354
    );

    pdf.text(
      "Qty",
      255,
      354
    );

    pdf.text(
      "Rate",
      295,
      354
    );

    pdf.text(
      "GST%",
      355,
      354
    );

    pdf.text(
      "Taxable",
      410,
      354
    );

    pdf.text(
      "Total",
      490,
      354
    );

    /* =========================================
       ITEMS
    ========================================= */

    let y = 378;

    pdf
      .font("Inter")
      .fillColor("#111827");

    order.items?.forEach(
      (item, idx) => {

        pdf
          .rect(
            40,
            y - 5,
            515,
            32
          )
          .stroke("#e5e7eb");

        pdf.text(
          String(idx + 1),
          45,
          y + 5
        );

        pdf.text(
          item.name || "",
          65,
          y + 5,
          {
            width: 130,
          }
        );

        pdf.text(
          item.snapshot?.hsn ||
            item.hsn ||
            "-",
          205,
          y + 5
        );

        pdf.text(
          String(item.qty || 1),
          255,
          y + 5
        );

        pdf.text(
          money(item.price),
          295,
          y + 5
        );

        pdf.text(
          `${item.gstPercent || 0}%`,
          355,
          y + 5
        );

        pdf.text(
          money(
            item.taxableAmount
          ),
          410,
          y + 5
        );

        pdf.text(
          money(item.total),
          490,
          y + 5
        );

        y += 32;
      }
    );

    /* =========================================
       GST SUMMARY BOX
    ========================================= */

    const summaryTop = y + 25;

    pdf
      .roundedRect(
        325,
        summaryTop,
        230,
        180,
        10
      )
      .fillAndStroke(
        "#f9fafb",
        "#d1d5db"
      );

    pdf.fillColor("#111827");

    pdf
      .font("Inter-Bold")
      .fontSize(12)
      .text(
        "GST Summary",
        340,
        summaryTop + 12
      );

    pdf
      .font("Inter")
      .fontSize(10)
      .text(
        `Taxable Amount`,
        340,
        summaryTop + 40
      );

    pdf.text(
      money(gst.taxable),
      475,
      summaryTop + 40
    );

    pdf.text(
      `Discount`,
      340,
      summaryTop + 62
    );

    pdf.text(
      money(
        order.billing?.discount || 0
      ),
      475,
      summaryTop + 62
    );

    pdf.text(
      `CGST`,
      340,
      summaryTop + 84
    );

    pdf.text(
      money(gst.cgst),
      475,
      summaryTop + 84
    );

    pdf.text(
      `SGST`,
      340,
      summaryTop + 106
    );

    pdf.text(
      money(gst.sgst),
      475,
      summaryTop + 106
    );

    pdf.text(
      `IGST`,
      340,
      summaryTop + 128
    );

    pdf.text(
      money(gst.igst),
      475,
      summaryTop + 128
    );

    pdf
      .font("Inter-Bold")
      .fontSize(13)
      .fillColor("#16a34a")
      .text(
        `Grand Total`,
        340,
        summaryTop + 152
      );

    pdf.text(
      money(
        order.billing
          ?.grandTotal
      ),
      465,
      summaryTop + 152
    );

    /* =========================================
       DECLARATION
    ========================================= */

    const declarationTop =
      summaryTop + 215;

    pdf
      .font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(11)
      .text(
        "Declaration",
        40,
        declarationTop
      );

    pdf
      .font("Inter")
      .fontSize(9)
      .fillColor("#4b5563")
      .text(
        "Certified that the particulars given above are true and correct. This invoice is generated electronically and is valid without physical signature.",
        40,
        declarationTop + 18,
        {
          width: 320,
          align: "justify",
        }
      );

    /* =========================================
       SIGNATURE
    ========================================= */

    if (company?.signatureUrl) {

      try {

        const signPath = path.join(
          process.cwd(),
          "public",
          company.signatureUrl
        );

        if (
          fs.existsSync(signPath)
        ) {

          pdf.image(
            signPath,
            400,
            declarationTop - 20,
            {
              width: 120,
            }
          );
        }

      } catch (e) {

        console.log(
          "SIGN ERROR:",
          e.message
        );
      }
    }

    pdf
      .font("Inter-Bold")
      .fillColor("#111827")
      .fontSize(10)
      .text(
        "Authorized Signatory",
        395,
        declarationTop + 70
      );

    /* =========================================
       FOOTER
    ========================================= */

    pdf
      .font("Inter")
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "Thanks for Shopping With Native ❤️",
        40,
        780,
        {
          align: "center",
          width: 515,
        }
      );

    /* =========================================
       END PDF
    ========================================= */

    pdf.end();

    const pdfBuffer =
      await new Promise(
        (resolve) => {

          pdf.on("end", () => {

            resolve(
              Buffer.concat(chunks)
            );
          });
        }
      );

    return new NextResponse(
      pdfBuffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename=${invoiceNumber}.pdf`,
        },
      }
    );

  } catch (err) {

    console.log(
      "GST INVOICE ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to generate invoice",
      },
      { status: 500 }
    );
  }
}
