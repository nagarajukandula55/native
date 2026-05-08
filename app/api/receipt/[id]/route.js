export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

/* ================= MONEY FORMAT ================= */

const money = (n) =>
  `₹${Number(n || 0).toFixed(2)}`;

/* ================= SAFE IMAGE ================= */

const getImagePath = (imgPath) => {
  try {
    if (!imgPath) return null;

    const clean = imgPath.startsWith("/")
      ? imgPath.substring(1)
      : imgPath;

    const fullPath = path.join(
      process.cwd(),
      "public",
      clean.replace("public/", "")
    );

    if (fs.existsSync(fullPath)) {
      return fullPath;
    }

    return null;
  } catch {
    return null;
  }
};

/* ================= API ================= */

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    /* ================= FIND ORDER ================= */

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

    /* ================= COMPANY ================= */

    const company =
      await CompanySettings.findOne().lean();

    /* ================= PDF INIT ================= */

    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const buffers = [];

    pdf.on("data", buffers.push.bind(buffers));

    /* =======================================================
       HEADER
    ======================================================= */

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
          "LOGO LOAD ERROR:",
          e.message
        );
      }
    }

    pdf
      .fontSize(20)
      .fillColor("#000")
      .text(
        company?.companyName || "Native",
        115,
        38
      );

    pdf
      .fontSize(10)
      .fillColor("#555")
      .text(
        company?.brandTagline || "",
        115,
        63
      );

    pdf.moveDown(2);

    /* =======================================================
       RECEIPT TITLE
    ======================================================= */

    pdf
      .fontSize(24)
      .fillColor("#000")
      .text("PAYMENT RECEIPT", {
        align: "right",
      });

    pdf.moveDown();

    /* =======================================================
       COMPANY INFO
    ======================================================= */

    pdf
      .fontSize(9)
      .fillColor("#444")
      .text(
        company?.addressLine1 || ""
      );

    if (company?.addressLine2) {
      pdf.text(company.addressLine2);
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

    /* =======================================================
       RECEIPT DETAILS
    ======================================================= */

    pdf
      .fontSize(12)
      .fillColor("#000")
      .text("Receipt Details");

    pdf.moveDown(0.5);

    pdf
      .fontSize(10)
      .fillColor("#222");

    pdf.text(
      `Receipt No: ${
        order.receipt?.receiptNumber ||
        "NA"
      }`
    );

    pdf.text(
      `Invoice No: ${
        order.invoice?.invoiceNumber ||
        "NA"
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

    /* =======================================================
       CUSTOMER DETAILS
    ======================================================= */

    pdf
      .fontSize(12)
      .fillColor("#000")
      .text("Received From");

    pdf.moveDown(0.5);

    pdf
      .fontSize(10)
      .fillColor("#222");

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

    /* =======================================================
       PAYMENT DETAILS
    ======================================================= */

    pdf
      .fontSize(12)
      .fillColor("#000")
      .text("Payment Details");

    pdf.moveDown(0.5);

    pdf
      .fontSize(10)
      .fillColor("#222");

    pdf.text(
      `Payment Method: ${
        order.payment?.method || "-"
      }`
    );

    pdf.text(
      `Payment Status: ${
        order.payment?.status || "-"
      }`
    );

    pdf.text(
      `Amount Paid: ${money(
        order.payment?.amountPaid ||
          order.amount
      )}`
    );

    if (
      order.payment?.transactionId
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

    /* =======================================================
       ORDER SUMMARY
    ======================================================= */

    pdf
      .fontSize(12)
      .fillColor("#000")
      .text("Order Summary");

    pdf.moveDown(0.5);

    pdf
      .fontSize(10)
      .fillColor("#222");

    pdf.text(
      `Items Count: ${
        order.items?.length || 0
      }`
    );

    pdf.text(
      `Subtotal: ${money(
        order.billing?.subtotal
      )}`
    );

    pdf.text(
      `GST: ${money(
        order.billing?.totalGST
      )}`
    );

    pdf.text(
      `Grand Total: ${money(
        order.billing?.grandTotal ||
          order.amount
      )}`
    );

    pdf.moveDown(2);

    /* =======================================================
       DECLARATION
    ======================================================= */

    pdf
      .fontSize(11)
      .fillColor("#000")
      .text("Declaration");

    pdf.moveDown(0.5);

    pdf
      .fontSize(9)
      .fillColor("#555")
      .text(
        "This is a computer generated payment receipt and does not require physical signature."
      );

    pdf.moveDown(4);

    /* =======================================================
       SIGNATURE
    ======================================================= */

    const signPath = getImagePath(
      company?.signatureUrl
    );

    if (signPath) {
      try {
        pdf.image(
          signPath,
          400,
          pdf.y,
          {
            width: 110,
          }
        );
      } catch (e) {
        console.log(
          "SIGN LOAD ERROR:",
          e.message
        );
      }
    }

    pdf.moveDown(4);

    pdf
      .fontSize(10)
      .fillColor("#000")
      .text(
        "Authorised Signatory",
        390
      );

    /* =======================================================
       FOOTER
    ======================================================= */

    pdf.moveDown(4);

    pdf
      .fontSize(8)
      .fillColor("#777")
      .text(
        "Thank you for shopping with us.",
        {
          align: "center",
        }
      );

    /* ================= END PDF ================= */

    pdf.end();

    /* ================= BUFFER ================= */

    const pdfBuffer =
      await new Promise((resolve) => {
        const chunks = [];

        pdf.on("data", (chunk) =>
          chunks.push(chunk)
        );

        pdf.on("end", () => {
          resolve(
            Buffer.concat(chunks)
          );
        });
      });

    /* ================= RESPONSE ================= */

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition": `inline; filename=${
          order.receipt
            ?.receiptNumber ||
          order.orderId
        }.pdf`,
      },
    });
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
