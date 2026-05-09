export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

import dbConnect from "@/lib/db";

import Order from "@/models/Order";
import CompanySettings from "@/models/CompanySettings";

export async function GET(req, { params }) {

  try {

    await dbConnect();

    const order =
      await Order.findOne({
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

    const pdf = new PDFDocument({
      size: [400, 600],
      margin: 20,
    });

    const chunks = [];

    pdf.on(
      "data",
      chunks.push.bind(chunks)
    );

    /* ================= COMPANY ================= */

    pdf
      .fontSize(18)
      .text(
        company?.companyName || "Native",
        {
          align: "center",
        }
      );

    pdf.moveDown();

    /* ================= FROM ================= */

    pdf
      .fontSize(12)
      .text("FROM");

    pdf
      .fontSize(10)
      .text(
        company?.addressLine1 || ""
      );

    pdf.text(
      `${company?.city || ""} - ${company?.pincode || ""}`
    );

    pdf.moveDown(2);

    /* ================= TO ================= */

    pdf
      .fontSize(12)
      .text("SHIP TO");

    pdf
      .fontSize(11)
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
      `${order.address?.city || ""} - ${order.address?.pincode || ""}`
    );

    pdf.text(
      order.address?.state || ""
    );

    pdf.moveDown(2);

    /* ================= AWB ================= */

    pdf
      .fontSize(12)
      .text(
        `AWB: ${
          order.shipping?.awbNumber ||
          "NOT GENERATED"
        }`
      );

    pdf.text(
      `Courier: ${
        order.shipping?.courierPartner ||
        "-"
      }`
    );

    pdf.text(
      `Order: ${order.orderId}`
    );

    pdf.moveDown(3);

    /* ================= BOX ================= */

    pdf
      .rect(20, pdf.y, 350, 100)
      .stroke();

    pdf.moveDown(5);

    pdf
      .fontSize(16)
      .text(
        "HANDLE WITH CARE",
        {
          align: "center",
        }
      );

    pdf.end();

    const pdfBuffer =
      await new Promise(
        (resolve) => {

          pdf.on(
            "end",
            () => {
              resolve(
                Buffer.concat(chunks)
              );
            }
          );
        }
      );

    return new NextResponse(
      pdfBuffer,
      {
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename=shipping-label-${order.orderId}.pdf`,
        },
      }
    );

  } catch (err) {

    console.log(
      "SHIPPING LABEL ERROR:",
      err
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Shipping label failed",
      },
      { status: 500 }
    );
  }
}
