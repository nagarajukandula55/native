export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import path from "path";
import fs from "fs";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

/* =========================================
   MONEY FORMAT
========================================= */

const money = (n) =>
  `₹${Number(n || 0).toFixed(2)}`;

/* =========================================
   SAFE IMAGE PATH
========================================= */

const getImagePath = (imgPath) => {
  try {
    if (!imgPath) return null;

    const cleanPath =
      imgPath.startsWith("/")
        ? imgPath.substring(1)
        : imgPath;

    const fullPath = path.join(
      process.cwd(),
      "public",
      cleanPath.replace("public/", "")
    );

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }

    return null;
  } catch (err) {
    console.log(
      "IMAGE PATH ERROR:",
      err
    );

    return null;
  }
};

/* =========================================
   RECEIPT PDF
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

    const logoPath = getImagePath(
      company?.logoUrl
    );

    if (logoPath) {
      try {
        pdf.image(
          logoPath,
          40,
          30,
          {
            width: 60,
          }
        );
      } catch (e) {
        console.log(
          "LOGO ERROR:",
          e.message
        );
      }
    }

    pdf
      .fontSize(22)
      .fillColor("#111111")
      .text(
        company?.companyName ||
          "Native",
        115,
        38
      );

    pdf
      .fontSize(10)
      .fillColor("#666666")
      .text(
        company?.brandTagline || "",
        115,
        65
      );

    pdf.moveDown(2);

    /* =========================================
       TITLE
    ========================================= */

    pdf
      .fontSize(24)
      .fillColor("#000000")
      .text("PAYMENT RECEIPT", {
        align: "right",
      });

    pdf.moveDown(2);

    /* =========================================
       COMPANY INFO
    ========================================= */

    pdf
      .fontSize(9)
      .fillColor("#444444")
      .text(
        company?.addressLine1 || ""
      );

    if (company?.addressLine2) {
      pdf.text(
        company.addressLine2
      );
    }

    pdf.text(
      `${company?.city || ""} - ${
        company?.pincode || ""
      }`
    );

    if (company?.gstin) {
      pdf.text(
        `GSTIN: ${company.gstin}`
      );
    }

    if (company?.phone) {
      pdf.text(
        `Phone: ${company.phone}`
      );
    }

    if (company?.email) {
      pdf.text(
        `Email: ${company.email}`
      );
    }

    pdf.moveDown(2);

    /* =========================================
       RECEIPT DETAILS
    ========================================= */

    pdf
      .fontSize(13)
      .fillColor("#000000")
      .text("Receipt Details");

    pdf.moveDown(0.7);

    pdf
      .fontSize(10)
      .fillColor("#222222");

    pdf.text(
      `Receipt No: ${
        order.receipt
          ?.receiptNumber || "NA"
      }`
    );

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
      `Receipt Date: ${new Date(
        order.payment?.paidAt ||
          order.updatedAt
      ).toLocaleString()}`
    );

    pdf.moveDown(1.5);

    /* =========================================
       CUSTOMER
    ========================================= */

    pdf
      .fontSize(13)
      .fillColor("#000000")
      .text("Received From");

    pdf.moveDown(0.7);

    pdf
      .fontSize(10)
      .fillColor("#222222");

    pdf.text(
      order.address?.name || ""
    );

    if (order.address?.phone) {
      pdf.text(
        order.address.phone
      );
    }

    if (order.address?.email) {
      pdf.text(
        order.address.email
      );
    }

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

    pdf.moveDown(2);

    /* =========================================
       PAYMENT DETAILS
    ========================================= */

    pdf
      .fontSize(13)
      .fillColor("#000000")
      .text("Payment Details");

    pdf.moveDown(0.7);

    pdf
      .fontSize(10)
      .fillColor("#222222");

    pdf.text(
      `Payment Method: ${
        order.payment?.method ||
        "-"
      }`
    );

    pdf.text(
      `Payment Status: ${
        order.payment?.status ||
        "-"
      }`
    );

    pdf.text(
      `Amount Paid: ${money(
        order.payment
          ?.amountPaid ||
          order.amount
      )}`
    );

    if (
      order.payment
        ?.transactionId
    ) {
      pdf.text(
        `Transaction ID: ${order.payment.transactionId}`
      );
    }

    if (order.payment?.utr) {
      pdf.text(
        `UTR Number: ${order.payment.utr}`
      );
    }

    if (
      order.payment
        ?.razorpay_payment_id
    ) {
      pdf.text(
        `Razorpay Payment ID: ${order.payment.razorpay_payment_id}`
      );
    }

    pdf.moveDown(2);

    /* =========================================
       ORDER SUMMARY BOX
    ========================================= */

    const boxTop = pdf.y;

    pdf
      .roundedRect(
        40,
        boxTop,
        520,
        120,
        10
      )
      .fill("#f9fafb");

    pdf
      .fillColor("#000000")
      .fontSize(13)
      .text(
        "Order Summary",
        55,
        boxTop + 15
      );

    pdf
      .fontSize(10)
      .fillColor("#222222");

    pdf.text(
      `Items Count: ${
        order.items?.length || 0
      }`,
      55,
      boxTop + 45
    );

    pdf.text(
      `Subtotal: ${money(
        order.billing?.subtotal
      )}`,
      55,
      boxTop + 65
    );

    pdf.text(
      `GST: ${money(
        order.billing?.totalGST
      )}`,
      55,
      boxTop + 85
    );

    pdf
      .fontSize(14)
      .fillColor("#16a34a")
      .text(
        `Grand Total: ${money(
          order.billing
            ?.grandTotal ||
            order.amount
        )}`,
        330,
        boxTop + 60
      );

    pdf.y = boxTop + 150;

    /* =========================================
       DECLARATION
    ========================================= */

    pdf
      .fontSize(11)
      .fillColor("#000000")
      .text("Declaration");

    pdf.moveDown(0.5);

    pdf
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "This is a computer generated payment receipt and does not require physical signature."
      );

    pdf.moveDown(3);

    /* =========================================
       SIGNATURE
    ========================================= */

    const signPath = getImagePath(
      company?.signatureUrl
    );

    if (signPath) {
      try {
        pdf.image(
          signPath,
          390,
          pdf.y,
          {
            width: 120,
          }
        );
      } catch (e) {
        console.log(
          "SIGNATURE ERROR:",
          e.message
        );
      }
    }

    pdf.moveDown(5);

    pdf
      .fontSize(10)
      .fillColor("#000000")
      .text(
        "Authorised Signatory",
        385
      );

    /* =========================================
       FOOTER
    ========================================= */

    pdf.moveDown(5);

    pdf
      .fontSize(8)
      .fillColor("#888888")
      .text(
        "Thank you for shopping with us.",
        {
          align: "center",
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

    /* =========================================
       RESPONSE
    ========================================= */

    return new NextResponse(
      pdfBuffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition": `inline; filename=${
            order.receipt
              ?.receiptNumber ||
            order.orderId
          }.pdf`,
        },
      }
    );
  } catch (err) {
    console.log(
      "RECEIPT PDF ERROR:",
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
