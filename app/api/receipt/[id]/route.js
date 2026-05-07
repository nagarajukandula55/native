export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

const money = (n) =>
  `₹${Number(n || 0).toFixed(2)}`;

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;

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

    const company =
      await CompanySettings.findOne().lean();

    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const buffers = [];

    pdf.on("data", buffers.push.bind(buffers));

    /* ================= HEADER ================= */

    if (company?.logoUrl) {
      try {
        pdf.image(
          `public${company.logoUrl}`,
          40,
          35,
          {
            width: 55,
          }
        );
      } catch (e) {}
    }

    pdf
      .fontSize(20)
      .text(
        company?.companyName || "Native",
        110,
        40
      );

    pdf.moveDown(2);

    pdf
      .fontSize(24)
      .text("PAYMENT RECEIPT", {
        align: "right",
      });

    pdf.moveDown();

    /* ================= RECEIPT ================= */

    pdf.text(
      `Receipt No: ${
        order.receipt?.receiptNumber || "NA"
      }`
    );

    pdf.text(
      `Order ID: ${order.orderId}`
    );

    pdf.text(
      `Date: ${new Date(
        order.payment?.paidAt ||
          order.updatedAt
      ).toLocaleString()}`
    );

    pdf.moveDown();

    /* ================= CUSTOMER ================= */

    pdf
      .fontSize(12)
      .text("Received From");

    pdf
      .fontSize(10)
      .text(order.address?.name || "");

    pdf.text(order.address?.phone || "");

    pdf.text(order.address?.address || "");

    pdf.moveDown();

    /* ================= PAYMENT ================= */

    pdf
      .fontSize(12)
      .text("Payment Details");

    pdf
      .fontSize(10)
      .text(
        `Payment Method: ${
          order.payment?.method || "-"
        }`
      );

    pdf.text(
      `Amount Paid: ${money(
        order.amount
      )}`
    );

    pdf.text(
      `Payment Status: ${
        order.payment?.status || "-"
      }`
    );

    if (order.payment?.utr) {
      pdf.text(
        `UTR: ${order.payment.utr}`
      );
    }

    if (
      order.payment?.razorpay_payment_id
    ) {
      pdf.text(
        `Transaction ID: ${order.payment.razorpay_payment_id}`
      );
    }

    pdf.moveDown(2);

    /* ================= DECLARATION ================= */

    pdf
      .fontSize(11)
      .text("Declaration");

    pdf
      .fontSize(9)
      .text(
        "This is a system generated payment receipt."
      );

    pdf.moveDown(3);

    /* ================= FOOTER ================= */

    if (company?.signatureUrl) {
      try {
        pdf.image(
          `public${company.signatureUrl}`,
          420,
          pdf.y,
          {
            width: 100,
          }
        );
      } catch (e) {}
    }

    pdf.moveDown(4);

    pdf.text(
      "Authorised Signatory",
      400
    );

    pdf.end();

    const pdfBuffer =
      await new Promise((resolve) => {
        const chunks = [];

        pdf.on("data", (chunk) =>
          chunks.push(chunk)
        );

        pdf.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
      });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type":
          "application/pdf",

        "Content-Disposition": `inline; filename=${order.receipt?.receiptNumber || order.orderId}.pdf`,
      },
    });
  } catch (err) {
    console.log("RECEIPT PDF ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate receipt",
      },
      { status: 500 }
    );
  }
}
