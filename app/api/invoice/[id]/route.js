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

    pdf.font("Times-Roman");

    const chunks = [];

    pdf.on("data", (chunk) => {
      chunks.push(chunk);
    });

/* =========================================
   PREMIUM LIGHT WATERMARK
   (LOW FILE SIZE OPTIMIZED)
========================================= */

   pdf.save();
   
   pdf.rotate(-32, {
     origin: [300, 380],
   });
   
   pdf
     .opacity(0.045)
     .font("Times-Bold")
     .fontSize(58)
     .fillColor("#d1d5db")
     .text(
       company?.companyName || "NATIVE",
       60,
       360,
       {
         width: 480,
         align: "center",
       }
     );
   
   /* OPTIONAL TAGLINE */
   
   if (company?.tagline) {
   
     pdf
       .opacity(0.035)
       .font("Times-Roman")
       .fontSize(20)
       .fillColor("#e5e7eb")
       .text(
         company.tagline,
         120,
         430,
         {
           width: 360,
           align: "center",
         }
       );
   }
   
   pdf.restore();
    /* =========================================
       HEADER LOGO
    ========================================= */

    if (company?.logoUrl) {

      try {

      const logoPath = path.join(
        process.cwd(),
        "public",
        company.logoUrl.replace(/^\/+/, "")
      );
      
      console.log("LOGO PATH:", logoPath);
      console.log("LOGO EXISTS:", fs.existsSync(logoPath));

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

    /* =========================================
       COMPANY DETAILS
    ========================================= */

    pdf
      .font("Times-Bold")
      .fillColor("#111827")
      .fontSize(22)
      .text(
        company?.companyName ||
          "COMPANY",
        120,
        38
      );

    /* TAGLINE */

    pdf
      .font("Times-Roman")
      .fontSize(10)
      .fillColor("#9ca3af")
      .text(
        company?.tagline ||
          "Eat Healthy, Stay Healthy",
        120,
        66
      );

    /* ADDRESS */

    pdf
      .font("Times-Roman")
      .fontSize(10)
      .fillColor("#4b5563")
      .text(
        company?.addressLine1 || "",
        120,
        88
      );

    pdf.text(
      `${company?.city || ""}, ${
        company?.state || ""
      } - ${
        company?.pincode || ""
      }`,
      120,
      102
    );

    pdf.text(
      `GSTIN: ${
        company?.gstin || "-"
      }`,
      120,
      116
    );

    pdf.text(
      `Phone: ${
        company?.phone || "-"
      }`,
      120,
      130
    );

    pdf.text(
      `Email: ${
        company?.email || "-"
      }`,
      120,
      144
    );

    /* =========================================
       TAX INVOICE BOX
    ========================================= */

    pdf
      .roundedRect(
        360,
        32,
        195,
        145,
        12
      )
      .fillAndStroke(
        "#f9fafb",
        "#d1d5db"
      );

    /* TITLE */

    pdf
      .font("Times-Bold")
      .fillColor("#111827")
      .fontSize(17)
      .text(
        "TAX INVOICE",
        385,
        50
      );

    /* DETAILS */

    pdf
      .font("Times-Roman")
      .fontSize(10)
      .fillColor("#374151");

    pdf.text(
      "Invoice No:",
      385,
      88
    );

    pdf.text(
      invoiceNumber,
      385,
      102,
      {
        width: 155,
      }
    );

    pdf.text(
      `Invoice Date: ${new Date(
        order.createdAt
      ).toLocaleDateString()}`,
      385,
      128
    );

    pdf.text(
      `Order ID: ${order.orderId}`,
      385,
      146,
      {
        width: 160,
      }
    );

    /* =========================================
       DIVIDER
    ========================================= */

    line(pdf, 185);

    /* =========================================
       BILL TO
    ========================================= */

    pdf
      .font("Times-Bold")
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Bill To",
        40,
        200
      );

    pdf
      .font("Times-Roman")
      .fontSize(10)
      .fillColor("#374151")
      .text(
        order.address?.name || "",
        40,
        223
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
        width: 150,
      }
    );

    pdf.text(
      `City: ${
        order.address?.city || ""
      }`,
      40
    );

    pdf.text(
      `State: ${
        order.address?.state || ""
      }`,
      40
    );

    pdf.text(
      `PIN Code: ${
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
      .font("Times-Bold")
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Ship To",
        220,
        200
      );

    pdf
      .font("Times-Roman")
      .fontSize(10)
      .fillColor("#374151")
      .text(
        order.shippingAddress?.name ||
        order.address?.name ||
        "",
        220,
        223
      );

    pdf.text(
      order.shippingAddress?.phone ||
      order.address?.phone ||
      "",
      220
    );

    pdf.text(
      order.shippingAddress?.address ||
      order.address?.address ||
      "",
      220,
      undefined,
      {
        width: 150,
      }
    );

    pdf.text(
      `City: ${
        order.shippingAddress?.city ||
        order.address?.city ||
        ""
      }`,
      220
    );

    pdf.text(
      `State: ${
        order.shippingAddress?.state ||
        order.address?.state ||
        ""
      }`,
      220
    );

    pdf.text(
      `PIN Code: ${
        order.shippingAddress?.pincode ||
        order.address?.pincode ||
        ""
      }`,
      220
    );

    /* =========================================
       PAYMENT DETAILS
    ========================================= */

    pdf
      .font("Times-Bold")
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Payment Details",
        410,
        200
      );

    pdf
      .font("Times-Roman")
      .fontSize(10)
      .fillColor("#374151")
      .text(
        `Method: ${
          order.payment?.method ||
          "-"
        }`,
        410,
        223
      );

    pdf.text(
      `Status: ${
        order.payment?.status ||
        "-"
      }`,
      410
    );

    pdf.text(
      `Transaction ID: ${
        order.payment
          ?.razorpay_payment_id ||
        order.payment
          ?.transactionId ||
        "-"
      }`,
      410,
      undefined,
      {
        width: 120,
      }
    );

    /* =========================================
       DIVIDER
    ========================================= */

    line(pdf, 360);

    /* =========================================
       TABLE HEADER
    ========================================= */

    const tableTop = 375;

    pdf
      .rect(
        40,
        tableTop,
        515,
        28
      )
      .fill("#111827");

    pdf
      .font("Times-Bold")
      .fillColor("#ffffff")
      .fontSize(9);

    pdf.text("#", 45, 384);

    pdf.text(
      "Product",
      65,
      384
    );

    pdf.text(
      "HSN",
      205,
      384
    );

    pdf.text(
      "Qty",
      255,
      384
    );

    pdf.text(
      "Rate",
      295,
      384
    );

    pdf.text(
      "GST%",
      355,
      384
    );

    pdf.text(
      "Taxable",
      410,
      384
    );

    pdf.text(
      "Total",
      490,
      384
    );

    /* =========================================
       ITEMS
    ========================================= */

    let y = 408;

    pdf
      .font("Times-Roman")
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
       GST SUMMARY
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
      .font("Times-Bold")
      .fontSize(12)
      .text(
        "GST Summary",
        340,
        summaryTop + 12
      );

    pdf
      .font("Times-Roman")
      .fontSize(10)
      .text(
        "Taxable Amount",
        340,
        summaryTop + 40
      );

    pdf.text(
      money(gst.taxable),
      475,
      summaryTop + 40
    );

    pdf.text(
      "Discount",
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
      "CGST",
      340,
      summaryTop + 84
    );

    pdf.text(
      money(gst.cgst),
      475,
      summaryTop + 84
    );

    pdf.text(
      "SGST",
      340,
      summaryTop + 106
    );

    pdf.text(
      money(gst.sgst),
      475,
      summaryTop + 106
    );

    pdf.text(
      "IGST",
      340,
      summaryTop + 128
    );

    pdf.text(
      money(gst.igst),
      475,
      summaryTop + 128
    );

    pdf
      .font("Times-Bold")
      .fontSize(13)
      .fillColor("#16a34a")
      .text(
        "Grand Total",
        340,
        summaryTop + 152
      );

    pdf.text(
      money(
        order.billing?.grandTotal
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
      .font("Times-Bold")
      .fillColor("#111827")
      .fontSize(11)
      .text(
        "Declaration",
        40,
        declarationTop
      );

    pdf
      .font("Times-Roman")
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
        company.signatureUrl.replace(/^\/+/, "")
      );
      
      console.log("SIGN PATH:", signPath);
      console.log("SIGN EXISTS:", fs.existsSync(signPath));

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
      .font("Times-Bold")
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
      .font("Times-Roman")
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
