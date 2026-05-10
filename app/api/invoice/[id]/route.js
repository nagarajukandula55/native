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
   GET INVOICE PDF
========================================= */

export async function GET(
  req,
  { params }
) {
  try {
    await dbConnect();

    const { id } = params;

    /* =========================================
       FIND ORDER
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
       COMPANY SETTINGS
    ========================================= */

    const company =
      await CompanySettings.findOne().lean();

    /* =========================================
       PDF INIT
    ========================================= */

    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks = [];

    pdf.on("data", (chunk) => {
      chunks.push(chunk);
    });

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

        if (fs.existsSync(logoPath)) {
          pdf.image(
            logoPath,
            40,
            35,
            {
              width: 55,
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
      .fontSize(20)
      .fillColor("#111")
      .text(
        company?.companyName ||
          "Native",
        110,
        40
      );

    pdf
      .fontSize(10)
      .fillColor("#666")
      .text(
        company?.brandTagline || "",
        110,
        65
      );

    pdf.moveDown(2);

    /* =========================================
       INVOICE TITLE
    ========================================= */

    pdf
      .fontSize(22)
      .fillColor("#111")
      .text("TAX INVOICE", {
        align: "right",
      });

    pdf.moveDown();

    /* =========================================
       COMPANY DETAILS
    ========================================= */

    pdf
      .fontSize(10)
      .fillColor("#111")
      .text(
        company?.addressLine1 || ""
      );

    pdf.text(
      `${company?.city || ""} - ${
        company?.pincode || ""
      }`
    );

    pdf.text(
      `GSTIN: ${
        company?.gstin || "-"
      }`
    );

    pdf.text(
      `Phone: ${
        company?.phone || "-"
      }`
    );

    pdf.text(
      `Email: ${
        company?.email || "-"
      }`
    );

    pdf.moveDown();

    /* =========================================
       ORDER DETAILS
    ========================================= */

    pdf.text(
      `Invoice No: ${
        order.invoice
          ?.invoiceNumber || "NA"
      }`
    );

    pdf.text(
      `Order ID: ${order.orderId}`
    );

    pdf.text(
      `Date: ${new Date(
        order.createdAt
      ).toLocaleString()}`
    );

    pdf.text(
      `Payment Method: ${
        order.payment?.method || "-"
      }`
    );

    if (
      order.payment
        ?.razorpay_payment_id
    ) {
      pdf.text(
        `Transaction ID: ${order.payment.razorpay_payment_id}`
      );
    }

    pdf.moveDown();

    /* =========================================
       BILL TO
    ========================================= */

    pdf
      .fontSize(12)
      .fillColor("#111")
      .text("Bill To");

    pdf
      .fontSize(10)
      .text(
        order.address?.name || ""
      );

    pdf.text(
      order.address?.phone || ""
    );

    pdf.text(
      order.address?.address || ""
    );

    pdf.text(
      `${order.address?.city || ""} - ${
        order.address?.pincode || ""
      }`
    );

    pdf.text(
      order.address?.state || ""
    );

    if (order.address?.gstNumber) {
      pdf.text(
        `GSTIN: ${order.address.gstNumber}`
      );
    }

    pdf.moveDown(1.5);

    /* =========================================
       TABLE HEADER
    ========================================= */

    const tableTop = pdf.y;

    pdf
      .rect(40, tableTop - 5, 520, 25)
      .fill("#f3f4f6");

    pdf.fillColor("#111");

    pdf
      .fontSize(10)
      .text("#", 45, tableTop);

    pdf.text("Item", 70, tableTop);

    pdf.text("HSN", 250, tableTop);

    pdf.text("Qty", 320, tableTop);

    pdf.text("GST%", 380, tableTop);

    pdf.text("Total", 460, tableTop);

    let y = tableTop + 30;

    /* =========================================
       ITEMS
    ========================================= */

    order.items?.forEach(
      (item, idx) => {
        pdf
          .rect(40, y - 5, 520, 24)
          .stroke("#e5e7eb");

        pdf.text(
          String(idx + 1),
          45,
          y
        );

        pdf.text(
          item.name || "",
          70,
          y,
          {
            width: 160,
          }
        );

        pdf.text(
          item.snapshot?.hsn ||
            "-",
          250,
          y
        );

        pdf.text(
          String(item.qty || 1),
          320,
          y
        );

        pdf.text(
          `${
            item.gstPercent || 0
          }%`,
          380,
          y
        );

        pdf.text(
          money(item.total),
          460,
          y
        );

        y += 28;
      }
    );

    pdf.y = y + 20;

    /* =========================================
       SUMMARY
    ========================================= */

    pdf
      .fontSize(10)
      .fillColor("#111");

    pdf.text(
      `Subtotal: ${money(
        order.billing?.subtotal
      )}`,
      {
        align: "right",
      }
    );

    pdf.text(
      `Discount: ${money(
        order.billing?.discount
      )}`,
      {
        align: "right",
      }
    );

    if (
      Number(
        order.billing?.igst || 0
      ) > 0
    ) {
      pdf.text(
        `IGST: ${money(
          order.billing?.igst
        )}`,
        {
          align: "right",
        }
      );
    } else {
      pdf.text(
        `CGST: ${money(
          order.billing?.cgst
        )}`,
        {
          align: "right",
        }
      );

      pdf.text(
        `SGST: ${money(
          order.billing?.sgst
        )}`,
        {
          align: "right",
        }
      );
    }

    pdf.moveDown(0.5);

    pdf
      .fontSize(15)
      .fillColor("#16a34a")
      .text(
        `Grand Total: ${money(
          order.billing
            ?.grandTotal
        )}`,
        {
          align: "right",
        }
      );

    pdf.moveDown(2);

    /* =========================================
       DECLARATION
    ========================================= */

    pdf
      .fontSize(11)
      .fillColor("#111")
      .text("Declaration");

    pdf
      .fontSize(9)
      .fillColor("#555")
      .text(
        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."
      );

    pdf.moveDown(2);

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
            420,
            pdf.y,
            {
              width: 100,
            }
          );
        }
      } catch (e) {
        console.log(
          "SIGNATURE ERROR:",
          e.message
        );
      }
    }

    pdf.moveDown(4);

    pdf
      .fontSize(10)
      .fillColor("#111")
      .text(
        "Authorised Signatory",
        400
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

          "Content-Disposition": `inline; filename=${
            order.invoice
              ?.invoiceNumber ||
            order.orderId
          }.pdf`,
        },
      }
    );
  } catch (err) {
    console.log(
      "INVOICE PDF ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate invoice",
      },
      { status: 500 }
    );
  }
}
