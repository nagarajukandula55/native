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
   SAFE IMAGE
========================================= */

const getImagePath = (imgPath) => {

  try {

    if (!imgPath) return null;

    const clean =
      imgPath.startsWith("/")
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

/* =========================================
   LABEL API
========================================= */

export async function GET(
  req,
  { params }
) {

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

    /* =========================================
       PDF
    ========================================= */

    const pdf = new PDFDocument({

      size: [400, 600],

      margin: 20,
    });

    const chunks = [];

    pdf.on(
      "data",
      (chunk) => {
        chunks.push(chunk);
      }
    );

    /* =========================================
       BORDER
    ========================================= */

    pdf
      .roundedRect(
        10,
        10,
        380,
        580,
        12
      )
      .lineWidth(1)
      .stroke("#d1d5db");

    /* =========================================
       LOGO
    ========================================= */

    const logoPath = getImagePath(
      company?.logoUrl
    );

    if (logoPath) {

      try {

        pdf.image(
          logoPath,
          20,
          20,
          {
            width: 55,
          }
        );

      } catch (e) {

        console.log(
          "LABEL LOGO ERROR:",
          e.message
        );
      }
    }

    /* =========================================
       COMPANY
    ========================================= */

    pdf
      .fontSize(18)
      .fillColor("#111827")
      .text(
        company?.companyName ||
          "Native",
        90,
        25
      );

    pdf
      .fontSize(10)
      .fillColor("#6b7280")
      .text(
        company?.brandTagline || "",
        90,
        48
      );

    pdf.moveDown(4);

    /* =========================================
       FROM SECTION
    ========================================= */

    pdf
      .roundedRect(
        20,
        95,
        360,
        85,
        10
      )
      .fill("#f3f4f6");

    pdf
      .fillColor("#111827")
      .fontSize(12)
      .text(
        "FROM",
        30,
        108
      );

    pdf
      .fontSize(10)
      .fillColor("#374151")
      .text(
        company?.addressLine1 || "",
        30,
        128
      );

    pdf.text(
      `${company?.city || ""} - ${
        company?.pincode || ""
      }`
    );

    /* =========================================
       TO SECTION
    ========================================= */

    pdf
      .roundedRect(
        20,
        200,
        360,
        150,
        10
      )
      .fill("#eff6ff");

    pdf
      .fillColor("#111827")
      .fontSize(13)
      .text(
        "SHIP TO",
        30,
        215
      );

    pdf
      .fontSize(12)
      .fillColor("#000")
      .text(
        order.address?.name || "",
        30,
        240
      );

    pdf
      .fontSize(11)
      .fillColor("#374151")
      .text(
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

    /* =========================================
       ORDER DETAILS
    ========================================= */

    pdf
      .roundedRect(
        20,
        370,
        360,
        120,
        10
      )
      .fill("#f9fafb");

    pdf
      .fillColor("#111827")
      .fontSize(12)
      .text(
        "SHIPMENT DETAILS",
        30,
        385
      );

    pdf
      .fontSize(11)
      .fillColor("#374151")
      .text(
        `Order ID: ${order.orderId}`,
        30,
        415
      );

    pdf.text(
      `AWB: ${
        order.shipping
          ?.awbNumber ||
        "NOT GENERATED"
      }`
    );

    pdf.text(
      `Courier: ${
        order.shipping
          ?.courierPartner ||
        "-"
      }`
    );

    pdf.text(
      `Payment: ${
        order.payment?.method ||
        "-"
      }`
    );

    /* =========================================
       HANDLE WITH CARE
    ========================================= */

    pdf
      .roundedRect(
        20,
        515,
        360,
        50,
        10
      )
      .fill("#111827");

    pdf
      .fontSize(18)
      .fillColor("#ffffff")
      .text(
        "HANDLE WITH CARE",
        0,
        530,
        {
          align: "center",
        }
      );

    /* =========================================
       FOOTER
    ========================================= */

    pdf
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(
        "Generated by Native Fulfillment System",
        0,
        575,
        {
          align: "center",
        }
      );

    /* =========================================
       END
    ========================================= */

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
          err.message ||
          "Shipping label failed",
      },
      { status: 500 }
    );
  }
}
