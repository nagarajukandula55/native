export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

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
   PACKING SLIP API
========================================= */

export async function GET(
  req,
  { params }
) {
  try {

    await dbConnect();

    const order = await Order.findOne({
      orderId: params.id,
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

    const company =
      await CompanySettings.findOne().lean();

    /* =========================================
       PDF INIT
    ========================================= */

    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
      compress: true,
    });

    const chunks = [];

    pdf.on("data", (c) => chunks.push(c));

    /* =========================================
       WATERMARK
    ========================================= */

    pdf.save();

    pdf.opacity(0.04);

    try {

      const watermarkPath = path.join(
        process.cwd(),
        "public",
        company?.invoiceWatermarkUrl ||
          "/uploads/invoice-watermark.jpg"
      );

      if (
        fs.existsSync(watermarkPath)
      ) {

        pdf.image(
          watermarkPath,
          140,
          240,
          {
            width: 280,
          }
        );
      }

    } catch (e) {
      console.log(
        "WATERMARK ERROR:",
        e.message
      );
    }

    pdf.restore();

    /* =========================================
       HEADER LOGO
    ========================================= */

    try {

      const logoPath = path.join(
        process.cwd(),
        "public",
        company?.invoiceLogoUrl ||
          "/uploads/invoice-logo.jpg"
      );

      if (
        fs.existsSync(logoPath)
      ) {

        pdf.image(
          logoPath,
          40,
          35,
          {
            width: 60,
          }
        );
      }

    } catch (e) {
      console.log(
        "LOGO ERROR:",
        e.message
      );
    }

    /* =========================================
       COMPANY
    ========================================= */

    pdf
      .fillColor("#111827")
      .fontSize(22)
      .text(
        company?.companyName ||
          "NATIVE",
        120,
        38
      );

    pdf
      .fillColor("#6b7280")
      .fontSize(11)
      .text(
        company?.tagline ||
          "",
        120,
        66
      );

    pdf
      .fillColor("#4b5563")
      .fontSize(10)
      .text(
        company?.addressLine1 || "",
        120,
        88
      );

    pdf.text(
      `City: ${
        company?.city || "-"
      }`,
      120,
      104
    );

    pdf.text(
      `State: ${
        company?.state || "-"
      }`,
      120,
      120
    );

    pdf.text(
      `Pin Code: ${
        company?.pincode || "-"
      }`,
      120,
      136
    );

    pdf.text(
      `Phone: ${
        company?.phone || "-"
      }`,
      120,
      152
    );

    /* =========================================
       PACKING SLIP BOX
    ========================================= */

    pdf
      .roundedRect(
        365,
        35,
        190,
        145,
        10
      )
      .fillAndStroke(
        "#f9fafb",
        "#d1d5db"
      );

    pdf
      .fillColor("#111827")
      .fontSize(18)
      .text(
        "PACKING SLIP",
        392,
        52
      );

    pdf
      .fillColor("#374151")
      .fontSize(10);

    pdf.text(
      "Order ID",
      388,
      92
    );

    pdf.text(
      order.orderId,
      388,
      106
    );

    pdf.text(
      "Order Date",
      388,
      128
    );

    pdf.text(
      new Date(
        order.createdAt
      ).toLocaleDateString(),
      388,
      142
    );

    /* =========================================
       LINE
    ========================================= */

    line(pdf, 195);

    /* =========================================
       BILL TO
    ========================================= */

    pdf
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Customer Details",
        40,
        212
      );

    pdf
      .fillColor("#374151")
      .fontSize(10)
      .text(
        order.address?.name || "",
        40,
        236
      );

    pdf.text(
      order.address?.phone || "",
      40,
      252
    );

    pdf.text(
      order.address?.address || "",
      40,
      268,
      {
        width: 220,
      }
    );

    pdf.text(
      `City: ${
        order.address?.city || "-"
      }`,
      40,
      318
    );

    pdf.text(
      `State: ${
        order.address?.state || "-"
      }`,
      40,
      334
    );

    pdf.text(
      `Pin Code: ${
        order.address?.pincode ||
        "-"
      }`,
      40,
      350
    );

    /* =========================================
       SHIPPING DETAILS
    ========================================= */

    pdf
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "Shipping Details",
        330,
        212
      );

    pdf
      .fillColor("#374151")
      .fontSize(10);

    pdf.text(
      `Dispatch Type: ${
        order.shipping
          ?.dispatchType || "-"
      }`,
      330,
      236
    );

    pdf.text(
      `Courier: ${
        order.shipping
          ?.courierPartner || "-"
      }`,
      330,
      254
    );

    pdf.text(
      `AWB Number: ${
        order.shipping
          ?.awbNumber || "-"
      }`,
      330,
      272
    );

    pdf.text(
      `Tracking Status: ${
        order.shipping
          ?.trackingStatus ||
        "-"
      }`,
      330,
      290
    );

    /* =========================================
       LINE
    ========================================= */

    line(pdf, 385);

    /* =========================================
       TABLE
    ========================================= */

    const tableTop = 400;

    pdf
      .rect(
        40,
        tableTop,
        515,
        28
      )
      .fill("#111827");

    pdf
      .fillColor("#ffffff")
      .fontSize(9);

    pdf.text("#", 45, 410);

    pdf.text(
      "Product",
      70,
      410
    );

    pdf.text(
      "SKU",
      260,
      410
    );

    pdf.text(
      "HSN",
      350,
      410
    );

    pdf.text(
      "Qty",
      450,
      410
    );

    pdf.text(
      "Amount",
      500,
      410
    );

    let y = 438;

    pdf
      .fillColor("#111827")
      .fontSize(10);

    order.items?.forEach(
      (item, idx) => {

        pdf
          .rect(
            40,
            y - 6,
            515,
            32
          )
          .stroke("#e5e7eb");

        pdf.text(
          String(idx + 1),
          45,
          y + 4
        );

        pdf.text(
          item.name || "",
          70,
          y + 4,
          {
            width: 170,
          }
        );

        pdf.text(
          item.snapshot?.sku ||
            "-",
          260,
          y + 4
        );

        pdf.text(
          item.snapshot?.hsn ||
            "-",
          350,
          y + 4
        );

        pdf.text(
          String(item.qty || 1),
          455,
          y + 4
        );

        pdf.text(
          money(item.total),
          495,
          y + 4
        );

        y += 32;
      }
    );

    /* =========================================
       TOTAL BOX
    ========================================= */

    const summaryTop = y + 20;

    pdf
      .roundedRect(
        355,
        summaryTop,
        200,
        95,
        10
      )
      .fillAndStroke(
        "#f9fafb",
        "#d1d5db"
      );

    pdf
      .fillColor("#111827")
      .fontSize(12)
      .text(
        "Order Summary",
        370,
        summaryTop + 12
      );

    pdf
      .fillColor("#374151")
      .fontSize(10)
      .text(
        `Total Items`,
        370,
        summaryTop + 40
      );

    pdf.text(
      String(
        order.items?.length || 0
      ),
      500,
      summaryTop + 40
    );

    pdf.text(
      `Grand Total`,
      370,
      summaryTop + 62
    );

    pdf.text(
      money(
        order.billing
          ?.grandTotal || 0
      ),
      470,
      summaryTop + 62
    );

    /* =========================================
       FOOTER
    ========================================= */

    pdf
      .fillColor("#6b7280")
      .fontSize(8)
      .text(
        "Thanks for Shopping With Native ❤️",
        40,
        780,
        {
          width: 515,
          align: "center",
        }
      );

    /* =========================================
       END PDF
    ========================================= */

    pdf.end();

    const buffer =
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
      buffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename=PACKING-SLIP-${order.orderId}.pdf`,
        },
      }
    );

  } catch (err) {

    console.error(
      "PACKING SLIP ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to generate packing slip",
      },
      { status: 500 }
    );
  }
}
